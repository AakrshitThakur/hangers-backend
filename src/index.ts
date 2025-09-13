import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect_db from "./db/connect.js";
import adminAuthRouter from "./routes/admin-auth.routes.js";
import adminClothRouter from "./routes/admin-cloth.routes.js";
import { CORS_OPTION } from "./constants/index.constants.js";

const app = express();

// enabling to use of env variables
dotenv.config();

// cross-origin requests
app.use(cors(CORS_OPTION));

// connect to mongo-db
connect_db();

// parsing body object
app.use(express.json());

// routers
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/clothes", adminClothRouter);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.info("Server successfully running on port", port);
});
