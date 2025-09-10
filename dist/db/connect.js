import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017/hangers";
// connect to mongo-db
async function connect_db() {
    try {
        await mongoose.connect(mongo_url);
        console.log("Successfully connected to MongoDB");
    }
    catch (error) {
        console.error("Connection to MongoDB failed:", error);
    }
}
export default connect_db;
//# sourceMappingURL=connect.js.map