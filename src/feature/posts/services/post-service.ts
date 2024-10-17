import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../domains/domain-post';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostRepository } from '../repositories/post-repository';
import { CreatePostInputModel } from '../api/pipes/create-post-input-model';
import { LikeStatus } from '../../../common/types';
import {
  LikeStatusForPost,
  LikeStatusForPostDocument,
} from '../../like-status-for-post/domain/domain-like-status-for-post';
import { UpdatePostForCorrectBlogInputModel } from '../api/pipes/update-post-for-correct-blog-input-model';
import { Blogtyp } from '../../blogs/domains/blogtyp.entity';
import { BlogSqlTypeormRepository } from '../../blogs/repositories/blog-sql-typeorm-repository';
import { PostSqlTypeormRepository } from '../repositories/post-sql-typeorm-repository';
import { CreateLikeStatusForPost, CreatePostTypeorm } from '../api/types/dto';
import { CreatePostForBlogInputModel } from '../../blogs/api/pipes/create-post-for-blog-input-model';
import { LikeStatusForPostSqlTypeormRepository } from '../../like-status-for-post/repositories/like-status-for-post-sql-typeorm-repository';
import { UserSqlTypeormRepository } from '../../users/repositories/user-sql-typeorm-repository';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postRepository: PostRepository,
    @InjectModel(LikeStatusForPost.name)
    protected likeStatusModelForPost: Model<LikeStatusForPostDocument>,
    protected blogSqlTypeormRepository: BlogSqlTypeormRepository,
    protected postSqlTypeormRepository: PostSqlTypeormRepository,
    protected likeStatusForPostSqlTypeormRepository: LikeStatusForPostSqlTypeormRepository,
    protected userSqlTypeormRepository: UserSqlTypeormRepository,
  ) {}

  async createPostForCorrectBlog(
    blogId: string,
    createPostForBlogInputModel: CreatePostForBlogInputModel,
  ) {
    const { content, shortDescription, title } = createPostForBlogInputModel;

    /* нужно получить документ блога из базы чтобы взять от него
поле blogName И ЗАОДНО ПРОВЕРИТЬ ЕСТЬ ТАКОЙ БЛОГ ИЛИ НЕТ В БАЗЕ */
    const blog: Blogtyp | null =
      await this.blogSqlTypeormRepository.getBlogByBlogId(blogId);

    if (!blog) return null;

    /* создаю документ post */
    const newPost: CreatePostTypeorm = {
      title,
      shortDescription,
      content,
      createdAt: new Date().toISOString(),
      blogName: blog.name,
      blogtyp: blog,
    };

    return this.postSqlTypeormRepository.createPost(newPost);
  }

  async createPost(createPostInputModel: CreatePostInputModel) {
    const { content, shortDescription, title, blogId } = createPostInputModel;

    /* нужно получить документ блога из базы чтобы взять от него
поле blogName*/
    const blog: Blogtyp | null =
      await this.blogSqlTypeormRepository.getBlogByBlogId(blogId);

    if (!blog) return null;

    /* создаю документ post */
    const newPost: CreatePostTypeorm = {
      title,
      shortDescription,
      content,
      createdAt: new Date().toISOString(),
      blogName: blog.name,
      blogtyp: blog,
    };

    const postId = await this.postSqlTypeormRepository.createPost(newPost);

    return postId;
  }

  async updatePost(
    blogId: string,
    postId: string,
    updatePostInputModel: UpdatePostForCorrectBlogInputModel,
  ): Promise<boolean> {
    /*  проверить-- есть ли пост с данной айдишкой и
    чтоб он принадлежал блогу с данной айдишкой*/

    const post = await this.postSqlTypeormRepository.getPostById(postId);

    if (!post) return false;

    if (blogId !== post.blogtyp.id) return false;

    return this.postSqlTypeormRepository.updatePost(
      postId,
      updatePostInputModel,
    );
  }

  async deletePost(blogId: string, postId: string) {
    /*  проверить-- есть ли пост с данной айдишкой и
 чтоб он принадлежал блогу с данной айдишкой*/

    const post = await this.postSqlTypeormRepository.getPostById(postId);

    if (!post) return false;

    if (blogId !== post.blogtyp.id) return false;

    return this.postSqlTypeormRepository.deletePost(postId);
  }

  async deletePostById(postId: string) {
    return this.postRepository.deletePostById(postId);
  }

  async setLikestatusForPost(
    userId: string,
    postId: string,
    likeStatus: LikeStatus,
  ) {
    /* проверка- существует ли в базе такой ЮЗЕР 
   И ТАКЖЕ ПОНАДОБИТСЯ ЧТОБЫ СОЗДАТЬ 
   НОВУЮ ЗАПИСЬ В ТАБЛИЦЕ ЛАЙКПОСТ
   и также понадобится login  создателя--- этот 
   login потребуется вдальнейшем когда буду 
       формировать view для отдачи на фронт*/

    const user = await this.userSqlTypeormRepository.getUserById(userId);

    if (!user) return false;

    const login = user.login;

    /* проверка- существует ли в базе такой пост
     * И ТАКЖЕ ПОНАДОБИТСЯ ЧТОБЫ СОЗДАТЬ
     * НОВУЮ ЗАПИСЬ В ТАБЛИЦЕ ЛАЙКПОСТ*/

    const post = await this.postSqlTypeormRepository.getPostById(postId);

    if (!post) return false;

    /*  только ОДИН ЮЗЕР может поставить лайк к ОДНОМУ ПОСТУ
      ищу в базе ЛайковДляПостов  один документ   по
             двум полям userId и postId---*/

    const likePost =
      await this.likeStatusForPostSqlTypeormRepository.findLikePostByUserIdAndPostId(
        userId,
        postId,
      );

    if (!likePost) {
      /*Если документа  нет тогда надо cоздать
      новый документ и добавить в базу*/

      const newLikePost: CreateLikeStatusForPost = {
        posttyp: post,
        usertyp: user,
        likeStatus,
        login,
        addedAt: new Date().toISOString(),
      };

      return await this.likeStatusForPostSqlTypeormRepository.createLikePost(
        newLikePost,
      );
    }

    /*Если документ есть тогда надо изменить
     statusLike в нем на приходящий и установить
      теперещнюю дату  установки 
      АЙДИШКУ ВОЗМУ ОТ НАЙДЕНОЙ ЗАПИСИ 
      */

    const newDate = new Date().toISOString();

    const idLikePost = likePost.id;

    return await this.likeStatusForPostSqlTypeormRepository.updateLikePost(
      idLikePost,
      likeStatus,
      newDate,
    );
  }

  /*  async setLikestatusForPost(
      userId: string,
      postId: string,
      likeStatus: LikeStatus,
    ) {
      const user = await this.usersSqlRepository.getUserById(userId);
      /!*для создания нового документа(newLikeStatusForPost) потребуется
    login  создателя--- этот login потребуется вдальнейшем когда буду 
     формировать view для отдачи на фронт *!/
  
      const login = user!.login;
  
      /!* проверка- существует ли в базе такой пост*!/
  
      const post = await this.postSqlRepository.getPost(postId);
  
      if (!post) return false;
  
      /!*    ищу в базе ЛайковДляПостов  один документ   по
               двум полям userData.userId и postId---*!/
  
      const likePost: LikeStatusForPostWithId | null =
        await this.likeStatusForPostSqlRepository.findLikePostByUserIdAndPostId(
          userId,
          postId,
        );
  
      if (!likePost) {
        /!*Если документа  нет тогда надо cоздать
        новый документ и добавить в базу*!/
  
        const newLikePost: LikeStatusForPost = {
          userId,
          postId,
          likeStatus,
          login,
          addedAt: new Date().toISOString(),
        };
  
        return await this.likeStatusForPostSqlRepository.createLikePost(
          newLikePost,
        );
      }
  
      /!*Если документ есть тогда надо изменить
       statusLike в нем на приходящий и установить теперещнюю дату
        установки *!/
  
      const currentlikeStatus = likeStatus;
  
      const currentAddedAt = new Date().toISOString();
  
      const idCurrentLikePost = likePost.id;
  
      return await this.likeStatusForPostSqlRepository.changeLikePost(
        idCurrentLikePost,
        currentlikeStatus,
        currentAddedAt,
      );
    }*/
}
