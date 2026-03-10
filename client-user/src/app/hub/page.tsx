import { BlogPageClient } from '@/components/blog/BlogPageClient';

export const metadata = {
  title: 'TEM Learning Hub',
  description: 'Обучающие материалы, руководства и инструкции от Touring Expert Marketplace.',
};

export default function HubPage() {
  return <BlogPageClient section='hub' title='TEM Learning Hub' sectionPath='/hub' />;
}
