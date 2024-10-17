import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './feature/users/api/user-controller';
import { UsersService } from './feature/users/services/user-service';
import { UsersRepository } from './feature/users/repositories/user-repository';
import { User, UserSchema } from './feature/users/domains/domain-user';
import { UserQueryRepository } from './feature/users/repositories/user-query-repository';
import { BlogController } from './feature/blogs/api/blog-controller';
import { Blog, BlogShema } from './feature/blogs/domains/domain-blog';
import { BlogRepository } from './feature/blogs/repositories/blog-repository';
import { CreateBlogService } from './feature/blogs/services/create-blog-service';
import { BlogQueryRepository } from './feature/blogs/repositories/blog-query-repository';
import { Post, PostShema } from './feature/posts/domains/domain-post';
import { PostRepository } from './feature/posts/repositories/post-repository';
import { PostQueryRepository } from './feature/posts/repositories/post-query-repository';
import { PostService } from './feature/posts/services/post-service';
import { PostsController } from './feature/posts/api/post-controller';
import { CommentQueryRepository } from './feature/comments/reposetories/comment-query-repository';
import {
  Comment,
  CommentShema,
} from './feature/comments/domaims/domain-comment';
import { CommentController } from './feature/comments/api/comment-controller';
import { TestController } from './feature/test/test-controller';
import dotenv from 'dotenv';
import { HashPasswordService } from './common/service/hash-password-service';
import { AuthController } from './feature/auth/api/auth-controller';
import { AuthService } from './feature/auth/services/auth-service';
import { TokenJwtService } from './common/service/token-jwt-service';
import { EmailSendService } from './common/service/email-send-service';
import { DeleteBlogByIdService } from './feature/blogs/services/delete-blog-by-id-service';
import { UpdateBlogService } from './feature/blogs/services/update-blog-service';
import { CreatePostForBlogService } from './feature/blogs/services/create-post-for-blog-service';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { ConfigurationType } from './settings/env-configuration';
import { CommentService } from './feature/comments/services/comment-service';
import { CommentRepository } from './feature/comments/reposetories/comment-repository';
import { AuthTokenGuard } from './common/guard/auth-token-guard';
import {
  LikeStatusForPost,
  LikeStatusForPostShema,
} from './feature/like-status-for-post/domain/domain-like-status-for-post';
import { LikeStatusForPostRepository } from './feature/like-status-for-post/repositories/like-status-for-post-repository';
import {
  LikeStatusForComment,
  LikeStatusForCommentShema,
} from './feature/like-status-for-comment/domain/domain-like-status-for-comment';
import { LikeStatusForCommentRepository } from './feature/like-status-for-comment/repositories/like-status-for-comment-repository';
import { DataUserExtractorFromTokenGuard } from './common/guard/data-user-extractor-from-token-guard';
import { BlogExistsConstraint } from './common/validators/blog-exists-constraint';
import {
  SecurityDevice,
  SecurityDeviceShema,
} from './feature/security-device/domains/domain-security-device';
import { SecurityDeviceRepository } from './feature/security-device/repositories/security-device-repository';
import { RefreshTokenGuard } from './common/guard/refresh-token-guard';
import { SecurityDeviceController } from './feature/security-device/api/security-device-controller';
import { SecurityDeviceService } from './feature/security-device/services/security-device-service';
import { SecurityDeviceQueryRepository } from './feature/security-device/repositories/security-device-query-repository';
import { VisitLimitGuard } from './common/guard/visit-limit-guard';
import {
  LimitVisit,
  LimitVisitSchema,
} from './feature/visit-limit/domains/domain-limit-visit';
import { LimitVisitService } from './feature/visit-limit/services/limit-visit-service';
import { LimitVisitRepository } from './feature/visit-limit/repositories/limit-visit-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersSqlRepository } from './feature/users/repositories/user-sql-repository';
import { SecurityDeviceSqlRepository } from './feature/security-device/repositories/security-device-sql-repository';
import { UserQuerySqlRepository } from './feature/users/repositories/user-query-sql-repository';
import { SecurityDeviceSqlQueryRepository } from './feature/security-device/repositories/security-device-sql-query-repository';
import { BlogSqlRepository } from './feature/blogs/repositories/blog-sql-repository';
import { BlogQuerySqlRepository } from './feature/blogs/repositories/blog-query-sql-repository';
import { PostSqlRepository } from './feature/posts/repositories/post-sql-repository';
import { PostQuerySqlRepository } from './feature/posts/repositories/post-query-sql-repository';
import { SaBlogController } from './feature/blogs/api/sa-blog-controller';
import { CommentSqlRepository } from './feature/comments/reposetories/comment-sql-repository';
import { CommentQuerySqlRepository } from './feature/comments/reposetories/comment-query-sql-repository';
import { LikeStatusForCommentSqlRepository } from './feature/like-status-for-comment/repositories/like-status-for-comment-sql-repository';
import { LikeStatusForPostSqlRepository } from './feature/like-status-for-post/repositories/like-status-for-post-sql-repository';
import { Usertyp } from './feature/users/domains/usertyp.entity';
import { Securitydevicetyp } from './feature/security-device/domains/securitydevicetype.entity';
import { UserSqlTypeormRepository } from './feature/users/repositories/user-sql-typeorm-repository';
import { SecurityDeviceSqlTypeormRepository } from './feature/security-device/repositories/security-device-sql-typeorm-repository';
import { Blogtyp } from './feature/blogs/domains/blogtyp.entity';
import { BlogSqlTypeormRepository } from './feature/blogs/repositories/blog-sql-typeorm-repository';
import { BlogQuerySqlTypeormRepository } from './feature/blogs/repositories/blog-query-sql-typeorm-repository';
import { Posttyp } from './feature/posts/domains/posttyp.entity';
import { PostSqlTypeormRepository } from './feature/posts/repositories/post-sql-typeorm-repository';
import { PostQuerySqlTypeormRepository } from './feature/posts/repositories/post-query-sql-typeorm-repository';
import { LikeStatusForPostTyp } from './feature/like-status-for-post/domain/typ-like-status-for-post.entity';
import { LikeStatusForPostSqlTypeormRepository } from './feature/like-status-for-post/repositories/like-status-for-post-sql-typeorm-repository';
import { Commenttyp } from './feature/comments/domaims/commenttyp.entity';
import { CommentSqlTypeormRepository } from './feature/comments/reposetories/comment-sql-typeorm-repository';
import { CommentQuerySqlTypeormRepository } from './feature/comments/reposetories/comment-query-sql-typeorm-repository';
import { LikeStatusForCommentTyp } from './feature/like-status-for-comment/domain/typ-like-status-for-comment.entity';
import { TypLikeStatusForCommentSqlRepository } from './feature/like-status-for-comment/repositories/typ-like-status-for-comment-sql-repository';

