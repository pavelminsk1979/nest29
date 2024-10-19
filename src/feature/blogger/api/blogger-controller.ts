import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBlogInputModel } from '../../blogs/api/pipes/create-blog-input-model';
import { AuthTokenGuard } from '../../../common/guard/auth-token-guard';
import { BloggerService } from '../services/blogger-service';
import { BlogQuerySqlTypeormRepository } from '../../blogs/repositories/blog-query-sql-typeorm-repository';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { DataUserExtractorFromTokenGuard } from '../../../common/guard/data-user-extractor-from-token-guard';
import { CreatePostForBlogInputModel } from '../../blogs/api/pipes/create-post-for-blog-input-model';
import { PostService } from '../../posts/services/post-service';
import { PostQuerySqlTypeormRepository } from '../../posts/repositories/post-query-sql-typeorm-repository';
import { ViewModelWithArrayPosts } from '../../posts/api/types/views';
import { UpdatePostForCorrectBlogInputModel } from '../../posts/api/pipes/update-post-for-correct-blog-input-model';

@Controller('blogger')
export class BloggerController {
  constructor(
    protected bloggerService: BloggerService,
    protected blogQuerySqlTypeormRepository: BlogQuerySqlTypeormRepository,
    protected postService: PostService,
    protected postQuerySqlTypeormRepository: PostQuerySqlTypeormRepository,
  ) {}

  @UseGuards(AuthTokenGuard, DataUserExtractorFromTokenGuard)
  @Post('blogs')
  async createBlog(
    @Body() createBlogInputModel: CreateBlogInputModel,
    @Req() request: Request,
  ) {
    const userId: string | null = request['userId'];

    if (!userId) {
      {
        throw new NotFoundException(
          'user not exist:andpoint-Post ,url /blogger/blogs',
        );
      }
    }

    const blogId = await this.bloggerService.createBlogForCorrectUser(
      createBlogInputModel,
      userId,
    );

    const blog = await this.blogQuerySqlTypeormRepository.getBlogById(blogId);

    return blog;
  }

  @UseGuards(AuthTokenGuard, DataUserExtractorFromTokenGuard)
  @Get('blogs')
  async getAllBlogs(
    @Query() queryParamsBlogInputModel: QueryParamsInputModel,
    @Req() request: Request,
  ) {
    const userId: string | null = request['userId'];

    const blogs = await this.blogQuerySqlTypeormRepository.getBlogs(
      queryParamsBlogInputModel,
      userId,
    );

    return blogs;
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('blogs/:id')
  async updateBlog(
    @Param('id') bologId: string,
    @Body() updateBlogInputModel: CreateBlogInputModel,
    @Req() request: Request,
  ) {
    const userId: string = request['userId'];

    const isUpdateBlog = await this.bloggerService.updateBlog(
      bologId,
      updateBlogInputModel,
      userId,
    );

    if (isUpdateBlog) {
      return;
    } else {
      throw new NotFoundException(
        'blog not update:andpoint-put ,url /blogs/id',
      );
    }
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('blogs/:id')
  async deleteBlogById(@Param('id') blogId: string, @Req() request: Request) {
    const userId: string = request['userId'];

    const isDeleteBlogById = await this.bloggerService.deleteBlogById(
      blogId,
      userId,
    );

    if (isDeleteBlogById) {
      return;
    } else {
      throw new NotFoundException(
        'blog not found:andpoint-delete,url /blogs/id',
      );
    }
  }

  @UseGuards(AuthTokenGuard, DataUserExtractorFromTokenGuard)
  @Post('blogs/:id/posts')
  async createPostFortBlog(
    @Param('id') blogId: string,
    @Body() createPostForBlogInputModel: CreatePostForBlogInputModel,
    @Req() request: Request,
  ) {
    const userId: string | null = request['userId'];

    /* создать новый пост ДЛЯ КОНКРЕТНОГО БЛОГА и вернут
     данные этого поста и также структуру 
    данных(снулевыми значениями)  о лайках к этому посту*/

    const postId: string | null =
      await this.postService.createPostForCorrectBlog(
        blogId,
        createPostForBlogInputModel,
      );

    if (!postId) {
      throw new NotFoundException(
        'Not found blog- ' + ':method-post,url -blogs/:blogId /post',
      );
    }

    const post = await this.postQuerySqlTypeormRepository.getPostByPostId(
      postId,
      userId,
    );

    if (post) {
      return post;
    } else {
      throw new NotFoundException(
        'Not create post- ' + ':method-post,url -blogs/:blogId /post',
      );
    }
  }

  @UseGuards(AuthTokenGuard, DataUserExtractorFromTokenGuard)
  @Get('blogs/:id/posts')
  async getPostsForBlog(
    @Param('id') blogId: string,
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

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('blogs/:id/posts/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Body() updatePostInputModel: UpdatePostForCorrectBlogInputModel,
  ) {
    const isUpdatePost: boolean = await this.postService.updatePost(
      blogId,
      postId,
      updatePostInputModel,
    );

    if (isUpdatePost) {
      return;
    } else {
      throw new NotFoundException(
        'post not update:andpoint-put ,url /posts/id',
      );
    }
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('blogs/:id/posts/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
  ) {
    const isDeletePost: boolean = await this.postService.deletePost(
      blogId,
      postId,
    );

    if (isDeletePost) {
      return;
    } else {
      throw new NotFoundException(
        'post not update:andpoint-put ,url /posts/id',
      );
    }
  }
}
