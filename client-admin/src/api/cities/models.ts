export interface City {
    id: string;
    name: string;
    countryId?: string;
    country?: {
        id: string;
        name: string;
    } | null;
    isActive: boolean;
}
