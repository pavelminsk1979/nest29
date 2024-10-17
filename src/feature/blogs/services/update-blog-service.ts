import { Injectable } from '@nestjs/common';
import { CreateBlogInputModel } from '../api/pipes/create-blog-input-model';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogSqlTypeormRepository } from '../repositories/blog-sql-typeorm-repository';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public updateBlogInputModel: CreateBlogInputModel,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
@Injectable()
export class UpdateBlogService {
  constructor(protected blogSqlTypeormRepository: BlogSqlTypeormRepository) {}

  async execute(command: UpdateBlogCommand) {
    return this.blogSqlTypeormRepository.updateBlog(
      command.blogId,
      command.updateBlogInputModel,
    );
  }
}
