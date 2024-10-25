import { Blogtyp } from '../../../blogs/domains/blogtyp.entity';

export type CreateBanUser = {
  isBanned: boolean;
  banReason: string;
  banUserId: string;
  createdAt: string;
  login: string;
  blogId: string;
  blogtyp: Blogtyp;
};
