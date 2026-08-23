"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { signIn } from "./auth";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations";
import {
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS,
} from "@/lib/constants";
import { AuthError, CredentialsSignin } from "next-auth";
import { sendEmail } from "@/modules/notifications/send";
import { rateLimit } from "@/lib/rate-limit";
import WelcomeEmail from "../../../emails/welcome";
import VerifyEmail from "../../../emails/verify-email";
import ResetPassword from "../../../emails/reset-password";

export async function registerAction(formData: FormData) {
  const rawEmail = formData.get("email") as string;
  const rl = await rateLimit(`register:${rawEmail}`, { maxAttempts: 3, windowMs: 60_000 });
  if (!rl.success) {
    return { success: false, error: { email: ["Too many attempts. Please try again in a minute."] } };
  }

  const raw = {
    name: formData.get("name") as string,
    email: rawEmail,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: { email: ["An account with this email already exists. Try signing in instead."] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(
        Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
      ),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email — ShipKit",
    react: VerifyEmail({ name: name ?? "there", verifyUrl }),
  });

  await sendEmail({
    to: email,
    subject: "Welcome to ShipKit!",
    react: WelcomeEmail({ name: name ?? "there" }),
  });

  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const rl = await rateLimit(`login:${email}`, { maxAttempts: 5, windowMs: 60_000 });
  if (!rl.success) {
    return { success: false as const, error: "Too many login attempts. Please try again in a minute." };
  }

  const raw = { email, password: formData.get("password") as string };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid credentials" };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    return { success: false as const, error: "No account found with this email. Please check for typos or create a new account." };
  }

  if (!user.passwordHash) {
    return { success: false as const, error: "This account uses Google or GitHub sign-in. Please use that method instead." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
      return { success: false as const, error: "Please verify your email before signing in. Check your inbox for the verification link." };
    }
    if (error instanceof CredentialsSignin || error instanceof AuthError) {
      return { success: false as const, error: "Incorrect password. Please try again or reset your password." };
    }
    throw error;
  }

  return { success: true as const };
}

export async function forgotPasswordAction(formData: FormData) {
  const raw = { email: formData.get("email") as string };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Invalid email" };
  }

  const rl = await rateLimit(`forgot:${parsed.data.email}`, { maxAttempts: 2, windowMs: 60_000 });
  if (!rl.success) {
    return { success: true, message: "If an account exists, a reset link has been sent." };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    await db.passwordResetToken.deleteMany({
      where: { email: parsed.data.email },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await db.passwordResetToken.create({
      data: {
        email: parsed.data.email,
        token,
        expires: new Date(
          Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
        ),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: parsed.data.email,
      subject: "Reset your password — ShipKit",
      react: ResetPassword({ name: user.name ?? "there", resetUrl }),
    });
  }

  return { success: true, message: "If an account exists, a reset link has been sent." };
}

export async function resetPasswordAction(formData: FormData) {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { success: false, error: { token: ["Invalid or expired token"] } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.user.update({
    where: { email: resetToken.email },
    data: { passwordHash },
  });

  await db.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return { success: true };
}

export async function verifyEmailAction(token: string) {
  const verificationToken = await db.verificationToken.findFirst({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { success: false, error: "Invalid or expired token" };
  }

  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  });

  return { success: true };
}
