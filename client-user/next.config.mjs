// Функция для извлечения домена из URL
const getDomainFromUrl = url => {
  if (!url) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_API_URL');
  }
};

// Получаем домен из переменной окружения
const apiDomain = getDomainFromUrl(process.env.NEXT_PUBLIC_API_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: apiDomain,
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
