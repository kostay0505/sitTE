export interface User {
    tgId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
    cityId: string | null;
    subscribedToNewsletter: boolean;
    isActive: boolean;
    isBanned: boolean;
    city?: {
        id: string;
        name: string;
        country: {
            id: string;
            name: string;
        } | null;
    } | null;
}
