import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LikeStatusForPostTyp } from '../domain/typ-like-status-for-post.entity';
import { CreateLikeStatusForPost } from '../../posts/api/types/dto';
import { LikeStatus } from '../../../common/types';

@Injectable()
export class LikeStatusForPostSqlTypeormRepository {
  constructor(
    @InjectRepository(LikeStatusForPostTyp)
    private readonly likeForPostTypRepository: Repository<LikeStatusForPostTyp>,
  ) {}

  async findLikePostByUserIdAndPostId(userId: string, postId: string) {
    const result = await this.likeForPostTypRepository
      .createQueryBuilder('likePostTyp')
      .leftJoinAndSelect('likePostTyp.usertyp', 'usertyp')
      .leftJoinAndSelect('likePostTyp.posttyp', 'posttyp')
      .where('usertyp.id = :userId AND posttyp.id = :postId', {
        userId,
        postId,
      })
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

  async createLikePost(newLikePost: CreateLikeStatusForPost) {
    const result = await this.likeForPostTypRepository
      .createQueryBuilder()
      .insert()
      .into(LikeStatusForPostTyp)
      .values({
        likeStatus: newLikePost.likeStatus,
        addedAt: newLikePost.addedAt,
        login: newLikePost.login,
        usertyp: newLikePost.usertyp,
        posttyp: newLikePost.posttyp,
      })
      .execute();

    /*вернется айдишка новой записи */
    if (result.raw[0].id) return true;
    return false;
  }

  async updateLikePost(
    idLikePost: string,
    likeStatus: LikeStatus,
    newDate: string,
  ) {
    const result = await this.likeForPostTypRepository
      .createQueryBuilder()
      .update(LikeStatusForPostTyp)
      .set({ likeStatus, addedAt: newDate })
      .where('id = :idLikePost', { idLikePost })
      .execute();

    /* result это вот такая структура 
    UpdateResult { generatedMaps: [], raw: [], affected: 0 }
     affected-- это количество измененных саписей 
   */

    if (result.affected === 0) return false;
    return true;
  }
}
