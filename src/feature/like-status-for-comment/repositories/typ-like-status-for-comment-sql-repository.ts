import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeStatusForCommentTyp } from '../domain/typ-like-status-for-comment.entity';
import { LikeStatusForCommentCreateTyp } from '../types/dto';
import { LikeStatus } from '../../../common/types';

@Injectable()
export class TypLikeStatusForCommentSqlRepository {
  constructor(
    @InjectRepository(LikeStatusForCommentTyp)
    private readonly likeForCommentTypRepository: Repository<LikeStatusForCommentTyp>,
  ) {}

  async findLikeCommentByUserIdAndCommentId(userId: string, commentId: string) {
    const result = await this.likeForCommentTypRepository
      .createQueryBuilder('likeCommentTyp')
      .leftJoinAndSelect('likeCommentTyp.commenttyp', 'commenttyp')
      .where(
        'likeCommentTyp.userId = :userId AND likeCommentTyp.commenttyp.id = :commentId',
        { userId, commentId },
      )
      .getOne();

    /*  Если запрос находит запись в базе данных,
     то в переменной result будет объект 
     LikeStatusForPostTyp. Этот объект будет содержать 
     данные, связанные с этой записью.
  
        Если запрос не находит соответствующей записи в базе
         данных, то в переменной result будет 
         значение undefined*/

    return result;
  }

  async createLikeComment(newLikeComment: LikeStatusForCommentCreateTyp) {
    const result = await this.likeForCommentTypRepository
      .createQueryBuilder()
      .insert()
      .into(LikeStatusForCommentTyp)
      .values({
        userId: newLikeComment.userId,
        likeStatus: newLikeComment.likeStatus,
        addedAt: newLikeComment.addedAt,
        commenttyp: newLikeComment.commenttyp,
      })
      .execute();

    /*вернется айдишка новой записи */
    if (result.raw[0].id) return true;
    return false;
  }

  async setLikeComment(
    idLikeComment: string,
    likeStatus: LikeStatus,
    newDate: string,
  ) {
    const result = await this.likeForCommentTypRepository
      .createQueryBuilder()
      .update(LikeStatusForCommentTyp)
      .set({ likeStatus, addedAt: newDate })
      .where('id = :idLikeComment', { idLikeComment })
      .execute();

    /* result это вот такая структура
    UpdateResult { generatedMaps: [], raw: [], affected: 0 }
     affected-- это количество измененных саписей
   */

    if (result.affected === 0) return false;
    return true;
  }

  async findLikeCommentsForCorrectComment(commentId: string) {
    const result = await this.likeForCommentTypRepository
      .createQueryBuilder('likeCommentTyp')
      .leftJoinAndSelect('likeCommentTyp.commenttyp', 'commenttyp')
      .where('commenttyp.id = :commentId', { commentId })
      .getMany();

    return result;
  }
}
