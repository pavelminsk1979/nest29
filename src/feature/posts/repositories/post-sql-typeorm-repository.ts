import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostTypeorm } from '../api/types/dto';
import { Posttyp } from '../domains/posttyp.entity';
import { UpdatePostForCorrectBlogInputModel } from '../api/pipes/update-post-for-correct-blog-input-model';

@Injectable()
export class PostSqlTypeormRepository {
  constructor(
    @InjectRepository(Posttyp)
    private readonly posttypRepository: Repository<Posttyp>,
  ) {}

  async createPost(newPost: CreatePostTypeorm) {
    const result = await this.posttypRepository
      .createQueryBuilder()
      .insert()
      .into(Posttyp)
      .values({
        title: newPost.title,
        shortDescription: newPost.shortDescription,
        content: newPost.content,
        createdAt: newPost.createdAt,
        blogName: newPost.blogName,
        blogtyp: newPost.blogtyp,
      })
      .execute();

    /*вернется айдишка нового поста */
    return result.raw[0].id;
  }

  async getPostById(postId: string) {
    const result: Posttyp | null = await this.posttypRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blogtyp', 'b')
      .where('p.id = :postId', { postId })
      .getOne();

    if (!result) return null;

    return result;
  }

  async updatePost(
    postId: string,
    updatePostInputModel: UpdatePostForCorrectBlogInputModel,
  ) {
    const result = await this.posttypRepository
      .createQueryBuilder()
      .update(Posttyp)
      .set({
        title: updatePostInputModel.title,
        shortDescription: updatePostInputModel.shortDescription,
        content: updatePostInputModel.content,
      })
      .where('id = :postId', { postId })
      .execute();

    /* result это вот такая структура
     UpdateResult { generatedMaps: [], raw: [], affected: 0 }
      affected-- это количество измененных саписей
    */

    if (result.affected === 0) return false;
    return true;
  }

  async deletePost(postId: string) {
    const result = await this.posttypRepository
      .createQueryBuilder()
      .delete()
      .where('id = :postId', { postId })
      .execute();

    /*affected указывает на количество удаленных записей */

    if (result.affected === 0) return false;
    return true;
  }
}
