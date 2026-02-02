export type CategoryBasic = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null; // если категория верхнего уровня
  displayOrder: number;
  isActive: boolean;
};

export type ActiveCategoriesResponse = Category[];
