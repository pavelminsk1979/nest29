import { Injectable } from '@nestjs/common';
import { UpdateBanStatusForBlogInputModel } from '../api/pipes/update-ban-status-for-blog-input-model';
import { BlogSqlTypeormRepository } from '../repositories/blog-sql-typeorm-repository';

@Injectable()
export class BlogBanService {
  constructor(protected blogSqlTypeormRepository: BlogSqlTypeormRepository) {}

  async setBanStatusForBlog(
    blogIdUriParam: string,
    updateBanStatusForBlogInputModel: UpdateBanStatusForBlogInputModel,
  ) {
    const { isBanned } = updateBanStatusForBlogInputModel;

    const blog =
      await this.blogSqlTypeormRepository.getBlogByBlogIdWithUserInfo(
        blogIdUriParam,
      );

    if (!blog) return false;

    blog.isBanned = isBanned;

    blog.banDate = new Date().toISOString();

    return this.blogSqlTypeormRepository.changeBlog(blog);
  }
}
