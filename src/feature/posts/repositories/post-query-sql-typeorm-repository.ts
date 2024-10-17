import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domains/domain-post';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { LikeStatus } from '../../../common/types';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NewestLikes, PostWithLikesInfo } from '../api/types/views';
import { SortDir } from '../../blogs/api/types/dto';
import { Posttyp } from '../domains/posttyp.entity';
import { BlogSqlTypeormRepository } from '../../blogs/repositories/blog-sql-typeorm-repository';
import { Blogtyp } from '../../blogs/domains/blogtyp.entity';
import { LikeStatusForPostTyp } from '../../like-status-for-post/domain/typ-like-status-for-post.entity';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class PostQuerySqlTypeormRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Posttyp)
    private readonly posttypRepository: Repository<Posttyp>,
    protected blogSqlTypeormRepository: BlogSqlTypeormRepository,
    @InjectRepository(LikeStatusForPostTyp)
    private readonly likeForPostTypRepository: Repository<LikeStatusForPostTyp>,
  ) {}

  async getPosts(
    userId: string | null,
    queryParamsPostForBlog: QueryParamsInputModel,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsPostForBlog;

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

    const result: [Posttyp[], number] = await this.posttypRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blogtyp', 'b')
      .orderBy(`p.${sortBy}`, sortDir)
      .skip(amountSkip)
      .take(pageSize)
      .getManyAndCount();

    /*    result: [Blogtyp[], number]     возвращает кортеж, 
  где первый элемент - массив объектов, удовлетворяющих
   запросу, а второй элемент - общее количество записей
    в базе данных, удовлетворяющих условию запроса
     без учета операции take(pageSize).*/

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
далее перед отправкой на фронтенд 
приведу массив arrayPosts к тому виду
который ожидает  фронтенд
 и добавлю информацию из 
таблицы ЛАЙКИ к ПОСТАМ 

*/

    const viewArrayPosts: PostWithLikesInfo[] = await this.createViewArrayPosts(
      userId,
      result[0], //Posttyp[]
    );

    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: viewArrayPosts,
    };
  }

  async getPostByPostId(postId: string, userId: string | null) {
    /*  найду одну запись post по айдишке
     И ПЛЮС НАДО  result.blogtyp.id */

    const result: Posttyp | null = await this.posttypRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blogtyp', 'b')
      .where('p.id = :postId', { postId })
      .getOne();

    if (!result) return null;

    /* найду все записи из таблицы LikeStatusForPostTyp
    для текущего поста по postId
    и должно быть добавлено ЗАДЖОЙНЕНО
    ИНФА ЮЗЕРА_АМ АЙДИШКА ПОНАДОБИТСЯ
    ------сортировку по полю addedAt
    -------- сортировка в убывающем порядке , это означает, что самая
    первая запись будет самой новой записью*/

    const arrayLikeStatusForPostTypByPostId: LikeStatusForPostTyp[] =
      await this.likeForPostTypRepository
        .createQueryBuilder('plike')
        .leftJoinAndSelect('plike.usertyp', 'u')
        .where('plike.posttyp.id = :postId', { postId })
        .orderBy('plike.addedAt', 'DESC')
        .getMany();

    /*в arrayLikeStatusForPostTypByPostId будет  массив --- если не найдет запись ,
 тогда ПУСТОЙ МАССИВ,   если найдет запись
 тогда в массиве будетут  обьекты */

    const viewModelOnePostWithLikeInfo: PostWithLikesInfo =
      this.createViewModelOnePostWithLikeInfo(
        userId,
        result,
        arrayLikeStatusForPostTypByPostId,
      );

    return viewModelOnePostWithLikeInfo;
  }

  async createViewArrayPosts(userId: string | null, arrayPosts: Posttyp[]) {
    /* из arrayPosts( массив постов)
    - достану из каждого поста  id(aйдишку поста)
    буду иметь массив айдишек */

    const arrayPostId: string[] = arrayPosts.map((e: Posttyp) => e.id);

    /*
    НАДО ЗАДЖОЙНИТЬ ДАННЫЕ ЮЗЕРА ЧТОБ АЙДИШКУ
    ДОСТАТЬ
    из таблицы LikeStatusForPostTyp
  достану все записи которые имеют id из 
   массива  arrayPostId .... плюс записи будут отсортированы
  (первая самая новая)*/

    const arrayPostLikeManyPostId: LikeStatusForPostTyp[] =
      await this.likeForPostTypRepository
        .createQueryBuilder('plike')
        .leftJoinAndSelect('plike.posttyp', 'posttyp')
        .leftJoinAndSelect('plike.usertyp', 'usertyp')
        .where('posttyp.id IN (:...arrayPostId)', { arrayPostId })
        .orderBy('plike.addedAt', 'DESC')
        .getMany();

    /*в arrayPostLikeManyPostId будет  массив --- если не найдет запись ,  
   тогда ПУСТОЙ МАССИВ,   если найдет запись
   тогда  в массиве будетут обьекты */

    return arrayPosts.map((el: Posttyp) => {
      /*    тут для каждого элемента из массива постов
          будет делатся ВЬЮМОДЕЛЬ которую ожидает 
          фронтенд, внутри будет информация об 
          посте и об лайках к этому посту*/
      debugger;
      if (arrayPostLikeManyPostId.length === 0) {
        const viewPostWithInfoLike = this.createViewModelOnePostWithLikeInfo(
          userId,
          el,
          arrayPostLikeManyPostId,
        );
        return viewPostWithInfoLike;
      } else {
        const currentPostId = el.id;

        /*из массива с лайкамиСтатусами я выберу только
        телайкСтатусы которые относятся к одному ПОСТУ*/

        const arrayPostLikeForCorrectPost = arrayPostLikeManyPostId.filter(
          (el: LikeStatusForPostTyp) => el.posttyp.id === currentPostId,
        );

        const viewPostWithInfoLike = this.createViewModelOnePostWithLikeInfo(
          userId,
          el,
          arrayPostLikeForCorrectPost,
        );
        return viewPostWithInfoLike;
      }
    });
  }

  async getPostsByCorrectBlogId(
    blogId: string,
    queryParams: QueryParamsInputModel,
    userId: string | null,
  ) {
    ///надо проверить существует ли такой blog

    const blog: Blogtyp | null =
      await this.blogSqlTypeormRepository.getBlogByBlogId(blogId);

    if (!blog) return null;

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

    const result: [Posttyp[], number] = await this.posttypRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blogtyp', 'b')
      .where('b.id = :blogId', { blogId })
      .orderBy(`p.${sortBy}`, sortDir)
      .skip(amountSkip)
      .take(pageSize)
      .getManyAndCount();
    debugger;
    /*    result: [Blogtyp[], number]     возвращает кортеж, 
  где первый элемент - массив объектов, удовлетворяющих
   запросу, а второй элемент - общее количество записей
    в базе данных, удовлетворяющих условию запроса
     без учета операции take(pageSize).*/

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
далее перед отправкой на фронтенд 
приведу массив arrayPosts к тому виду
который ожидает  фронтенд
 и добавлю информацию из 
таблицы ЛАЙКИ к ПОСТАМ 

*/

    const viewArrayPosts: PostWithLikesInfo[] = await this.createViewArrayPosts(
      userId,
      result[0],
    );

    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: viewArrayPosts,
    };
  }

  /*  async getPostById(postId: string, userId: string | null) {
  1222
  000000000000000000000
      /!* найду одну запись post по айдишке, плюс значение
       * name из таблицы blog  И ДЛЯ ДАННОГО ПОСТА БУДЕТ
       * СУЩЕСТВОВАТЬ ОДИН БЛОГ И У НЕГО ВОЗМУ ЕГО name ,
       * это фронту надо инфу отдать  *!/
  
      const result = await this.dataSource.query(
        `
      select p.*,b.name
      from public.post p
      left join public.blog b
      on p."blogId"=b.id
      where p.id=$1
      `,
        [postId],
      );
  
      if (result.length === 0) return null;
  
      const post: CreatePostWithIdAndWithNameBlog = result[0];
  
      /!* найду все записи из таблицы postlike
       для текущего поста
       ------сортировку по полю addedAt
       -------- сортировка в убывающем порядке , это означает, что самая первая запись будет самой новой записью*!/
  
      const arrayPostLikeForOnePost: LikeStatusForPostWithId[] =
        await this.dataSource.query(
          `
      SELECT *
  FROM public.postlike plike
  WHERE plike."postId"=$1
   ORDER BY plike."addedAt" DESC   
      `,
          [postId],
        );
  
      /!*в arrayPostLike будет  массив --- если не найдет запись ,
     тогда ПУСТОЙ МАССИВ,   если найдет запись
     тогда в массиве будетут  обьекты *!/
  
      const viewModelOnePostWithLikeInfo: PostWithLikesInfo =
        this.createViewModelOnePostWithLikeInfo(
          userId,
          post,
          arrayPostLikeForOnePost,
        );
  
      return viewModelOnePostWithLikeInfo;
    }*/

  createViewModelOnePostWithLikeInfo(
    userId: string | null,
    /* userId чтоб определить статус того 
  пользователя который данный запрос делает */

    post: Posttyp,
    arrayPostLikeForOnePost: LikeStatusForPostTyp[],
  ) {
    /* из массива arrayPostLikeForOnePost  найду все
    со статусом Like   and    Dislike*/

    if (arrayPostLikeForOnePost.length === 0) {
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogtyp.id,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.NONE,
          newestLikes: [],
        },
      };
    } else {
      debugger;
      const arrayStatusLike: LikeStatusForPostTyp[] =
        arrayPostLikeForOnePost.filter((e) => e.likeStatus === LikeStatus.LIKE);

      const arrayStatusDislike: LikeStatusForPostTyp[] =
        arrayPostLikeForOnePost.filter(
          (e) => e.likeStatus === LikeStatus.DISLIKE,
        );

      /* получаю из массива со статусом Like
 три документа  новейших по дате
 --сортировку я произвел когда все документы
  ЛАЙКСТАТУСДЛЯПОСТОВ из   базыданных доставал */

      const threeDocumentWithLike: LikeStatusForPostTyp[] =
        arrayStatusLike.slice(0, 3);

      /*  надо узнать какой статус поставил пользователь данному посту, 
  тот пользователь который данный запрос делает - его айдишка
   имеется */

      let likeStatusCurrenttUser: LikeStatus;

      const result = arrayPostLikeForOnePost.find((e) => {
        return e.usertyp.id === userId;
      });

      if (!result) {
        likeStatusCurrenttUser = LikeStatus.NONE;
      } else {
        likeStatusCurrenttUser = result.likeStatus;
      }

      /*  на фронтенд надо отдать масив с тремя обьектами
      И ТУТ ОПРЕДЕЛЕННУЮ СТРУКТУРУ СОЗДАЮ
        и в каждом обьекте информация об юзере 
        котрый ПОСТАВИЛ ПОЛОЖИТЕЛЬНЫЙ ЛАЙК СТАТУС и они 
        были установлены самыми крайними*/

      const threeLatestLike: NewestLikes[] = threeDocumentWithLike.map(
        (el: LikeStatusForPostTyp) => {
          return {
            userId: el.usertyp.id,
            addedAt: el.addedAt,
            login: el.login,
          };
        },
      );

      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogtyp.id,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: arrayStatusLike.length,
          dislikesCount: arrayStatusDislike.length,
          myStatus: likeStatusCurrenttUser,
          newestLikes: threeLatestLike,
        },
      };
    }
  }
}
