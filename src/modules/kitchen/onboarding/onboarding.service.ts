// src/modules/kitchen/onboarding/onboarding.service.ts

import { DocumentType, UserType } from '../../../../prisma/generated/prisma/client';
import kitchenDocumentRepo from '../kitchenDocument.repository';
import userRepo from '../../shared/user/user.repository';
import debugHelper from '../../../core/helpers/debug';

interface OnboardingData {
    kitchenId: bigint;
    fssaiNumber: string;
    gstNumber?: string;
    fssaiFile: string;
    gstFile?: string;
}

/**
 * Complete Onboarding Service
 */
export const completeOnboarding = async (data: OnboardingData) => {
    try {
        const {
            kitchenId,
            fssaiNumber,
            gstNumber,
            fssaiFile,
            gstFile
        } = data;

        debugHelper.debug(`[Onboarding Service] Starting onboarding for kitchenId: ${kitchenId}`);

        // =============================
        // 🔹 Check if already completed
        // =============================
        // 2. Fetch fresh user details from Repository
        debugHelper.debug(`[Auth Middleware] Fetching user details from Repo for ID: ${kitchenId}...`);
        const userResponse = await userRepo.findFirst({
            where: {
                id: BigInt(kitchenId),
                userType: {
                    in: [UserType.KITCHEN, UserType.KITCHEN_STAFF]
                },
            },
            select: {
                isOnboardingCompleted: true
            }
        });

        // 3. Validate if user exists in DB
        if (!userResponse.status || !userResponse.data) {
            debugHelper.debugError(`[Auth Service] Kitchen not found`);
            return {
                status: false,
                message: "User account no longer exists."
            };
        }

        const user = userResponse.data;

        if (user.isOnboardingCompleted) {
            return {
                status: true,
                message: 'Onboarding already completed'
            };
        }

        // =============================
        // 🔹 Save FSSAI (Required)
        // =============================
        debugHelper.debug('[Onboarding Service] Saving FSSAI document...');

        const fssaiResponse = await kitchenDocumentRepo.create({
            kitchen: {
                connect: { id: BigInt(kitchenId) }
            },
            type: DocumentType.FSSAI,
            documentNumber: fssaiNumber,
            documentFile: fssaiFile
        });

        if (!fssaiResponse.status) {
            debugHelper.debugError('[Onboarding Service] Failed to save FSSAI');
            return {
                status: false,
                message: 'Failed to save FSSAI document'
            };
        }

        // =============================
        // 🔹 Save GST (Optional)
        // =============================
        if (gstNumber) {
            debugHelper.debug('[Onboarding Service] Saving GST document...');

            const gstResponse = await kitchenDocumentRepo.create({
                kitchen: {
                    connect: { id: BigInt(kitchenId) }
                },
                type: DocumentType.GST,
                documentNumber: gstNumber,
                documentFile: gstFile
            });

            if (!gstResponse.status) {
                debugHelper.debugError('[Onboarding Service] Failed to save GST');
                return {
                    status: false,
                    message: 'Failed to save GST document'
                };
            }
        }

        // =============================
        // 🔹 Mark onboarding complete
        // =============================
        debugHelper.debug('[Onboarding Service] Updating user onboarding status...');

        const updateResponse = await userRepo.update(
            Number(kitchenId),
            {
                isOnboardingCompleted: true,
                onboardingCompletedAt: new Date()
            }
        );

        if (!updateResponse.status) {
            return {
                status: false,
                message: 'Failed to update onboarding status'
            };
        }

        debugHelper.debug('[Onboarding Service] Onboarding completed successfully');

        return {
            status: true,
            message: 'Onboarding completed successfully'
        };

    } catch (error: any) {
        debugHelper.debugError(`[Onboarding Service] Failed: ${error.message}`);

        return {
            status: false,
            message: 'Something went wrong during onboarding'
        };
    }
};