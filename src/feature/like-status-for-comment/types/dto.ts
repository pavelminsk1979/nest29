import { LikeStatus } from '../../../common/types';
import { Commenttyp } from '../../comments/domaims/commenttyp.entity';

export type LikeStatusForCommentCreate = {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
  addedAt: string;
};

export type LikeStatusForCommentCreateWithId = {
  id: string;
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
  addedAt: string;
};

export type LikeStatusForCommentCreateTyp = {
  userId: string;
  commenttyp: Commenttyp;
  likeStatus: LikeStatus;
  addedAt: string;
};
