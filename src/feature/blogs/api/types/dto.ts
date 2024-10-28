import { Usertyp } from '../../../users/domains/usertyp.entity';

export type CreateBlog = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  usertyp: Usertyp | null;
  isBanned: boolean;
  banDate: string;
};

export type CreateBlogWithId = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  isBanned: boolean;
  banDate: string;
};

export type SortDir = 'ASC' | 'DESC';
