import express from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { AdminCredentialsPayload } from "./admin.types.ts";

// Augmenting new keys to Request interface
declare global {
  namespace Express {
    interface Request {
      adminCredentials?: AdminCredentialsPayload;
    }
  }
}
