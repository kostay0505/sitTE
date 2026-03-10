export type ArticleSection = 'blog' | 'hub';

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  section: ArticleSection;
  position: number;
  createdAt: string;
}

export type ArticleBlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'image'
  | 'video'
  | 'quote'
  | 'divider';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  content: string;
  caption?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null; // JSON string of ArticleBlock[]
  coverImage: string | null;
  section: ArticleSection;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  slug: string;
  published: boolean;
  isFeatured: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  items: ArticleItem[];
  total: number;
  page: number;
  limit: number;
}
