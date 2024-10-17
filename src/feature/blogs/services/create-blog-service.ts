import { Injectable } from '@nestjs/common';
import { CreateBlogInputModel } from '../api/pipes/create-blog-input-model';
import { CommandHandler } from '@nestjs/cqrs';
import { CreateBlog } from '../api/types/dto';
import { BlogSqlTypeormRepository } from '../repositories/blog-sql-typeorm-repository';

export class CreateBlogCommand {
  constructor(public createBlogInputModel: CreateBlogInputModel) {}
}

@CommandHandler(CreateBlogCommand)
@Injectable()
export class CreateBlogService {
  constructor(protected blogSqlTypeormRepository: BlogSqlTypeormRepository) {}

  async execute(command: CreateBlogCommand) {
    const { name, websiteUrl, description } = command.createBlogInputModel;

    const newBlog: CreateBlog = {
      name,
      description,
      websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    return this.blogSqlTypeormRepository.createNewBlog(newBlog);
  }
}
