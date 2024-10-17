import { Posttyp } from '../../../posts/domains/posttyp.entity';

export type CreateComment = {
  content: string;
  postId: string;
  createdAt: string;
  userId: string;
  userLogin: string;
};

export type CreateCommentWithId = {
  id: string;
  content: string;
  postId: string;
  createdAt: string;
  userId: string;
  userLogin: string;
};

export type CreateCommentTyp = {
  content: string;
  createdAt: string;
  userId: string;
  userLogin: string;
  posttyp: Posttyp;
};
