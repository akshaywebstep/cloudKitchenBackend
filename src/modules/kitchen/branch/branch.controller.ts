import { Request, Response } from 'express';
import * as BranchService from './branch.service';
import debugHelper from '../../../core/helpers/debug';
import cityRepo from '../../shared/location/city.repository';
import stateRepo from '../../shared/location/state.repository';
import countryRepo from '../../shared/location/country.repository';
import branchRepo from './branch.repository';

const isCurrentKitchenBranch = (branch: any, kitchenId: number) =>
    Number(branch?.userId) === Number(kitchenId);

const branchAccessDenied = (res: Response) =>
    res.status(403).json({
        status: false,
        message: 'Branch does not belong to this kitchen'
    });

// =====================================================
// ✅ CREATE BRANCH
// =====================================================
export const createBranch = async (req: Request, res: Response) => {
    debugHelper.debug('=== SELECT PLAN START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };

        const kitchenId = request.kitchen.id;

        const {
            name,
            addressLine1,
            addressLine2,
            landmark,
            area,
            pincode,
            countryId,
            stateId,
            cityId,
            contactTitle,
            contactFirstName,
            contactLastName,
            contactEmail,
            contactPhone,
            cuisines
        } = request.body;

        const errors: Record<string, string> = {};

        const existing = await branchRepo.findFirst({
            where: {
                user: {
                    id: kitchenId
                },
                name: name
            }
        });

        debugHelper.debugWarn('existing', JSON.stringify(existing, null, 2));

        if (existing.status) {
            errors.name = "Branch already exists with same name";
        }

        // ===============================================
        // 🏙️ STEP 1: Validate City
        // ===============================================
        const cityResponse = await cityRepo.findUnique({
            where: { id: Number(cityId) },
            select: { stateId: true, countryId: true }
        });

        if (!cityResponse.status || !cityResponse.data) {
            errors.cityId = "City not found";
        } else {
            const city = cityResponse.data;

            if (Number(city.stateId) !== Number(stateId)) {
                errors.cityId = "City does not belong to selected state";
            }

            if (Number(city.countryId) !== Number(countryId)) {
                errors.cityId = "City does not belong to selected country";
            }
        }

        // ===============================================
        // 🏛️ STEP 2: Validate State
        // ===============================================
        const stateResponse = await stateRepo.findUnique({
            where: { id: Number(stateId) },
            select: { countryId: true }
        });

        if (!stateResponse.status || !stateResponse.data) {
            errors.stateId = "State not found";
        } else {
            const state = stateResponse.data;

            if (Number(state.countryId) !== Number(countryId)) {
                errors.stateId = "State does not belong to selected country";
            }
        }

        // ===============================================
        // 🌍 STEP 3: Validate Country
        // ===============================================
        const countryResponse = await countryRepo.findUnique({
            where: { id: Number(countryId) },
            select: { id: true }
        });

        if (!countryResponse.status || !countryResponse.data) {
            errors.countryId = "Country not found";
        }

        // ===============================================
        // ❌ RETURN ERRORS (LIKE GST FLOW)
        // ===============================================
        if (Object.keys(errors).length > 0) {
            debugHelper.debugWarn("Validation failed:", errors);

            return res.status(400).json({
                status: false,
                message: "Validation failed",
                errors
            });
        }

        debugHelper.debugWarn('req.body', JSON.stringify(req.body, null, 2));

        // --- Step 6: Prepare DB payload ---
        debugHelper.debug('[Register Controller] Calling AuthService.createKitchenService...');
        const result = await BranchService.createBranch({
            kitchenId: request.kitchen.id,
            name,
            addressLine1,
            addressLine2,
            landmark,
            area,
            pincode,
            countryId: Number(countryId),
            stateId: Number(stateId),
            cityId: Number(cityId),
            contactTitle,
            contactFirstName,
            contactLastName,
            contactEmail,
            contactPhone,
            cuisines
        });

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        return res.status(201).json({
            status: true,
            message: result.message,
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ SELECT PLAN ERROR:', error);

        return res.status(500).json({
            status: false,
            message: error.message || 'Internal server error'
        });
    } finally {
        debugHelper.debug('=== SELECT PLAN END ===');
    }
};

// =====================================================
// 📄 GET ALL BRANCHES
// =====================================================
export const getBranches = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET BRANCHES START ===');

    const request = req as Request & {
        kitchen: { id: number };
    };

    const kitchenId = request.kitchen.id;

    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await BranchService.getBranches({
            page: Number(page),
            limit: Number(limit),
            filters: {
                kitchenId
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Branches fetched successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== GET BRANCHES END ===');
    }
};

// =====================================================
// 🔍 GET SINGLE BRANCH
// =====================================================
export const getBranchById = async (req: Request, res: Response) => {
    debugHelper.debug('=== GET BRANCH BY ID START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };
        const kitchenId = request.kitchen.id;

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid branch id"
            });
        }

        const result = await BranchService.getBranchById(BigInt(id));

        if (!result.status) {
            return res.status(404).json({
                status: false,
                message: result.message
            });
        }

        if (!isCurrentKitchenBranch(result.data, kitchenId)) {
            return branchAccessDenied(res);
        }

        return res.status(200).json({
            status: true,
            message: 'Branch fetched successfully',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== GET BRANCH BY ID END ===');
    }
};

// =====================================================
// ✏️ UPDATE BRANCH
// =====================================================
export const updateBranch = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE BRANCH START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };
        const kitchenId = request.kitchen.id;

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid branch id"
            });
        }

        const existingBranch = await BranchService.getBranchById(BigInt(id));
        if (!existingBranch.status) {
            return res.status(404).json({
                status: false,
                message: existingBranch.message
            });
        }
        if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
            return branchAccessDenied(res);
        }

        const updateData = {
            ...req.body
        };

        const result = await BranchService.updateBranch(BigInt(id), updateData);

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Branch updated successfully',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== UPDATE BRANCH END ===');
    }
};

