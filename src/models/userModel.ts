import mongoose from "mongoose";
import {
  AuthMethod,
  AdminPermission,
  UserStatus,
  UserRole,
} from "../types/user";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  permission: {
    type: String,
    enum: [
      AdminPermission.NONE,
      AdminPermission.READ,
      AdminPermission.READ_WRITE,
    ],
    default: AdminPermission.NONE,
  },
  authMethod: {
    type: [String],
    enum: [AuthMethod.NONE, AuthMethod.EMAIL_AUTH, AuthMethod.GOOGLE_AUTH],
    required: true,
  },
  role: {
    type: String,
    enum: [
      UserRole.USER,
      UserRole.ADMIN,
      UserRole.SELLER,
      UserRole.RESELLER,
      UserRole.PROJECT_MANAGER,
      UserRole.SYSTEM_ADMIN,
      UserRole.PICE_WORKER,
    ],
    default: UserRole.USER,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoggedInAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCK],
    default: UserStatus.ACTIVE,
  },
  
});

const User = mongoose.model("User", userSchema);
export default User;
