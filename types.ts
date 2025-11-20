export type WebsiteCategory = '게임' | '음악' | string;

export interface Website {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: WebsiteCategory; // 이제 그냥 string 대신 이 특별한 이름을 사용해.
  url: string;
  path?: string;
}