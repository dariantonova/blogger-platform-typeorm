import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { IsExistingBlogIdConstraint } from './posts/api/validation/is-existing-blog-id.decorator';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteBlogUseCase } from './blogs/application/usecases/admins/delete-blog.usecase';
import { CreateBlogUseCase } from './blogs/application/usecases/admins/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/admins/update-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/admins/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/admins/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/admins/delete-post.usecase';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { GetBlogByIdOrNotFoundFailQueryHandler } from './blogs/application/queries/get-blog-by-id-or-not-found-fail.query';
import { GetBlogByIdOrInternalFailQueryHandler } from './blogs/application/queries/get-blog-by-id-or-internal-fail.query';
import { GetBlogPostsQueryHandler } from './blogs/application/queries/get-blog-posts.query';
import { GetPostByIdOrInternalFailQueryHandler } from './posts/application/queries/get-post-by-id-or-internal-fail.query';
import { GetPostByIdOrNotFoundFailQueryHandler } from './posts/application/queries/get-post-by-id-or-not-found-fail.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { GetPostCommentsQueryHandler } from './posts/application/queries/get-post-comments.query';
import { GetCommentByIdOrNotFoundFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-not-found-fail.query';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { GetCommentByIdOrInternalFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-internal-fail.query';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { MakePostLikeOperationUseCase } from './posts/application/usecases/make-post-like-operation.usecase';
import { MakeCommentLikeOperationUseCase } from './comments/application/usecases/make-comment-like-operation.usecase';
import { LikesQueryRepository } from './likes/infrastructure/query/likes.query-repository';
import { CommentsQueryService } from './comments/application/comments.query-service';
import { PostsQueryService } from './posts/application/posts.query-service';
import { BlogsSaController } from '../blogger-platform-sql/blogs/api/blogs-sa.controller.sql';
import { GetBlogsQueryHandlerSql } from '../blogger-platform-sql/blogs/application/queries/get-blogs.query.sql';
import { BlogsQueryRepositorySql } from '../blogger-platform-sql/blogs/infrastructure/query/blogs.query-repository.sql';
import { BlogsRepositorySql } from '../blogger-platform-sql/blogs/infrastructure/blogs.repository.sql';
import { GetBlogByIdOrInternalFailQueryHandlerSql } from '../blogger-platform-sql/blogs/application/queries/get-blog-by-id-or-internal-fail.query.sql';
import { CreateBlogUseCaseSql } from '../blogger-platform-sql/blogs/application/usecases/create-blog.usecase.sql';
import { UpdateBlogUseCaseSql } from '../blogger-platform-sql/blogs/application/usecases/update-blog.usecase.sql';
import { PostsRepositorySql } from '../blogger-platform-sql/posts/infrastructure/posts.repository.sql';
import { DeleteBlogUseCaseSql } from '../blogger-platform-sql/blogs/application/usecases/delete-blog.usecase.sql';
import { GetBlogPostsQueryHandlerSql } from '../blogger-platform-sql/posts/application/queries/get-blog-posts.query.sql';
import { PostsQueryServiceSql } from '../blogger-platform-sql/posts/application/posts.query-service.sql';
import { PostsQueryRepositorySql } from '../blogger-platform-sql/posts/infrastructure/query/posts.query-repository.sql';
import { CreatePostUseCaseSql } from '../blogger-platform-sql/posts/application/usecases/create-post.usecase.sql';
import { GetPostByIdOrInternalFailQueryHandlerSql } from '../blogger-platform-sql/posts/application/queries/get-post-by-id-or-internal-fail.query.sql';
import { UpdateBlogPostUseCaseSql } from '../blogger-platform-sql/posts/application/usecases/update-blog-post.usecase.sql';

const commandHandlers = [
  DeleteBlogUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  MakePostLikeOperationUseCase,
  MakeCommentLikeOperationUseCase,
];

const queryHandlers = [
  GetBlogsQueryHandler,
  GetBlogByIdOrNotFoundFailQueryHandler,
  GetBlogByIdOrInternalFailQueryHandler,
  GetBlogPostsQueryHandler,
  GetPostByIdOrInternalFailQueryHandler,
  GetPostByIdOrNotFoundFailQueryHandler,
  GetPostsQueryHandler,
  GetPostCommentsQueryHandler,
  GetCommentByIdOrNotFoundFailQueryHandler,
  GetCommentByIdOrInternalFailQueryHandler,
];

const controllersSql = [BlogsSaController];
const providersSql = [
  BlogsQueryRepositorySql,
  BlogsRepositorySql,
  PostsRepositorySql,
  PostsQueryRepositorySql,
  PostsQueryServiceSql,
];
const queryHandlersSql = [
  GetBlogsQueryHandlerSql,
  GetBlogByIdOrInternalFailQueryHandlerSql,
  GetBlogPostsQueryHandlerSql,
  GetPostByIdOrInternalFailQueryHandlerSql,
];
const commandHandlersSql = [
  CreateBlogUseCaseSql,
  UpdateBlogUseCaseSql,
  DeleteBlogUseCaseSql,
  CreatePostUseCaseSql,
  UpdateBlogPostUseCaseSql,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    CqrsModule.forRoot(),
    UserAccountsModule,
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    ...controllersSql,
  ],
  providers: [
    BlogsQueryRepository,
    BlogsRepository,
    PostsQueryRepository,
    PostsRepository,
    CommentsQueryRepository,
    CommentsRepository,
    IsExistingBlogIdConstraint,
    ...commandHandlers,
    ...queryHandlers,
    LikesRepository,
    LikesQueryRepository,
    CommentsQueryService,
    PostsQueryService,
    ...providersSql,
    ...queryHandlersSql,
    ...commandHandlersSql,
  ],
})
export class BloggerPlatformModule {}
