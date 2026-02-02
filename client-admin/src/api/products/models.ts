export enum CurrencyList {
    RUB = 'RUB',
    USD = 'USD',
    EUR = 'EUR',
}

export enum QuantityType {
    PIECE = 'piece',
    SET = 'set',
}

export enum ProductStatus {
    MODERATION = 'moderation',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface Product {
    id: string;
    userId: string;
    name: string;
    priceCash: string;
    priceNonCash: string;
    currency: CurrencyList;
    preview: string;
    files: string[];
    description: string;
    categoryId: string;
    brandId: string;
    quantity: number;
    quantityType: QuantityType;
    status: ProductStatus;
    isActive: boolean;
    isDeleted: boolean;
    viewCount?: number;
    category?: {
        id: string;
        name: string;
    };
    brand?: {
        id: string;
        name: string;
    };
    user?: {
        tgId: string;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        city?: {
            id: string;
            name: string;
            country?: {
                id: string;
                name: string;
            };
        };
    };
}
