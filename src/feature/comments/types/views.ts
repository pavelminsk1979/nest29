import { LikeStatus } from '../../../common/types';

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type CommentWithLikeInfo = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type ViewArrayComments = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentWithLikeInfo[];
};

type PostInfo = {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
};

export type CommentWithLikeInfoWithPostInfo = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
  postInfo: PostInfo;
};

export type ViewArrayCommentsWithLikeInfoWithPostInfo = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentWithLikeInfoWithPostInfo[];
};
