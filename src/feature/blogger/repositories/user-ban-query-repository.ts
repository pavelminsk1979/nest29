import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBan } from '../domains/user-ban.entity';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { ViewUserBan } from '../../users/api/types/views';
import { SortDir } from '../../blogs/api/types/dto';
import { BlogSqlTypeormRepository } from '../../blogs/repositories/blog-sql-typeorm-repository';

@Injectable()
export class UserBanQueryRepository {
  constructor(
    protected blogSqlTypeormRepository: BlogSqlTypeormRepository,
    @InjectRepository(UserBan)
    private readonly userBanRepository: Repository<UserBan>,
  ) {}

  async getBlogs(
    queryParamsBlogInputModel: QueryParamsInputModel,
    userId: string,
    blogId: string,
  ) {
    const { searchLoginTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsBlogInputModel;

    const blog =
      await this.blogSqlTypeormRepository.getBlogByBlogIdWithUserInfo(blogId);

    if (!blog) return null;

    if (blog.usertyp && blog.usertyp.id !== userId) {
      /*   403 статус код */
      throw new ForbiddenException();
    }

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

    let sortDir: SortDir;
    if (sortDirection === 'asc') {
      sortDir = 'ASC';
    } else {
      sortDir = 'DESC';
    }

    const result = await this.userBanRepository
      .createQueryBuilder('userBan')
      .where('userBan.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .andWhere('userBan.isBanned = :isBanned', { isBanned: true })
      .andWhere('userBan.blogId = :blogId', { blogId })
      .orderBy(`userBan.${sortBy} COLLATE "C"`, sortDir)
      .skip(amountSkip)
      .take(pageSize)
      .getMany();

    const totalCount = await this.userBanRepository
      .createQueryBuilder('userBan')
      .where('userBan.login ILIKE :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      })
      .andWhere('userBan.isBanned = :isBanned', { isBanned: true })
      .andWhere('userBan.blogId = :blogId', { blogId })
      .getCount();

    /*
        const result: UserBan[] = await this.userBanRepository.find({
          where: {
            login: ILike(`%${searchLoginTerm}%`),
            isBanned: true,
            blogId: blogId,
          },
          order: { [sortBy]: sortDir }, //COLLATE "C"
    
          skip: amountSkip,
          take: pageSize,
        });
    
    
        const totalCount = await this.userBanRepository.count({
          where: {
            login: ILike(`%${searchLoginTerm}%`),
            isBanned: true,
            blogId: blogId,
          },
        });*/

    /*
pagesCount это (число)  общее количество страниц путем деления
общего количества документов на размер страницы (pageSize),
 и округление вверх с помощью функции Math.ceil.*/

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    const arrayUsersBan: ViewUserBan[] = result.map((el: UserBan) => {
      return {
        id: el.banUserId,
        login: el.login,
        banInfo: {
          isBanned: el.isBanned,
          banDate: el.createdAt,
          banReason: el.banReason,
        },
      };
    });

    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayUsersBan,
    };
  }
}
