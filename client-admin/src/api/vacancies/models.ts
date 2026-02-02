export interface Vacancy {
    id: string;
    userId: string;
    firstName: string;
    lastName: string | null;
    companyName: string;
    position: string;
    phone: string | null;
    cityId: string;
    address: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    city?: {
        id: string;
        name: string;
        country?: {
            id: string;
            name: string;
        };
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
