export type ViewBlog = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogOwnerInfo = {
  userId: string | null;
  userLogin: string | null;
};

type BanInfo = {
  isBanned: boolean;
  banDate: string | null;
};

export type ViewBlogWithUserInfo = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfo;
  banInfo: BanInfo;
};

export type ViewArrayBlog = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewBlog[];
};
