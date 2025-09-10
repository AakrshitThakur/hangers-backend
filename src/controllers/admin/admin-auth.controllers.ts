import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import Admin from "../../schemas/admin.schema.js";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import {
  adminSignupSchema,
  adminSigninSchema,
} from "../../schemas/zod/admin-auth.zod.js";

dotenv.config();

async function adminSignupController(req: Request, res: Response) {
  try {
    const credentials = req.body;

    // zod validations
    adminSignupSchema.parse(credentials);

    // check if user already exists
    const doesUsernameExists = await Admin.findOne({
      username: credentials.username,
    });
    if (doesUsernameExists) {
      res.status(400).json({ messge: "This username is already taken" });
      return;
    }

    // The salt is combined with the password before hashing
    const rounds = 10;
    const hPassword = await bcrypt.hash(credentials.password, rounds);

    // Create new admin
    const newAdmin = new Admin({
      username: credentials.username,
      password: hPassword,
    });
    await newAdmin.save();

    // jwt payload
    const adminCredentials = {
      id: newAdmin._id,
    };

    // generate jwt
    const SECRET_JWT_ADMIN = process.env.SECRET_JWT_ADMIN || "hangers-admin";
    const jwt = jsonwebtoken.sign(adminCredentials, SECRET_JWT_ADMIN);
    if (!jwt) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Cookies are sent via the HTTP response header
    res.cookie("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 6 * 3600000, // (6 * 1) hours
    });

    // success response
    res
      .status(200)
      .json({ message: `${newAdmin.username} has successfully signed up` });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.issues);
      res.json({ message: error.issues[0]?.message || "Validation error" });
    } else {
      console.error(error);
      res.status(400).json({ message: error as string });
    }
  }
}

async function adminSigninController(req: Request, res: Response) {
  try {
    const credentials = req.body;

    // zod validations
    adminSigninSchema.parse(credentials);

    // check if user already exists
    const admin = await Admin.findOne({
      username: credentials.username,
    });
    if (!admin) {
      res.status(404).json({ message: "Invalid credentials" });
      return;
    }

    // compare passwords
    if (!admin?.password) {
      res.status(404).json({ message: "Invalid credentials" });
      return;
    }
    const matches = await bcrypt.compare(credentials.password, admin.password);
    if (!matches) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // jwt payload
    const adminCredentials = {
      id: admin._id,
    };

    // generate jwt
    const SECRET_JWT_ADMIN = process.env.SECRET_JWT_ADMIN || "hangers-admin";
    const jwt = jsonwebtoken.sign(adminCredentials, SECRET_JWT_ADMIN);
    if (!jwt) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    // Cookies are sent via the HTTP response header
    res.cookie("jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 6 * 3600000, // (6 * 1) hours
    });

    // success response
    res
      .status(200)
      .json({ message: `${admin.username} has successfully signed in` });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.issues);
      res.json({ message: error.issues[0]?.message || "Validation error" });
    } else {
      console.error(error);
      res.status(400).json({ message: error as string });
    }
  }
}

function adminSignoutController(req: Request, res: Response) {
  try {
    // override jwt cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // 0ms
    });

    // success response
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error as string });
  }
}

export { adminSignupController, adminSigninController, adminSignoutController };
