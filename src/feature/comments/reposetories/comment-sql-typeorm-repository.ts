import { Injectable } from '@nestjs/common';
import { CreateCommentTyp } from '../api/types/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commenttyp } from '../domaims/commenttyp.entity';

@Injectable()
/*@Injectable()-декоратор что данный клас инжектируемый
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService,UsersRepository]*/
export class CommentSqlTypeormRepository {
  constructor(
    @InjectRepository(Commenttyp)
    private readonly commenttypRepository: Repository<Commenttyp>,
  ) {}

  async createComment(newComment: CreateCommentTyp) {
    const result = await this.commenttypRepository
      .createQueryBuilder()
      .insert()
      .into(Commenttyp)
      .values({
        content: newComment.content,
        createdAt: newComment.createdAt,
        userId: newComment.userId,
        userLogin: newComment.userLogin,
        posttyp: newComment.posttyp,
      })
      .execute();

    /*вернется айдишка нового поста */
    return result.raw[0].id;
  }

  async getCommentById(commentId: string) {
    const result = await this.commenttypRepository
      .createQueryBuilder('com')
      .where('com.id = :commentId', { commentId })
      .getOne();

    return result;
  }

  async changeComment(commentId: string, content: string) {
    const result = await this.commenttypRepository
      .createQueryBuilder()
      .update(Commenttyp)
      .set({ content })
      .where('id = :commentId', { commentId })
      .execute();

    /* result это вот такая структура
   UpdateResult { generatedMaps: [], raw: [], affected: 0 }
    affected-- это количество измененных саписей
  */

    if (result.affected === 0) return false;
    return true;
  }

  async deleteCommentById(commentId: string) {
    const result = await this.commenttypRepository
      .createQueryBuilder()
      .delete()
      .where('id = :commentId', { commentId })
      .execute();

    /*affected указывает на количество удаленных записей */

    if (result.affected === 0) return false;
    return true;
  }
}
