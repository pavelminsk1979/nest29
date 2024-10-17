import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { LikeStatus } from '../../../common/types';
import {
  LikeStatusForComment,
  LikeStatusForCommentDocument,
} from '../../like-status-for-comment/domain/domain-like-status-for-comment';
import { CreateCommentTyp } from '../api/types/dto';
import { CommentSqlRepository } from '../reposetories/comment-sql-repository';
import { LikeStatusForCommentCreateTyp } from '../../like-status-for-comment/types/dto';
import { LikeStatusForCommentSqlRepository } from '../../like-status-for-comment/repositories/like-status-for-comment-sql-repository';
import { PostSqlTypeormRepository } from '../../posts/repositories/post-sql-typeorm-repository';
import { UserSqlTypeormRepository } from '../../users/repositories/user-sql-typeorm-repository';
import { CommentSqlTypeormRepository } from '../reposetories/comment-sql-typeorm-repository';
import { Commenttyp } from '../domaims/commenttyp.entity';
import { LikeStatusForCommentTyp } from '../../like-status-for-comment/domain/typ-like-status-for-comment.entity';
import { TypLikeStatusForCommentSqlRepository } from '../../like-status-for-comment/repositories/typ-like-status-for-comment-sql-repository';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(LikeStatusForComment.name)
    private likeStatusModelForComment: Model<LikeStatusForCommentDocument>,
    protected commentSqlRepository: CommentSqlRepository,
    protected likeStatusForCommentSqlRepository: LikeStatusForCommentSqlRepository,
    protected postSqlTypeormRepository: PostSqlTypeormRepository,
    protected userSqlTypeormRepository: UserSqlTypeormRepository,
    protected commentSqlTypeormRepository: CommentSqlTypeormRepository,
    protected typLikeStatusForCommentSqlRepository: TypLikeStatusForCommentSqlRepository,
  ) {}

  async createComment(userId: string, postId: string, content: string) {
    /*надо проверить существует ли такой
    документ-post в базе */

    const post = await this.postSqlTypeormRepository.getPostById(postId);

    if (!post) return null;

    /* надо достать документ user по userId
    и из него взять userLogin*/

    const user = await this.userSqlTypeormRepository.getUserById(userId);

    if (!user) return null;

    const userLogin = user.login;

    const newComment: CreateCommentTyp = {
      content,
      createdAt: new Date().toISOString(),
      userId,
      userLogin,
      posttyp: post,
    };

    const commentId: string | null =
      await this.commentSqlTypeormRepository.createComment(newComment);

    if (!commentId) return null;

    return commentId;
  }

  async updateComment(userId: string, commentId: string, content: string) {
    //нахожу коментарий в базе данных

    const comment =
      await this.commentSqlTypeormRepository.getCommentById(commentId);

    if (!comment) return false;

    /*   проверяю что этот коментарий принадлежит
   пользователю который  хочет его изменить */

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'comment not belong current user :method put  ,url /comments/commentId',
      );
    }

    return await this.commentSqlTypeormRepository.changeComment(
      commentId,
      content,
    );
  }

  async deleteCommentById(userId: string, commentId: string) {
    const comment =
      await this.commentSqlTypeormRepository.getCommentById(commentId);

    if (!comment) return null;

    /*   проверяю что этот коментарий принадлежит
   пользователю который  хочет его изменить */

    if (comment.userId !== userId) {
      throw new ForbiddenException(
        'comment not belong current user :method delete   ,url /comments/commentId',
      );
    }

    return this.commentSqlTypeormRepository.deleteCommentById(commentId);
  }

  async setLikestatusForComment(
    userId: string,
    commentId: string,
    likeStatus: LikeStatus,
  ) {
    /* проверка- существует ли в базе такой коментарий*/

    const comment: Commenttyp | null =
      await this.commentSqlTypeormRepository.getCommentById(commentId);

    if (!comment) return false;

    /*   
     СОЗДАТЬ ТАБЛИЦУ ДЛЯ ЛАЙКОВКОМЕНТАРИЕВ
     ищу в базе ЛайковДляКоментариев  один документ   по  двум полям userId и commentId---*/

    const likeComment: LikeStatusForCommentTyp | null =
      await this.typLikeStatusForCommentSqlRepository.findLikeCommentByUserIdAndCommentId(
        userId,
        commentId,
      );

    if (!likeComment) {
      /*Если документа  нет тогда надо cоздать
      новый документ и добавить в базу*/

      const newLikeComment: LikeStatusForCommentCreateTyp = {
        userId,
        commenttyp: comment,
        likeStatus,
        addedAt: new Date().toISOString(),
      };

      return await this.typLikeStatusForCommentSqlRepository.createLikeComment(
        newLikeComment,
      );
    }

    /*Если документ есть тогда надо изменить
     statusLike в нем на приходящий и установить теперещнюю дату
      установки */

    const newDate = new Date().toISOString();

    const idLikeComment = likeComment.id;

    return await this.typLikeStatusForCommentSqlRepository.setLikeComment(
      idLikeComment,
      likeStatus,
      newDate,
    );
  }
}
