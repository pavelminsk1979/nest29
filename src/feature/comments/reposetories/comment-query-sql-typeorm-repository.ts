import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { CommentWithLikeInfo } from '../types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { LikeStatus } from '../../../common/types';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Commenttyp } from '../domaims/commenttyp.entity';
import { LikeStatusForCommentTyp } from '../../like-status-for-comment/domain/typ-like-status-for-comment.entity';
import { TypLikeStatusForCommentSqlRepository } from '../../like-status-for-comment/repositories/typ-like-status-for-comment-sql-repository';
import { PostSqlTypeormRepository } from '../../posts/repositories/post-sql-typeorm-repository';
import { SortDir } from '../../blogs/api/types/dto';

@Injectable()
export class CommentQuerySqlTypeormRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    protected typLikeStatusForCommentSqlRepository: TypLikeStatusForCommentSqlRepository,
    protected postSqlTypeormRepository: PostSqlTypeormRepository,
    @InjectRepository(Commenttyp)
    private readonly commenttypormRepository: Repository<Commenttyp>,
    @InjectRepository(LikeStatusForCommentTyp)
    private readonly likeForCommentTypRepository: Repository<LikeStatusForCommentTyp>,
  ) {}

  async getCommentById(userId: string | null, commentId: string) {
    /*  сразу по commentId получу тот один комент который надо вернуть */

    const result = await this.commenttypormRepository
      .createQueryBuilder('com')
      .leftJoinAndSelect('com.posttyp', 'p')
      .where('com.id = :commentId', { commentId })
      .getOne();

    if (!result) return null;

    const comment: Commenttyp = result;

    /* найду записи с таблицы LikeStatusForCommentTyp  для текущего >User
     чтобы узнать какой статус этот Юзер сделал */

    let statusCurrentUser: LikeStatus = LikeStatus.NONE;

    if (userId) {
      const likecommentsForCorrectUser: LikeStatusForCommentTyp | null =
        await this.typLikeStatusForCommentSqlRepository.findLikeCommentByUserIdAndCommentId(
          userId,
          commentId,
        );

      if (likecommentsForCorrectUser) {
        statusCurrentUser = likecommentsForCorrectUser.likeStatus;
      }
    }

    /*   добываю все записи по лайкам которые
     относятся к текущему коментарию---чтоб
      фронтенду отдать информацию КОЛИЧЕСТВО
       ЛАЙКОВ и ДИЗЛАЙКОВ для данного коментария*/

    const likecommentsForCorrectComent: LikeStatusForCommentTyp[] =
      await this.typLikeStatusForCommentSqlRepository.findLikeCommentsForCorrectComment(
        commentId,
      );

    if (likecommentsForCorrectComent.length > 0) {
      /* получаю  массив документов с Like*/

      const like: LikeStatusForCommentTyp[] =
        likecommentsForCorrectComent.filter(
          (e) => e.likeStatus === LikeStatus.LIKE,
        );

      /* получаю  массив документов с DisLike*/

      const dislike: LikeStatusForCommentTyp[] =
        likecommentsForCorrectComent.filter(
          (e) => e.likeStatus === LikeStatus.DISLIKE,
        );

      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: like.length,
          dislikesCount: dislike.length,
          myStatus: statusCurrentUser,
        },
      };
    } else {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: statusCurrentUser,
        },
      };
    }
  }

  async getComments(
    userId: string | null,
    postId: string,
    queryParams: QueryParamsInputModel,
  ) {
    //проверить существует ли такой ПОСТ

    const post = await this.postSqlTypeormRepository.getPostById(postId);

    if (!post) return null;

    /*   в обьекте queryParams будут для каждого 
поля уже установленые значения по дефолту
согласно СВАГЕРУ---устанавливаются они 
на входе в ПАЙПЕ -файл query-params-user-input-model.ts
*/

    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    /*   НАДО УКАЗЫВАТЬ КОЛИЧЕСТВО ПРОПУЩЕНЫХ 
ЗАПИСЕЙ - чтобы получать следующие за ними

 ЗНАЧЕНИЯ ПО УМОЛЧАНИЯ В ФАЙЛЕ
 query-params-input-model.ts

pageNumber по умолчанию 1, тобишь 
мне надо первую страницу на фронтенд отдать
, и это будут первые 10 записей из таблицы

pageSize - размер  одной страницы, ПО УМОЛЧАНИЮ 10
ТОБИШЬ НАДО ПРОПУСКАТЬ НОЛЬ ЗАПИСЕЙ
(pageNumber - 1) * pageSize
*/

    const amountSkip = (pageNumber - 1) * pageSize;

    /*  Сортировка данных,

.orderBy(`b.${sortBy}`, sortDir)

sortDir это кастыль чтоб весь код не упал
 * ибо менять в енамке - и много где енамка используется 
let sortDir: SortDir;
if (sortDirection === 'asc') {
  sortDir = 'ASC';
} else {
  sortDir = 'DESC';
}


........................................
        ----Для вывода данных порциями используется
два оператора:

.skip(amountSkip)
  .take(pageSize)

-limit - для ограничения количества записей из таблицы
которое количество я хочу в результате получить---это
число в переменной pageSize - по умолчанию 10

-offset -это сколько записей надо пропустить,
это в переменной amountSkip   ....например если
лимит в 10 записей и от фронтенда просят 2-ую страницу,
значит надо пропустить (2-1)*10 =  10 записей

*/

    let sortDir: SortDir;
    if (sortDirection === 'asc') {
      sortDir = 'ASC';
    } else {
      sortDir = 'DESC';
    }
    debugger;
    const result: [Commenttyp[], number] = await this.commenttypormRepository
      .createQueryBuilder('com')
      .leftJoinAndSelect('com.posttyp', 'p')
      .where('p.id = :postId', { postId })
      .orderBy(`com.${sortBy}`, sortDir)
      .skip(amountSkip)
      .take(pageSize)
      .getManyAndCount();
    debugger;
    const totalCount = result[1];

    /*
pagesCount это число
Вычисляется общее количество страниц путем деления общего количества
записей  на размер страницы (pageSize), и округление вверх с помощью функции Math.ceil.*/

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    if (result[0].length === 0) {
      return {
        pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount,
        items: [],
      };
    }

    /*
далее перед отправкой на фронтенд- приведу к тому виду
который ожидает  фронтенд
*/
    debugger;
    const viewArrayComments: CommentWithLikeInfo[] =
      await this.createViewArrayComments(userId, result[0]);
    debugger;
    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: viewArrayComments,
    };
  }

  async createViewArrayComments(
    userId: string | null,
    arrayComments: Commenttyp[],
  ) {
    /* из arrayComments( массив коментариев )
 - достану из каждого комента  id(aйдишку )
 буду иметь массив айдишек */
    const arrayCommentId: string[] = arrayComments.map((e: Commenttyp) => e.id);
    /*из таблицы LikeStatusForCommentTyp
 достану все записи которые имеют id из 
  массива  arrayCommentId .... плюс записи будут отсортированы
 (первая самая новая)*/
    const arrayCommentLikeManyCoomentId: LikeStatusForCommentTyp[] =
      await this.likeForCommentTypRepository
        .createQueryBuilder('comLike')
        .leftJoinAndSelect('comLike.commenttyp', 'commenttyp')
        .where('commenttyp.id IN (:...arrayCommentId)', { arrayCommentId })
        .orderBy('comLike.addedAt', 'DESC')
        .getMany();
    /*в arrayCommentLikeManyCoomentId будет  массив --- если не найдет запись ,
   тогда ПУСТОЙ МАССИВ,   если найдет запись
   тогда  в массиве будетут обьекты */
    return arrayComments.map((el: Commenttyp) => {
      /*    тут для каждого элемента из массива постов
        будет делатся ВЬЮМОДЕЛЬ которую ожидает 
        фронтенд, внутри будет информация об 
        посте и об лайках к этому посту*/
      debugger;
      if (arrayCommentLikeManyCoomentId.length === 0) {
        const viewCommentWithInfoLike =
          this.createViewModelOneCommentWithLikeInfo(
            userId,
            el,
            arrayCommentLikeManyCoomentId,
          );
        return viewCommentWithInfoLike;
      } else {
        const currentCommentId = el.id;

        /*из массива с лайкамиСтатусами я выберу только
        телайкСтатусы которые относятся к одному 
        КОМЕНТАРИЮ*/
        const arrayCommentLikeForCorrectComment =
          arrayCommentLikeManyCoomentId.filter(
            (el) => el.commenttyp.id === currentCommentId,
          );
        const viewCommentWithInfoLike =
          this.createViewModelOneCommentWithLikeInfo(
            userId,
            el,
            arrayCommentLikeForCorrectComment,
          );
        return viewCommentWithInfoLike;
      }
    });
  }

  createViewModelOneCommentWithLikeInfo(
    userId: string | null,
    /* userId чтоб определить статус того
  пользователя который данный запрос делает */
    comment: Commenttyp,
    arrayCommentLikeForCorrectComment: LikeStatusForCommentTyp[],
  ) {
    if (arrayCommentLikeForCorrectComment.length === 0) {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.NONE,
        },
      };
    } else {
      /* из массива arrayPostLikeForOnePost  найду все
  со статусом Like   and    Dislike*/

      const arrayStatusLike: LikeStatusForCommentTyp[] =
        arrayCommentLikeForCorrectComment.filter(
          (e) => e.likeStatus === LikeStatus.LIKE,
        );
      const arrayStatusDislike: LikeStatusForCommentTyp[] =
        arrayCommentLikeForCorrectComment.filter(
          (e) => e.likeStatus === LikeStatus.DISLIKE,
        );
      /*  надо узнать какой статус поставил пользователь данному посту, тот пользователь
       который данный запрос делает - его 
       айдишка  имеется */

      let likeStatusCurrenttUser: LikeStatus;
      const result = arrayCommentLikeForCorrectComment.find(
        (e) => e.userId === userId,
      );
      if (!result) {
        likeStatusCurrenttUser = LikeStatus.NONE;
      } else {
        likeStatusCurrenttUser = result.likeStatus;
      }
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: arrayStatusLike.length,
          dislikesCount: arrayStatusDislike.length,
          myStatus: likeStatusCurrenttUser,
        },
      };
    }
  }
}