// =====================================================
// ❌ DELETE BRANCH
// =====================================================
export const deleteBranch = async (req: Request, res: Response) => {
    debugHelper.debug('=== DELETE BRANCH START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };
        const kitchenId = request.kitchen.id;

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid branch id"
            });
        }

        const existingBranch = await BranchService.getBranchById(BigInt(id));
        if (!existingBranch.status) {
            return res.status(404).json({
                status: false,
                message: existingBranch.message
            });
        }
        if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
            return branchAccessDenied(res);
        }

        const result = await BranchService.deleteBranch(BigInt(id));

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Branch deleted successfully'
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== DELETE BRANCH END ===');
    }
};

// =====================================================
// 🔄 TOGGLE STATUS
// =====================================================
export const updateBranchStatus = async (req: Request, res: Response) => {
    debugHelper.debug('=== UPDATE BRANCH STATUS START ===');

    try {
        const request = req as Request & {
            kitchen: { id: number };
        };
        const kitchenId = request.kitchen.id;

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                status: false,
                message: "Invalid branch id"
            });
        }

        const existingBranch = await BranchService.getBranchById(BigInt(id));
        if (!existingBranch.status) {
            return res.status(404).json({
                status: false,
                message: existingBranch.message
            });
        }
        if (!isCurrentKitchenBranch(existingBranch.data, kitchenId)) {
            return branchAccessDenied(res);
        }

        const { status } = req.body;

        const result = await BranchService.updateBranchStatus(BigInt(id), status);

        if (!result.status) {
            return res.status(400).json({
                status: false,
                message: result.message
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Branch status updated',
            data: result.data
        });

    } catch (error: any) {
        debugHelper.debugError('❌ Controller Error:', error);

        return res.status(500).json({
            status: false,
            message: error.message
        });

    } finally {
        debugHelper.debug('=== TOGGLE BRANCH STATUS END ===');
    }
};