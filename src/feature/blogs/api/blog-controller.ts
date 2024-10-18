import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ViewModelWithArrayPosts } from '../../posts/api/types/views';
import { CommandBus } from '@nestjs/cqrs';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { CreateBlogInputModel } from './pipes/create-blog-input-model';
import { CreateBlogCommand } from '../services/create-blog-service';
import { BlogQuerySqlTypeormRepository } from '../repositories/blog-query-sql-typeorm-repository';
import { PostQuerySqlTypeormRepository } from '../../posts/repositories/post-query-sql-typeorm-repository';
import { DataUserExtractorFromTokenGuard } from '../../../common/guard/data-user-extractor-from-token-guard';

@Controller('blogs')
export class BlogController {
  constructor(
    /*это sqrs и service разбит на подчасти
     * и в каждой отдельный метод
     * конспект 1501*/
    protected commandBus: CommandBus,
    protected blogQuerySqlTypeormRepository: BlogQuerySqlTypeormRepository,
    protected postQuerySqlTypeormRepository: PostQuerySqlTypeormRepository,
  ) {}

  /*Nest.js автоматически возвращает следующие
  HTTP-статус коды по умолчанию:
  post 201,get 200, delete 200, put 200
  ....
  а ошибки по умолчанию
  post 400,get 404, delete 404, put 400*/

  //@UseGuards(AuthGuard)
  /*@HttpCode(HttpStatus.CREATED) необязательно
   * ибо метод пост поумолчанию HTTP-статус 201 */
  @Post()
  async createBlog(@Body() createBlogInputModel: CreateBlogInputModel) {
    const blog = await this.commandBus.execute(
      new CreateBlogCommand(createBlogInputModel),
    );

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-post,url /blogs');
    }
  }

  @Get()
  async getBlogs(@Query() queryParamsBlogInputModel: QueryParamsInputModel) {
    const userId = null;
    const blogs = await this.blogQuerySqlTypeormRepository.getBlogs(
      queryParamsBlogInputModel,
      userId,
    );

    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param('id') bologId: string) {
    const blog = await this.blogQuerySqlTypeormRepository.getBlogById(bologId);

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-get,url /blogs/id');
    }
  }

  /*  @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteBlogById(@Param('id') blogId: string) {
      const isDeleteBlogById: boolean | null = await this.commandBus.execute(
        new DeleteBlogByIdCommand(blogId),
      );
  
      if (isDeleteBlogById) {
        return;
      } else {
        throw new NotFoundException(
          'blog not found:andpoint-delete,url /blogs/id',
        );
      }
    }*/

  /*  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') bologId: string,
    @Body() updateBlogInputModel: CreateBlogInputModel,
  ) {
    const isUpdateBlog = await this.commandBus.execute(
      new UpdateBlogCommand(bologId, updateBlogInputModel),
    );

    if (isUpdateBlog) {
      return;
    } else {
      throw new NotFoundException(
        'blog not update:andpoint-put ,url /blogs/id',
      );
    }
  }*/

  /*  @UseGuards(AuthGuard, DataUserExtractorFromTokenGuard)
    @Post(':blogId/posts')
    async createPostFortBlog(
      @Param('blogId') blogId: string,
      @Body() createPostForBlogInputModel: CreatePostForBlogInputModel,
      @Req() request: Request,
    ): Promise<PostWithLikesInfo | null> {
      /!* чтобы переиспользовать в этом обработчике метод
   getPostById  ему нужна (userId)- она будет 
   в данном случае null но главное что удовлетворяю
   метод значением-userId*!/
  
      const userId: string | null = request['userId'];
  
      /!* создать новый пост ДЛЯ КОНКРЕТНОГО БЛОГА и вернут
       данные этого поста и также структуру 
      данных(снулевыми значениями)  о лайках к этому посту*!/
  
      const postId: string | null = await this.commandBus.execute(
        new CreatePostForBlogCommand(blogId, createPostForBlogInputModel),
      );
  
      if (!postId) {
        throw new NotFoundException(
          'Not found blog- ' + ':method-post,url -blogs/:blogId /post',
        );
      }
  
      const post: PostWithLikesInfo | null =
        await this.postQueryRepository.getPostById(userId, postId);
  
      if (post) {
        return post;
      } else {
        throw new NotFoundException(
          'Not create post- ' + ':method-post,url -blogs/:blogId /post',
        );
      }
    }*/

  @UseGuards(DataUserExtractorFromTokenGuard)
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParamsPostForBlogInputModel: QueryParamsInputModel,
    @Req() request: Request,
  ): Promise<ViewModelWithArrayPosts> {
    /*Айдишка пользователя нужна для-- когда
    отдадим ответ в нем дудет информация 
    о том какой статус учтановил данный пользователь
    который этот запрос делает */

    const userId: string | null = request['userId'];

    //вернуть все posts(массив) для корректного блога
    //и у каждого поста  будут данные о лайках

    const posts =
      await this.postQuerySqlTypeormRepository.getPostsByCorrectBlogId(
        blogId,
        queryParamsPostForBlogInputModel,
        userId,
      );

    if (posts) {
      return posts;
    } else {
      throw new NotFoundException(
        'blog  is not exists  ' + ':method-get,url -blogs/:blogId /posts',
      );
    }
  }
}
