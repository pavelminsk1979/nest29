import { Injectable } from '@nestjs/common';
import { CreateBlogInputModel } from '../../blogs/api/pipes/create-blog-input-model';
import { CreateBlog } from '../../blogs/api/types/dto';
import { BlogSqlTypeormRepository } from '../../blogs/repositories/blog-sql-typeorm-repository';

@Injectable()
export class BloggerService {
  constructor(protected blogSqlTypeormRepository: BlogSqlTypeormRepository) {}

  async createBlog(createBlogInputModel: CreateBlogInputModel) {
    const { name, description, websiteUrl } = createBlogInputModel;

    const newBlog: CreateBlog = {
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    return this.blogSqlTypeormRepository.createNewBlog(newBlog);
  }

  async updateBlog(blogId: string, updateBlogInputModel: CreateBlogInputModel) {
    return this.blogSqlTypeormRepository.updateBlog(
      blogId,
      updateBlogInputModel,
    );
  }

  async deleteBlogById(blogId: string) {
    return this.blogSqlTypeormRepository.deleteBlogById(blogId);
  }
}
