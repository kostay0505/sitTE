export const BOT_COMMANDS = {
  START: 'start',
  
  // Команды для рассылок
  BROADCAST: 'broadcast',
  BROADCAST_RETRY: 'broadcast_retry',
  
  // Команды для админов
  STATS: 'stats',
  
  // Команды для модерации объявлений
  APPROVE_PRODUCT: 'approve_product',
  REJECT_PRODUCT: 'reject_product',

  // Команды для ссылок
  SHARE_PRODUCT: 'product_',
  SHARE_BRAND: 'brand_',
  SHARE_SELLER: 'seller_',
} as const;
