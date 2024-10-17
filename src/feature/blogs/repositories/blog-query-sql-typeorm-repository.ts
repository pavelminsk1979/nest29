import { Injectable } from '@nestjs/common';

import { ViewBlog } from '../api/types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SortDir } from '../api/types/dto';
import { Blogtyp } from '../domains/blogtyp.entity';

@Injectable()
export class BlogQuerySqlTypeormRepository {
  constructor(
    @InjectRepository(Blogtyp)
    private readonly blogtypeRepository: Repository<Blogtyp>,
  ) {}

  async getBlogs(queryParamsBlog: QueryParamsInputModel) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsBlog;

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

    /*   ---- из фронта передаются  символ или
       символы ДЛЯ СОРТИРОВКИ ПО  НАЗВАНИЮ -имени  БЛОГА
        -- например -
       -передается от фронта "Jo"  и
       если  есть записи ИМЕНА БЛОГОВ
        в базе данных  и  эти ИМЕНА например
        "John",
         "Johanna" и "Jonathan", тогда эти  три БЛОГА  будут
       выбраны и возвращены как результат запроса
       !!!НАДО ВКЛЮЧАТЬ УСЛОВИЕ О ТОМ ЧТО НЕВАЖНО БОЛЬШИЕ
       ИЛИ МАЛЕНЬКИЕ БУКВЫ ПРИХОДЯТ ОТ ФРОНТЕНДА
       -----И ДЛЯ ТАКОГО УСЛОВИЯ  ИСПОЛЬЗУЕТСЯ ключевое
       слово   ILIKE

       --ILIKE  это оператор 
       выполнит поиск БЕЗУЧЕТА РЕГИСТРА
.where('b.name ILIKE :searchNameTerm', { searchNameTerm: `%${searchNameTerm}%` })


        .................
             Сортировка данных,

 ---coртировать по названию колонки
    это название колонки а переменной sortBy

    ----COLLATE "C"   будет делать выжным большие и малые буквы
    при сортировке

     ---направление сортировки в переменной  sortDirection


      ...........................
          ----Для вывода данных порциями используется
    два оператора:



    -limit - для ограничения количества записей из таблицы
  которое количество я хочу в результате получить---это
  число в переменной pageSize - по умолчанию 10

  -offset -это сколько записей надо пропустить,
   это в переменной amountSkip   ....например если
  лимит в 10 записей и от фронтенда просят 2-ую страницу,
  значит надо пропустить (2-1)*10 =  10 записей


         */

    /*sortDir это кастыль чтоб весь код не упал
     * ибо менять в енамке - и много где енамка используется */
    let sortDir: SortDir;
    if (sortDirection === 'asc') {
      sortDir = 'ASC';
    } else {
      sortDir = 'DESC';
    }

    const result: [Blogtyp[], number] = await this.blogtypeRepository
      .createQueryBuilder('b')
      .where('b.name ILIKE :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      })
      .orderBy(`b.${sortBy}`, sortDir)
      .skip(amountSkip)
      .take(pageSize)
      .getManyAndCount();

    /*
  далее перед отправкой на фронтенд отмамплю записи из
  базы данных и добавлю поля - приведу к тому виду
  который ожидает  фронтенд
*/

    const arrayBlogs: ViewBlog[] = result[0].map((blog: Blogtyp) => {
      return this.createViewModelBlog(blog);
    });

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

    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayBlogs,
    };
  }

  async getBlogById(blogId: string) {
    const result = await this.blogtypeRepository
      .createQueryBuilder('b')
      .where('b.id = :blogId', { blogId })
      .getOne();

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      description: result.description,
      websiteUrl: result.websiteUrl,
      createdAt: result.createdAt,
      isMembership: result.isMembership,
    };
  }

  createViewModelBlog(blog: Blogtyp): ViewBlog {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
