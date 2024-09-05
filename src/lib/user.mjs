import { db } from "./db.mjs";
export const getUserByEmail = async (email) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    return null;
  }
};
export const getUserById = async (id) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    return null;
  }
};

export async function updateUserOTP(email, otp, otpExpires) {
  try {
    // Update the user's OTP and otpExpires fields
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        otp: otp,
        otpExpires: otpExpires,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user OTP: ", error);
    throw new Error("Failed to update OTP.");
  }
}
