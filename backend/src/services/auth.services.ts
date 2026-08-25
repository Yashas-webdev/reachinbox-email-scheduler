import  { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/prisma.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(googleClientId);

export const verifyGoogleUser = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    ...(googleClientId ? { audience: googleClientId } : {}),
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google token");
  }

  let user = await prisma.user.findUnique({
    where: {
      googleId: payload.sub,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: payload.sub,
        name: payload.name ?? "Unknown User",
        email: payload.email,
        avatar: payload.picture ?? null,
      },
    });
  }

  return user;
};