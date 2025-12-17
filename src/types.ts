export type WebsiteCategory = '게임' | '음악' | '학습' | '기타' | string;

export interface Website {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: WebsiteCategory;
  url: string;
  path?: string;
}