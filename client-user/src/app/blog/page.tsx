import { BlogPageClient } from '@/components/blog/BlogPageClient';

export const metadata = {
  title: 'TEM Blog',
  description: 'Читайте статьи, новости и гайды от команды Touring Expert Marketplace.',
};

export default function BlogPage() {
  return <BlogPageClient section='blog' title='TEM Blog' sectionPath='/blog' />;
}
