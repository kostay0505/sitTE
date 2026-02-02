export interface Resume {
    id: string;
    userId: string;
    firstName: string;
    lastName: string | null;
    position: string;
    phone: string | null;
    cityId: string;
    description: string;
    files: string[];
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
