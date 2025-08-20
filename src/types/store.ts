export enum StoreStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface StoreTypes {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  latitude: number;
  longitude: number;
  pincode: number;
  createdAt: string;
  updatedAt: string;
}
