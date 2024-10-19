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

export type ViewBlogWithUserInfo = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: BlogOwnerInfo;
};

export type ViewArrayBlog = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewBlog[];
};
