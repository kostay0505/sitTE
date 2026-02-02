export type BrandBasic = {
  id: string;
  name: string;
  contact: string;
  photo: string;
  description: string;
};

export type Brand = {
  id: string;
  name: string;
  photo: string;
  contact: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  url?: string;
};

export type AvailableBrandsResponse = Brand[];
