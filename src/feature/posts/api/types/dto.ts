import { Blogtyp } from '../../../blogs/domains/blogtyp.entity';
import { Posttyp } from '../../domains/posttyp.entity';
import { Usertyp } from '../../../users/domains/usertyp.entity';
import { LikeStatus } from '../../../../common/types';

export type CreatePost = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
};

export type CreatePostWithIdAndWithNameBlog = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  name: string;
};

export type CreatePostTypeorm = {
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
  blogtyp: Blogtyp;
  blogName: string;
};

export type CreateLikeStatusForPost = {
  posttyp: Posttyp;
  usertyp: Usertyp;
  likeStatus: LikeStatus;
  login: string;
  addedAt: string;
};
