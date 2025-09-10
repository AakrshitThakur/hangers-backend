import express from "express";
import dotenv from "dotenv";
import connect_db from "./db/connect.js";
import adminAuthRouter from "./routes/admin-auth.routes.js";
const app = express();
// enabling to use of env variables
dotenv.config();
// connect to mongo-db
connect_db();
// parsing body object
app.use(express.json());
// routers
app.use("/api/v1/admin/auth", adminAuthRouter);
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.info("Server successfully running on port", port);
});
//# sourceMappingURL=index.js.map