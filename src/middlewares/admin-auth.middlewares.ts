import jsonwebtoken from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import type { AdminCredentialsPayload } from "../types/admin.types.js";

dotenv.config();

const SECRET_JWT_ADMIN = process.env.SECRET_JWT_ADMIN || "hangers-admin";

async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // get all cookies
  const cookies = req.headers.cookie;
  if (!cookies) {
    res
      .status(401)
      .json({ message: "Please sign in or create an account to continue" });
    return;
  }

  // make object from string
  const cookiesObj = Object.fromEntries(
    cookies.split(";").map((c) => c.split("="))
  );

  // get jwt
  const jwt = cookiesObj?.jwt;
  if (!jwt) {
    res
      .status(401)
      .json({ message: "Please sign in or create an account to continue" });
    return;
  }

  // verify jwt
  jsonwebtoken.verify(
    jwt,
    SECRET_JWT_ADMIN,
    (error: any, decodedPayload: unknown) => {
      // Token is invalid
      if (error) {
        console.error("Token verification failed:", error.message);
        res
          .status(401)
          .json({ message: "Please sign in or create an account to continue" });
        return;
      }

      // append adminCredentials in req object
      if (typeof decodedPayload === "object") {
        req.adminCredentials = decodedPayload as AdminCredentialsPayload;
        next();
        return;
      }
      res.status(401).json({ message: "Invalid token payload" });
    }
  );
}

export { adminAuthMiddleware };