dotenv.config();

/*декоратора @Module()---ЭТО КАК В ЭКСПРЕС КОМПОЗИШЕН-РУУТ..
в NestJS используются для организации
компонентов, контроллеров и сервисов в единое логическое целое.
  ---imports: Это массив других модулей, которые должны
быть импортированы в текущий модуль.Здесь вы можете указать модули,
которые предоставляют функциональность, необходимую для работы
компонентов и сервисов текущего модуля
  ---controllers: Это массив контроллеров, которые находятся
   в этом модуле. Контроллеры в NestJS отвечают за
   обработку HTTP-запросов и определение маршрутов.
    ---- providers: Это массив провайдеров, которые будут
     доступны в этом модуле. Провайдеры в NestJS отвечают
      за создание экземпляров сервисов и предоставление
      их внедрению зависимостей.   */
@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      /*   тут указание что модуль регистрируется
      глобально и доступен всему проекту */
      isGlobal: true,
      /* load- настройка в которой указано
      где сама конфигурация
       configuration это функция в которой прописана
      конфигурация */
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'pavel',
      database: 'typeOrmDatabase',
      autoLoadEntities: true,
      synchronize: true,
      //logging: ['query'],
    }),
    TypeOrmModule.forFeature([
      Usertyp,
      Securitydevicetyp,
      Blogtyp,
      Posttyp,
      LikeStatusForPostTyp,
      Commenttyp,
      LikeStatusForCommentTyp,
    ]),

    /*    --------type: 'postgres',    определяет  базу данных
    к которой подключаюсь
    .........далее в pgAdmin   Servers->PostgreSQL->правой кнопкой
    мыши->Properties->Connection----- и от сюда надо
    значения перенести
    ----------host: 'localhost',
      ----------port: 5432,
      ----------username: 'postgres',
    
      --------password: 'jjjj',------далее ПАРОЛЬ еще когда настраивал
    базу данных- его создавал
    
    ---------database: 'typeOrmDatabase', название подбазыДанных
    в базе postgres       уже внутри typeOrmDatabase будут
    таблицы содержатся    И СОЗДАТЬ БАЗУ(подбазу)ДАННЫХ
    НАДО РУКАМИ   В    pgAdmin
    
    -----  autoLoadEntities: true, использовать чтоб ненадобыло
    перечислять вручную все cущности-классы- таблицы
    Там где декоратор @Entity будет те и добавит
    
    ------synchronize: true,  когда в коде пропишу миграцию
    и СОХРАНЮ-- тогда и запрос автоматом в базу
    данных пойдет по изменениям (МИГРАЦИЯ- это
    добавление колонок в таблице или изменения какието)
    В ДАЛЬНЕЙШЕМ ЭТО СВОЙСТВО ИЗМЕНИМ НА БОЛЕЕ ЛУЧШЕЕ
    
    ---  logging: ['query'],  это свойство в Terminal
    будет прописывать запрос к sql
    
    ------ TypeOrmModule.forFeature([]),---здесь регистрирую
    все entity, через запятую
    НО ЧАТ ГПТ НАПИСАЛ СЛЕДУЮЩЕЕ____------Если вы уже
    используете autoLoadEntities: true и все ваши сущности
    помечены декоратором @Entity, то использование
    TypeOrmModule.forFeature([]) может быть избыточным.
      В таком случае система сама загрузит все необходимые
    сущности из вашего приложения.
    
      Таким образом, если вы уже используете autoLoadEntities: true
    и все ваши сущности правильно помечены декоратором
    @Entity, вы можете не использовать явное перечисление
    сущностей через TypeOrmModule.forFeature([]), так как
    они будут автоматически загружены.
    --------ПОЭТОМУ УБИРАЮ TypeOrmModule.forFeature([])*/

    /////////////////////////////////////////////////

    ////////////////////////////////////////////

    /*   метод forRootAsync, предоставляемый модулем
    MongooseModule из @nestjs/mongoose  используется для асинхронной
    инициализации   подключения к MongoDB, в отличие от синхронного
    MongooseModule.forRoot()*/
    MongooseModule.forRootAsync({
      /* configService---В приведенном примере, ConfigService
      используется для получения настроек из конфигурационного
      объекта, который был определен ранее в приложении
      в файле  env-configuration*/
      useFactory: (configService: ConfigService<ConfigurationType, true>) => {
        /*Метод get() используется для получения
        значений из конфигурационного объекта*/
        const environmentSettings = configService.get(
          'environmentSettings',

          {
            /* { infer: true } - это опция, которая указывает
           ConfigService автоматически определять тип 
           возвращаемого значения*/
            infer: true,
          },
        );

        const databaseSettings = configService.get('databaseSettings', {
          infer: true,
        });

        const uri = environmentSettings.isTesting
          ? databaseSettings.MONGO_CONNECTION_URI_FOR_TESTS
          : databaseSettings.MONGO_CONNECTION_URI;

        /*возвращает объект с настройками подключения к MongoDB,
          который будет использоваться модулем MongooseModule*/
        return {
          uri: uri,
        };
      },
      /* Этот параметр указывает, что ConfigService должен быть внедрен 
       в фабричную функцию, чтобы она могла получить 
       доступ к экземпляру ConfigService*/
      inject: [ConfigService],
    }),

    /*   ///////////////////////////////////////////////////

    /!*   метод forRootAsync, предоставляемый модулем
  MongooseModule из @nestjs/mongoose  используется для асинхронной
  инициализации   подключения к MongoDB, в отличие от синхронного
       MongooseModule.forRoot().*!/
    MongooseModule.forRootAsync({
      /!*  Здесь мы импортируем ConfigModule, который
     предоставляет возможность использовать ConfigService
      для получения значений конфигурации.
      Это необходимо, чтобы ConfigService был доступен внутри
      useFactory функции.*!/
      useFactory: (configService: ConfigService<ConfigurationType, true>) => ({
        uri: configService.get<string>('databaseSettings.MONGO_CONNECTION_URI'),
      }),
      inject: [ConfigService],
    }),

    /////////////////////////////////////////////////////*/

    /*  /////////////////////////////////////////////
      MongooseModule.forRootAsync({
        useFactory: (configService: ConfigService<ConfigurationType, true>) => {
          const environmentSettings = configService.get('environmentSettings', {
            infer: true,
          });
          const databaseSettings = configService.get('databaseSettings', {
            infer: true,
          });
  
          const uri = environmentSettings.isTesting
            ? databaseSettings.MONGO_CONNECTION_URI_FOR_TESTS
            : databaseSettings.MONGO_CONNECTION_URI;
          console.log(uri);
  
          return {
            uri: uri,
          };
        },
        inject: [ConfigService],
      }),
      
      /////////////////////////////////////////////////////////*/
    //...
    /*тут регистрация СХЕМЫ монгусовской модельки*/
    MongooseModule.forFeature([
      {
        /*--User.name  у класса(не у экземпляра класса) берут имя оно будет примерно такое -- 'user'*/
        name: User.name,
        schema: UserSchema,
      },
      { name: Blog.name, schema: BlogShema },
      { name: Post.name, schema: PostShema },
      { name: Comment.name, schema: CommentShema },
      { name: LikeStatusForPost.name, schema: LikeStatusForPostShema },
      { name: LikeStatusForComment.name, schema: LikeStatusForCommentShema },
      { name: SecurityDevice.name, schema: SecurityDeviceShema },
      { name: LimitVisit.name, schema: LimitVisitSchema },
    ]),
  ],
  /*все контроллеры приложения должны тут добавлены */
  controllers: [
    UsersController,
    BlogController,
    PostsController,
    CommentController,
    TestController,
    AuthController,
    SecurityDeviceController,
    SaBlogController,
  ],
  /* все сервисы приложения должны тут добавлены */
  providers: [
    UsersService,
    UsersRepository,
    UserQueryRepository,
    CreateBlogService,
    BlogRepository,
    BlogQueryRepository,
    PostRepository,
    PostQueryRepository,
    PostService,
    CommentQueryRepository,
    HashPasswordService,
    AuthService,
    TokenJwtService,
    EmailSendService,
    DeleteBlogByIdService,
    UpdateBlogService,
    CreatePostForBlogService,
    CommentService,
    CommentRepository,
    AuthTokenGuard,
    DataUserExtractorFromTokenGuard,
    LikeStatusForPostRepository,
    LikeStatusForCommentRepository,
    BlogExistsConstraint,
    SecurityDeviceRepository,
    RefreshTokenGuard,
    SecurityDeviceService,
    SecurityDeviceQueryRepository,
    VisitLimitGuard,
    LimitVisitService,
    LimitVisitRepository,
    UsersSqlRepository,
    SecurityDeviceSqlRepository,
    UserQuerySqlRepository,
    SecurityDeviceSqlQueryRepository,
    BlogSqlRepository,
    BlogQuerySqlRepository,
    PostSqlRepository,
    PostQuerySqlRepository,
    CommentSqlRepository,
    CommentQuerySqlRepository,
    LikeStatusForCommentSqlRepository,
    LikeStatusForPostSqlRepository,
    UserSqlTypeormRepository,
    SecurityDeviceSqlTypeormRepository,
    BlogSqlTypeormRepository,
    BlogQuerySqlTypeormRepository,
    PostSqlTypeormRepository,
    PostQuerySqlTypeormRepository,
    LikeStatusForPostSqlTypeormRepository,
    CommentSqlTypeormRepository,
    CommentQuerySqlTypeormRepository,
    TypLikeStatusForCommentSqlRepository,
  ],
})
/*export class AppModule {} в данном контексте
представляет сам модуль. То что собрано -сконфигурировано
выше--это и есть МОДУЛЬ и это как часть чегото, и часть
эту можно как npm-пакет кудато вставить-добавить*/
export class AppModule {}
