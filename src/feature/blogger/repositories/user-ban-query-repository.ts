import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { UserBan } from '../domains/user-ban.entity';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { ViewUserBan } from '../../users/api/types/views';

@Injectable()
export class UserBanQueryRepository {
  constructor(
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
    debugger;

    const result: UserBan[] = await this.userBanRepository.find({
      where: {
        login: ILike(`%${searchLoginTerm}%`),
        isBanned: true,
        blogId: blogId,
      },
      order: { [sortBy]: sortDirection }, //COLLATE "C"

      skip: amountSkip,
      take: pageSize,
    });

    debugger;
    const totalCount = await this.userBanRepository.count({
      where: {
        login: ILike(`%${searchLoginTerm}%`),
        isBanned: true,
        blogId: blogId,
      },
    });

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
