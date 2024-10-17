import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogSqlRepository } from '../repositories/blog-sql-repository';
import { BlogSqlTypeormRepository } from '../repositories/blog-sql-typeorm-repository';

/*sqrs конспект 1501*/
export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
@Injectable()
export class DeleteBlogByIdService
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(
    protected blogSqlRepository: BlogSqlRepository,
    protected blogSqlTypeormRepository: BlogSqlTypeormRepository,
  ) {}

  async execute(command: DeleteBlogByIdCommand): Promise<boolean | null> {
    return this.blogSqlTypeormRepository.deleteBlogById(command.blogId);
  }
}
