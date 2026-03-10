import { api } from '@/api/api';
import { ArticleCategory, ArticleItem, ArticlesResponse, ArticleSection } from './types';

export async function getArticleCategories(section?: ArticleSection): Promise<ArticleCategory[]> {
  const res = await api.get<ArticleCategory[]>('/articles/categories', {
    params: section ? { section } : {},
  });
  return res.data;
}

export async function getFeaturedArticle(section: ArticleSection): Promise<ArticleItem | null> {
  try {
    const res = await api.get<ArticleItem>('/articles/featured', { params: { section } });
    return res.data;
  } catch {
    return null;
  }
}

export async function getArticles(params: {
  section?: ArticleSection;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ArticlesResponse> {
  const res = await api.get<ArticlesResponse>('/articles', { params });
  return res.data;
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem> {
  const res = await api.get<ArticleItem>(`/articles/${slug}`);
  return res.data;
}
