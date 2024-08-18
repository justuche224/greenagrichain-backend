import { getVerificationTokenByEmail } from "./verificationToken";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
export const generateVerificationToken = async (email) => {
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Add 1 hour
    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
        await db.verificationToken.delete({ where: { id: existingToken.id } });
    }
    const verificationToken = await db.verificationToken.create({
        data: { email, token, expires },
    });
    return verificationToken;
};
