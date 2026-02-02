export const ROUTES = {
  // Главная страница
  // Все объявления (каталог)
  HOME: '/',

  // Детальная стараница продукта [id] (динамический маршрут)
  CATALOG: '/catalog',

  // Страница бренда [id] (динамический маршрут)
  BRANDS: '/catalog/brands',

  // Страница продавца [id] (динамический маршрут)
  SALLER: '/catalog/seller',

  // Страница профиля
  PROFILE: '/profile',

  // Страница "Работа"
  JOB: '/job',

  // Мои Вакансии
  MY_VACANCY: '/vacancy/my',

  // Создание вакансии
  CREATE_VACANCY: '/vacancy/create',

  // Редактирование вакансии [id] (динамический маршрут)
  EDIT_VACANCY: '/vacancy/edit',

  // Мои объявления
  MY_ADVERTISEMENTS: '/advertisements/my',

  // Создание объявления
  CREATE_ADVERTISEMENT: '/advertisements/create',

  // Редактирование объявления [id] (динамический маршрут)
  EDIT_ADVERTISEMENT: '/advertisements/edit',

  // Избранные объявления
  FAVORITES: '/advertisements/favorites',

  // Мои резюме
  MY_RESUME: '/resume/my',

  // Создание резюме
  CREATE_RESUME: '/resume/create',

  // Редактирование резюме [id] (динамический маршрут)
  EDIT_RESUME: '/resume/edit',
} as const;
