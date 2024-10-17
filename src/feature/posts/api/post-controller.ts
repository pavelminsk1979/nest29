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
import { PostService } from '../services/post-service';
import { PostWithLikesInfo, ViewModelWithArrayPosts } from './types/views';
import { ViewArrayComments } from '../../comments/types/views';
import { AuthGuard } from '../../../common/guard/auth-guard';
import { CreateCommentForPostInputModel } from './pipes/create-coment-for-post-input-model';
import { AuthTokenGuard } from '../../../common/guard/auth-token-guard';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { CommentService } from '../../comments/services/comment-service';
import { Request } from 'express';
import { SetLikeStatusForPostInputModel } from './pipes/set-like-status-input-model';
import { DataUserExtractorFromTokenGuard } from '../../../common/guard/data-user-extractor-from-token-guard';
import { CreatePostInputModel } from './pipes/create-post-input-model';
import { PostQuerySqlTypeormRepository } from '../repositories/post-query-sql-typeorm-repository';
import { CommentQuerySqlTypeormRepository } from '../../comments/reposetories/comment-query-sql-typeorm-repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postService: PostService,
    protected commentService: CommentService,
    protected postQuerySqlTypeormRepository: PostQuerySqlTypeormRepository,
    protected commentQuerySqlTypeormRepository: CommentQuerySqlTypeormRepository,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createPost(@Body() createPostInputModel: CreatePostInputModel) {
    /* создать новый пост  и вернуть данные этого поста и также
    внутри структуру данных(снулевыми значениями)  о лайках  к этому посту*/
    const postId: string | null =
      await this.postService.createPost(createPostInputModel);

    if (!postId) {
      throw new NotFoundException(
        'Cannot create post because blog does not exist-:method-post,url-posts',
      );
    }

    return postId;
  }

  @UseGuards(DataUserExtractorFromTokenGuard)
  @Get()
  async getPosts(
    @Query() queryParamsPostInputModel: QueryParamsInputModel,
    @Req() request: Request,
  ): Promise<ViewModelWithArrayPosts> {
    /*Айдишка пользователя нужна для-- когда
 отдадим ответ в нем будет информация
 о том какой статус уcтановил данный пользователь
 который этот запрос делает */

    const userId: string | null = request['userId'];

    const posts: ViewModelWithArrayPosts =
      await this.postQuerySqlTypeormRepository.getPosts(
        userId,
        queryParamsPostInputModel,
      );

    return posts;
  }

  @UseGuards(DataUserExtractorFromTokenGuard)
  @Get(':id')
  async getPostByPostId(
    @Param('id') postId: string,
    @Req() request: Request,
  ): Promise<PostWithLikesInfo | null> {
    /*Айдишка пользователя нужна для-- когда
отдадим ответ в нем дудет информация
о том какой статус учтановил данный пользователь
который этот запрос делает */

    const userId: string | null = request['userId'];

    const post: PostWithLikesInfo | null =
      await this.postQuerySqlTypeormRepository.getPostByPostId(postId, userId);

    if (post) {
      return post;
    } else {
      throw new NotFoundException('post not found:method-get,url /posts/id');
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    const isDeletePostById = await this.postService.deletePostById(postId);

    if (isDeletePostById) {
      return;
    } else {
      throw new NotFoundException(
        'post not found:andpoint-delete,url /post/id',
      );
    }
  }

  @UseGuards(DataUserExtractorFromTokenGuard)
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() queryCommentsForPost: QueryParamsInputModel,
    @Req() request: Request,
  ): Promise<ViewArrayComments> {
    /*Айдишка пользователя нужна для-- когда
отдадим ответ в нем будет информация
о том какой статус учтановил данный пользователь
который этот запрос делает */

    const userId: string | null = request['userId'];

    //вернуть все коментарии(массив) корректного поста
    //и у каждого коментария будут данные о лайках
    //к этому коментарию

    const comments: ViewArrayComments | null =
      await this.commentQuerySqlTypeormRepository.getComments(
        userId,
        postId,
        queryCommentsForPost,
      );
    debugger;
    if (comments) {
      return comments;
    } else {
      throw new NotFoundException(
        'post or comments  is not exists  ' +
          ':method-get,url -posts/postId/comments',
      );
    }
  }

  /*для создания КОМЕНТАРИЯ надо чтоб пользователь
  был залогинен и у него был AccessToken в заголовках
  AuthTokenGuard сам достанет токен из заголовков
  и проверку сделает этого токена
  */
  @UseGuards(AuthTokenGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() createCommentForPostInputModel: CreateCommentForPostInputModel,
    @Req() request: Request,
  ) {
    // когда AccessToken проверяю в AuthTokenGuard - тогда
    // из него достаю userId и помещаю ее в request

    const userId = request['userId'];

    //cоздаю в базе таблицу  КОМЕНТ

    const commentId: string | null = await this.commentService.createComment(
      userId,
      postId,
      createCommentForPostInputModel.content,
    );

    if (!commentId) {
      throw new NotFoundException(
        'comment not create :method-post,url-posts/:postId/comments',
      );
    }

    /* Один коментарий надо получить и вернуть---тот
     который только что создал

     ---userId  чтоб вернуть статус установленый этим юзером*/

    const comment = await this.commentQuerySqlTypeormRepository.getCommentById(
      userId,
      commentId,
    );

    if (comment) {
      return comment;
    } else {
      /*HTTP-код 404*/
      throw new NotFoundException(
        'comment not create :method-post,url-posts/:postId/comments',
      );
    }
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async setLikeStatusForPost(
    @Param('postId') postId: string,
    @Body() likeStatusForPostInputModel: SetLikeStatusForPostInputModel,
    @Req() request: Request,
  ) {
    /* ---лайкСтатус будет конкретного user
     и для конкретного поста
     -----лайкСтатус  будет создан новый документ
     или изменен уже существующий документ*/

    const userId = request['userId'];

    const isSetLikestatusForPost: boolean =
      await this.postService.setLikestatusForPost(
        userId,
        postId,
        likeStatusForPostInputModel.likeStatus,
      );

    if (isSetLikestatusForPost) {
      return;
    } else {
      throw new NotFoundException(
        'post not exist :method-put ,url /posts/postId/like-status',
      );
    }
  }
}
