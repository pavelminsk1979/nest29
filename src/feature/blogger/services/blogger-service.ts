import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBlogInputModel } from '../../blogs/api/pipes/create-blog-input-model';
import { CreateBlog } from '../../blogs/api/types/dto';
import { BlogSqlTypeormRepository } from '../../blogs/repositories/blog-sql-typeorm-repository';
import { UserSqlTypeormRepository } from '../../users/repositories/user-sql-typeorm-repository';

@Injectable()
export class BloggerService {
  constructor(
    protected blogSqlTypeormRepository: BlogSqlTypeormRepository,
    protected userSqlTypeormRepository: UserSqlTypeormRepository,
  ) {}

  async createBlogForCorrectUser(
    createBlogInputModel: CreateBlogInputModel,
    userId: string,
  ) {
    const { name, description, websiteUrl } = createBlogInputModel;

    const user = await this.userSqlTypeormRepository.getUserById(userId);

    const newBlog: CreateBlog = {
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      usertyp: user,
    };

    return this.blogSqlTypeormRepository.createNewBlogForCorrectUser(newBlog);
  }

  async updateBlog(
    blogId: string,
    updateBlogInputModel: CreateBlogInputModel,
    userId: string,
  ) {
    const blog =
      await this.blogSqlTypeormRepository.getBlogByBlogIdWithUserInfo(blogId);

    if (!blog) {
      return false;
    }

    if (!blog.usertyp || blog.usertyp.id !== userId) {
      /*   403 статус код */
      throw new ForbiddenException('forbidden to put blogs');
    }

    return this.blogSqlTypeormRepository.updateBlog(
      blogId,
      updateBlogInputModel,
    );
  }

  async deleteBlogById(blogId: string, userId: string) {
    const blog =
      await this.blogSqlTypeormRepository.getBlogByBlogIdWithUserInfo(blogId);

    if (!blog) {
      return false;
    }

    if (!blog.usertyp || blog.usertyp.id !== userId) {
      /*   403 статус код */
      throw new ForbiddenException('forbidden to put blogs');
    }

    return this.blogSqlTypeormRepository.deleteBlogById(blogId);
  }
}
