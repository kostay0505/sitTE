import { TEST_PRODUCTS, TEST_BRAND, TEST_USER } from '../test/_testData';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toProductBasic(p: (typeof TEST_PRODUCTS)[number]) {
  return {
    id: p.id,
    name: p.name,
    priceCash: p.priceCash,
    currency: p.currency,
    preview: p.preview,
    description: p.description,
    isNew: p.isNew,
    isFavorite: p.isFavorite,
    status: p.status,
    viewCount: p.viewCount,
    url: `https://touringexpertsale.ru/catalog/${p.id}`,
  };
}

function toFullProduct(p: (typeof TEST_PRODUCTS)[number]) {
  return {
    id: p.id,
    name: p.name,
    priceCash: p.priceCash,
    priceNonCash: p.priceNonCash,
    currency: p.currency,
    preview: p.preview,
    files: p.files,
    description: p.description,
    quantity: p.quantity,
    quantityType: p.quantityType,
    isActive: p.isActive,
    isDeleted: p.isDeleted,
    isNew: p.isNew,
    isFavorite: p.isFavorite,
    category: p.category,
    brand: p.brand,
    user: p.user,
    status: p.status,
    viewCount: p.viewCount,
    url: `https://touringexpertsale.ru/catalog/${p.id}`,
  };
}

// ── Exports ───────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS_BASIC = TEST_PRODUCTS.map(toProductBasic);

export const MOCK_PRODUCTS_FULL = TEST_PRODUCTS.map(toFullProduct);

export const MOCK_BASIC_INFO = {
  new: TEST_PRODUCTS.filter(p => p.isNew).map(toProductBasic),
  mainSeller: TEST_PRODUCTS.slice(0, 8).map(toProductBasic),
  popular: [...TEST_PRODUCTS]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 8)
    .map(toProductBasic),
};

export const MOCK_BRANDS = [
  {
    id: TEST_BRAND.id,
    name: TEST_BRAND.name,
    photo: TEST_BRAND.photo,
    contact: TEST_BRAND.contact,
    description: TEST_BRAND.description,
    displayOrder: 1,
    isActive: true,
    productCount: TEST_PRODUCTS.length,
    url: TEST_BRAND.url,
  },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-shlemy', name: 'Шлемы', parentId: null, displayOrder: 1, isActive: true },
  { id: 'cat-motokurtki', name: 'Мотокуртки', parentId: null, displayOrder: 2, isActive: true },
  { id: 'cat-motozaschita', name: 'Мотозащита', parentId: null, displayOrder: 3, isActive: true },
  { id: 'cat-motobotinki', name: 'Мотоботинки', parentId: null, displayOrder: 4, isActive: true },
];

export const MOCK_SELLER = {
  tgId: TEST_USER.tgId,
  username: TEST_USER.username,
  firstName: TEST_USER.firstName,
  lastName: TEST_USER.lastName,
  email: TEST_USER.email,
  phone: TEST_USER.phone,
  photoUrl: TEST_USER.photoUrl,
  city: TEST_USER.city,
  url: TEST_USER.url,
};

export { TEST_PRODUCTS };
