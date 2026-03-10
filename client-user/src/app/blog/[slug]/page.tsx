import { notFound } from 'next/navigation';
import { ArticleContent } from '@/components/blog/ArticleContent';
import { toImageSrc } from '@/utils/toImageSrc';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchArticle(slug: string) {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: 'Not found' };
  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: article.coverImage
      ? { images: [{ url: toImageSrc(article.coverImage) }] }
      : undefined,
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article || article.section !== 'blog') notFound();

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className='max-w-[800px] mx-auto px-6 py-10'>
      {/* Breadcrumb */}
      <nav className='flex items-center gap-2 text-xs text-gray-400 mb-6'>
        <a href='/blog' className='hover:text-gray-700'>TEM Blog</a>
        {article.categoryName && (
          <>
            <span>/</span>
            <span>{article.categoryName}</span>
          </>
        )}
      </nav>

      {/* Cover */}
      {article.coverImage && (
        <div className='aspect-video bg-gray-200 overflow-hidden mb-8'>
          <img
            src={toImageSrc(article.coverImage)}
            alt={article.title}
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {/* Meta */}
      {article.categoryName && (
        <p className='text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3'>
          {article.categoryName}
        </p>
      )}

      <h1 className='text-3xl md:text-4xl font-medium text-gray-900 mb-4 leading-tight'>
        {article.title}
      </h1>

      {date && <p className='text-sm text-gray-400 mb-8'>{date}</p>}

      {/* Content */}
      <ArticleContent content={article.content} />
    </div>
  );
}
