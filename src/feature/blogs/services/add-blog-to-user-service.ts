import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogSqlTypeormRepository } from '../repositories/blog-sql-typeorm-repository';

export class AddBlogToUserCommand {
  constructor(
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(AddBlogToUserCommand)
@Injectable()
export class AddBlogToUserService {
  constructor(protected blogSqlTypeormRepository: BlogSqlTypeormRepository) {}

  async execute(command: AddBlogToUserCommand) {
    return this.blogSqlTypeormRepository.addBlogToUser(
      command.blogId,
      command.userId,
    );
  }
}
