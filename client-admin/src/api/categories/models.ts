export interface Category {
    id: string;
    name: string;
    parentId?: string;
    displayOrder: number;
    isActive: boolean;
}
