"use server";

import { registerUser } from "../services/auth.service";

export type RegisterActionResult =
  | { success: true }
  | { success: false; error: string };

export async function registerAction(
  _prevState: RegisterActionResult | null,
  formData: FormData,
): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  try {
    await registerUser(raw);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed. Please try again.";
    return { success: false, error: message };
  }
}
