export enum AuthMethod {
  NONE = "none",
  EMAIL_AUTH = "email",
  GOOGLE_AUTH = "google",
  PHONE_AUTH = "phone",
}

export enum AdminPermission {
  NONE = "NONE",
  READ = "READ",
  READ_WRITE = "READ/WRITE",
}

export interface AuthToken {
  email: string;
  name?: string;
  phone?: string;
  authMethod: AuthMethod[];
}

export interface CAToken {
  id: string;
  worker: string;
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCK = "block",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SELLER = "seller",
  RESELLER = "reseller",
  PROJECT_MANAGER = "project_manager",
  SYSTEM_ADMIN = "system_admin",
  PICE_WORKER = "pice_worker",
}
