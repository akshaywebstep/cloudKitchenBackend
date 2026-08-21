// src/modules/admin/auth/auth.controller.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import debugHelper from "../../../core/helpers/debug";
import userRepo from "../../shared/user/user.repository";

export const login = async (req: Request, res: Response) => {
  debugHelper.debug("--- [Admin Login Controller] Start ---");
  try {
    const { username, password } = req.body;
    debugHelper.debug(
      `[Admin Login Controller] Attempting login for username: ${username}`,
    );

    const result = await AuthService.loginAdmin({
      username: username,
      password: password,
    });

    if (!result.status) {
      return res.status(401).json({
        status: false,
        message: result.message,
      });
    }

    debugHelper.debug(
      "[Admin Login Controller] Login successful, sending response.",
    );
    res.status(200).json({
      status: true,
      message: "Login successful",
      data: result.data,
    });
  } catch (error: any) {
    debugHelper.debugError(
      `[Admin Login Controller] Exception caught: ${error.message}`,
    );
    res.status(401).json({
      status: false,
      message: error.message || "Authentication failed",
    });
  } finally {
    debugHelper.debug("--- [Admin Login Controller] End ---");
  }
};

export const forgotPasswordRequest = async (req: Request, res: Response) => {
  debugHelper.debug("--- [Admin ForgotPassword] START ---");

  try {
    const { username } = req.body;

    debugHelper.debug("[Admin ForgotPassword] Step 1: Input received", {
      username,
    });

    // 🔹 Step 2: detect type (admin only logs in via email or phone)
    let type: "email" | "phone";

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    const isPhone = /^\+?[0-9]{7,15}$/.test(username);

    if (isEmail) type = "email";
    else if (isPhone) type = "phone";
    else {
      debugHelper.debugWarn(
        "[Admin ForgotPassword] Step 2 Failed: Invalid identifier type",
      );
      return res.status(400).json({
        status: false,
        message: "Invalid username. Must be a valid email or phone number.",
      });
    }

    debugHelper.debug(
      "[Admin ForgotPassword] Step 2: Identifier type detected",
      { type },
    );

    // 🔹 Step 3: fetch admin
    const result = await AuthService.getUserByUsername(username, type);

    debugHelper.debug("[Admin ForgotPassword] Step 3: Admin lookup result", {
      found: !!result?.data,
    });

    if (!result.status || !result.data) {
      debugHelper.debugWarn(
        "[Admin ForgotPassword] Step 3 Failed: Admin not found",
      );
      return res.status(404).json({
        status: false,
        message: "Admin does not exist",
      });
    }

    const admin = result.data;

    // 🔹 Step 4: generate token
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    debugHelper.debug("[Admin ForgotPassword] Step 4: Token generated", {
      expiresAt: expiry,
    });

    // 🔹 Step 5: save token
    await userRepo.update(admin.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: expiry,
    });

    debugHelper.debug("[Admin ForgotPassword] Step 5: Token saved to DB", {
      adminId: admin.id,
    });

    // 🔹 Step 6: create reset link
    const resetLink = `https://yourdomain.com/admin/reset-password?token=${rawToken}`;

    debugHelper.debug(
      "[Admin ForgotPassword] Step 6: Reset link created",
      resetLink,
    );

    // TODO: send email

    debugHelper.debug("[Admin ForgotPassword] SUCCESS");

    return res.status(200).json({
      status: true,
      message: "A reset link has been sent.",
      data: {
        resetToken: rawToken,
        resetLink,
      },
    });
  } catch (error: any) {
    debugHelper.debugError("[Admin ForgotPassword] ERROR", {
      message: error.message,
    });

    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  } finally {
    debugHelper.debug("--- [Admin ForgotPassword] END ---");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  debugHelper.debug("--- [Admin ResetPassword] START ---");

  try {
    const { token, password } = req.body;

    debugHelper.debug("[Admin ResetPassword] Step 1: Input received");

    if (!token || !password) {
      debugHelper.debugWarn(
        "[Admin ResetPassword] Step 1 Failed: Missing token or password",
      );
      return res.status(400).json({
        status: false,
        message: "Token and password are required",
      });
    }

    // 🔹 Step 2: validate token & fetch admin
    const result = await AuthService.getUserByResetToken(token);

    debugHelper.debug("[Admin ResetPassword] Step 2: Token validation result", {
      valid: result.status,
    });

    if (!result.status || !result.data) {
      debugHelper.debugWarn(
        "[Admin ResetPassword] Step 2 Failed: Invalid or expired token",
      );
      return res.status(400).json({
        status: false,
        message: result.message,
      });
    }

    const admin = result.data;

    // 🔹 Step 3: hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    debugHelper.debug("[Admin ResetPassword] Step 3: Password hashed");

    // 🔹 Step 4: update password
    await userRepo.update(admin.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });

    debugHelper.debug(
      "[Admin ResetPassword] Step 4: Password updated & token cleared",
      {
        adminId: admin.id,
      },
    );

    debugHelper.debug("[Admin ResetPassword] SUCCESS");

    return res.status(200).json({
      status: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    debugHelper.debugError("[Admin ResetPassword] ERROR", {
      message: error.message,
    });

    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  } finally {
    debugHelper.debug("--- [Admin ResetPassword] END ---");
  }
};
