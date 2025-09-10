import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, minLength: 3, maxLength: 255, unique: true },
  password: { type: String, maxLength: 255 },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
