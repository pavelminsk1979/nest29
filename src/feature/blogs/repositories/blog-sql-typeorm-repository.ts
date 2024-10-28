import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlog } from '../api/types/dto';
import { Blogtyp } from '../domains/blogtyp.entity';
import { CreateBlogInputModel } from '../api/pipes/create-blog-input-model';

@Injectable()
export class BlogSqlTypeormRepository {
  constructor(
    @InjectRepository(Blogtyp)
    private readonly blogtypRepository: Repository<Blogtyp>,
  ) {}

  async changeBlog(blog: CreateBlog) {
    const result = await this.blogtypRepository.save(blog);

    if (!result) return false;
    return true;
  }

  async addBlogToUser(blogId: string, userId: string) {
    const result = await this.blogtypRepository
      .createQueryBuilder()
      .update(Blogtyp)
      .set({ usertyp: { id: userId } })
      .where('id = :blogId', { blogId })
      .execute();

    /*   result.affected  может быть значение undefined  или ноль
       это если неуспешно операция прошла.... или число(1 или 2 или3) - это сколько записей обновилось успешно */
    if (result.affected) {
      return true;
    }

    return false;
  }

  async createNewBlogForCorrectUser(newBlog: CreateBlog) {
    const result = await this.blogtypRepository
      .createQueryBuilder()
      .insert()
      .into(Blogtyp)
      .values({
        createdAt: newBlog.createdAt,
        isMembership: newBlog.isMembership,
        name: newBlog.name,
        description: newBlog.description,
        websiteUrl: newBlog.websiteUrl,
        usertyp: newBlog.usertyp ? newBlog.usertyp : null,
        isBanned: newBlog.isBanned,
        banDate: newBlog.banDate,
      })
      .execute();

    return result.raw[0].id;
  }

  async createNewBlog(newBlog: CreateBlog) {
    const result = await this.blogtypRepository
      .createQueryBuilder()
      .insert()
      .into(Blogtyp)
      .values({
        createdAt: newBlog.createdAt,
        isMembership: newBlog.isMembership,
        name: newBlog.name,
        description: newBlog.description,
        websiteUrl: newBlog.websiteUrl,
        isBanned: newBlog.isBanned,
        banDate: newBlog.banDate,
      })
      .execute();

    return result.raw[0].id;
  }

  async getBlogByBlogId(blogId: string) {
    const result = await this.blogtypRepository
      .createQueryBuilder('b')
      .where('b.id = :blogId', { blogId })
      .getOne();

    if (!result) return null;

    return result;
  }

  async getBlogByBlogIdWithUserInfo(blogId: string) {
    const result = await this.blogtypRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.usertyp', 'u')
      .where('b.id = :blogId', { blogId })
      .getOne();

    if (!result) return null;

    return result;
  }

  async updateBlog(blogId: string, updateBlogInputModel: CreateBlogInputModel) {
    const result = await this.blogtypRepository
      .createQueryBuilder()
      .update(Blogtyp)
      .set({
        name: updateBlogInputModel.name,
        description: updateBlogInputModel.description,
        websiteUrl: updateBlogInputModel.websiteUrl,
      })
      .where('id = :blogId', { blogId })
      .execute();

    /* result это вот такая структура 
    UpdateResult { generatedMaps: [], raw: [], affected: 0 }
     affected-- это количество измененных саписей 
   */

    if (result.affected === 0) return false;
    return true;
  }

  async deleteBlogById(blogId: string) {
    const result = await this.blogtypRepository
      .createQueryBuilder()
      .delete()
      .where('id = :blogId', { blogId })
      .execute();

    /*affected указывает на количество удаленных записей */

    if (result.affected === 0) return false;
    return true;
  }
}
