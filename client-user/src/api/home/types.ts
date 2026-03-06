export interface HomeProductCard {
  id: string;
  name: string;
  preview: string;
  priceCash: string;
  currency: string;
  sellerName: string;
  city: string | null;
  country: string | null;
}

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
}

export interface HomeBrand {
  id: string;
  name: string;
  photo: string | null;
  productCount: number;
}
