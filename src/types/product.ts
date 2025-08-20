export enum productType {
  SALE = "sale",
  RENTAL = "rental",
  RESALE = "resale",
}

export interface ProductInput {
  name: string;
  description?: string;
  storeId: string;
  ownerId: string;
  categoryId: string;
  rentalTerms?: {
    unit?: number;
    pricePerUnit?: number;
    minduration?: string;
  }[];
  saleTerms?: {
    mrpPrice?: number;
    salePrice?: number;
    stock?: number;
  };
  type?: productType;
  image?: {
    type?: string;
    url: string;
  }[];
  location: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  avilablity?: boolean;
  rating?: number;
}
