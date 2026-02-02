export const resolveCategoryId = (
  categoryId?: string,
  subcategoryId?: string,
) => {
  const sub = (subcategoryId ?? '').trim();
  const cat = (categoryId ?? '').trim();
  return sub || cat;
};

export const resolveFormCategoryValues = (
  productCategoryId: string | undefined,
  allCategories: Array<{ id: string; parentId: string | null }>,
): { categoryId: string; subcategoryId: string } => {
  if (!productCategoryId) {
    return { categoryId: '', subcategoryId: '' };
  }

  const currentCategory = allCategories.find(
    cat => cat.id === productCategoryId,
  );

  if (!currentCategory) {
    return { categoryId: productCategoryId, subcategoryId: '' };
  }

  if (currentCategory.parentId) {
    return {
      categoryId: currentCategory.parentId,
      subcategoryId: currentCategory.id,
    };
  }

  return {
    categoryId: currentCategory.id,
    subcategoryId: '',
  };
};
