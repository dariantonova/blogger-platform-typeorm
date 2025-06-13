import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
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
import { DeleteBlogPostUseCaseSql } from '../blogger-platform-sql/posts/application/usecases/delete-blog-post.usecase.sql';
import { GetBlogByIdOrNotFoundFailQueryHandlerSql } from '../blogger-platform-sql/blogs/application/queries/get-blog-by-id-or-not-found-fail.query.sql';
import { GetPostByIdOrNotFoundFailQueryHandlerSql } from '../blogger-platform-sql/posts/application/queries/get-post-by-id-or-not-found-fail.query.sql';
import { GetPostsQueryHandlerSql } from '../blogger-platform-sql/posts/application/queries/get-posts.query.sql';
import { GetCommentByIdOrInternalFailQueryHandlerSql } from '../blogger-platform-sql/comments/application/queries/get-comment-by-id-or-internal-fail.query.sql';
import { CreateCommentUseCaseSql } from '../blogger-platform-sql/comments/application/usecases/create-comment.usecase.sql';
import { CommentsRepositorySql } from '../blogger-platform-sql/comments/infrastructure/comments.repository.sql';
import { CommentsQueryRepositorySql } from '../blogger-platform-sql/comments/infrastructure/query/comments.query-repository.sql';
import { CommentsQueryServiceSql } from '../blogger-platform-sql/comments/application/comments.query-service.sql';
import { GetPostCommentsQueryHandlerSql } from '../blogger-platform-sql/comments/application/queries/get-post-comments.query.sql';
import { GetCommentByIdOrNotFoundFailQueryHandlerSql } from '../blogger-platform-sql/comments/application/queries/get-comment-by-id-or-not-found-fail.query.sql';
import { UpdateCommentUseCaseSql } from '../blogger-platform-sql/comments/application/usecases/update-comment.usecase.sql';
import { DeleteCommentUseCaseSql } from '../blogger-platform-sql/comments/application/usecases/delete-comment.usecase.sql';
import { MakeCommentLikeOperationUseCaseSql } from '../blogger-platform-sql/likes/application/usecases/make-comment-like-operation.usecase.sql';
import { CommentLikesRepositorySql } from '../blogger-platform-sql/likes/infrastructure/comment-likes.repository.sql';
import { CommentLikesQueryRepositorySql } from '../blogger-platform-sql/likes/infrastructure/query/comment-likes.query-repository.sql';
import { MakePostLikeOperationUseCaseSql } from '../blogger-platform-sql/likes/application/usecases/make-post-like-operation.usecase.sql';
import { PostLikesRepositorySql } from '../blogger-platform-sql/likes/infrastructure/post-likes.repository.sql';
import { PostLikesQueryRepositorySql } from '../blogger-platform-sql/likes/infrastructure/query/post-likes.query-repository.sql';
import { BloggerPlatformExternalServiceSql } from '../blogger-platform-sql/common/infrastructure/external/blogger-platform.external-service.sql';
import { BlogsControllerWrap } from '../blogger-platform-wrap/blogs/api/blogs.controller.wrap';
import { BlogsSaControllerWrap } from '../blogger-platform-wrap/blogs/api/blogs-sa.controller.wrap';
import { GetBlogByIdOrInternalFailQueryHandlerWrap } from '../blogger-platform-wrap/blogs/application/queries/get-blog-by-id-or-internal-fail.query.wrap';
import { GetBlogByIdOrNotFoundFailQueryHandlerWrap } from '../blogger-platform-wrap/blogs/application/queries/get-blog-by-id-or-not-found-fail.query.wrap';
import { GetBlogsQueryHandlerWrap } from '../blogger-platform-wrap/blogs/application/queries/get-blogs.query.wrap';
import { CreateBlogUseCaseWrap } from '../blogger-platform-wrap/blogs/application/usecases/create-blog.usecase.wrap';
import { DeleteBlogUseCaseWrap } from '../blogger-platform-wrap/blogs/application/usecases/delete-blog.usecase.wrap';
import { UpdateBlogUseCaseWrap } from '../blogger-platform-wrap/blogs/application/usecases/update-blog.usecase.wrap';
import { BlogsRepositoryWrap } from '../blogger-platform-wrap/blogs/infrastructure/blogs.repository.wrap';
import { BlogsQueryRepositoryWrap } from '../blogger-platform-wrap/blogs/infrastructure/query/blogs.query-repository.wrap';
import { PostsControllerWrap } from '../blogger-platform-wrap/posts/api/posts.controller.wrap';
import { GetBlogPostsQueryHandlerWrap } from '../blogger-platform-wrap/posts/application/queries/get-blog-posts.query.wrap';
import { GetPostByIdOrInternalFailQueryHandlerWrap } from '../blogger-platform-wrap/posts/application/queries/get-post-by-id-or-internal-fail.query.wrap';
import { GetPostByIdOrNotFoundFailQueryHandlerWrap } from '../blogger-platform-wrap/posts/application/queries/get-post-by-id-or-not-found-fail.query.wrap';
import { GetPostsQueryHandlerWrap } from '../blogger-platform-wrap/posts/application/queries/get-posts.query.wrap';
import { CreatePostUseCaseWrap } from '../blogger-platform-wrap/posts/application/usecases/create-post.usecase.wrap';
import { DeleteBlogPostUseCaseWrap } from '../blogger-platform-wrap/posts/application/usecases/delete-blog-post.usecase.wrap';
import { UpdateBlogPostUseCaseWrap } from '../blogger-platform-wrap/posts/application/usecases/update-blog-post.usecase.wrap';
import { PostsRepositoryWrap } from '../blogger-platform-wrap/posts/infrastructure/posts.repository.wrap';
import { PostsQueryRepositoryWrap } from '../blogger-platform-wrap/posts/infrastructure/query/posts.query-repository.wrap';
import { CommentsControllerWrap } from '../blogger-platform-wrap/comments/api/comments.controller.wrap';
import { GetCommentByIdOrInternalFailQueryHandlerWrap } from '../blogger-platform-wrap/comments/application/queries/get-comment-by-id-or-internal-fail.query.wrap';
import { GetCommentByIdOrNotFoundFailQueryHandlerWrap } from '../blogger-platform-wrap/comments/application/queries/get-comment-by-id-or-not-found-fail.query.wrap';
import { GetPostCommentsQueryHandlerWrap } from '../blogger-platform-wrap/comments/application/queries/get-post-comments.query.wrap';
import { CreateCommentUseCaseWrap } from '../blogger-platform-wrap/comments/application/usecases/create-comment.usecase.wrap';
import { DeleteCommentUseCaseWrap } from '../blogger-platform-wrap/comments/application/usecases/delete-comment.usecase.wrap';
import { UpdateCommentUseCaseWrap } from '../blogger-platform-wrap/comments/application/usecases/update-comment.usecase.wrap';
import { CommentsRepositoryWrap } from '../blogger-platform-wrap/comments/infrastructure/comments.repository.wrap';
import { CommentsQueryRepositoryWrap } from '../blogger-platform-wrap/comments/infrastructure/query/comments.query-repository.wrap';
import { MakePostLikeOperationUseCaseWrap } from '../blogger-platform-wrap/likes/application/usecases/make-post-like-operation.usecase.wrap';
import { PostLikesRepositoryWrap } from '../blogger-platform-wrap/likes/infrastructure/post-likes.repository.wrap';
import { MakeCommentLikeOperationUseCaseWrap } from '../blogger-platform-wrap/likes/application/usecases/make-comment-like-operation.usecase.wrap';
import { CommentLikesRepositoryWrap } from '../blogger-platform-wrap/likes/infrastructure/comment-likes.repository.wrap';

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

const controllersSql = [
  // BlogsSaControllerSql,
  // BlogsControllerSql,
  // PostsControllerSql,
  // CommentsControllerSql,
];
const providersSql = [
  BlogsQueryRepositorySql,
  BlogsRepositorySql,
  PostsRepositorySql,
  PostsQueryRepositorySql,
  PostsQueryServiceSql,
  CommentsRepositorySql,
  CommentsQueryRepositorySql,
  CommentsQueryServiceSql,
  CommentLikesRepositorySql,
  CommentLikesQueryRepositorySql,
  PostLikesRepositorySql,
  PostLikesQueryRepositorySql,
  BloggerPlatformExternalServiceSql,
];
const queryHandlersSql = [
  GetBlogsQueryHandlerSql,
  GetBlogByIdOrInternalFailQueryHandlerSql,
  GetBlogPostsQueryHandlerSql,
  GetPostByIdOrInternalFailQueryHandlerSql,
  GetBlogByIdOrNotFoundFailQueryHandlerSql,
  GetPostByIdOrNotFoundFailQueryHandlerSql,
  GetPostsQueryHandlerSql,
  GetCommentByIdOrInternalFailQueryHandlerSql,
  GetPostCommentsQueryHandlerSql,
  GetCommentByIdOrNotFoundFailQueryHandlerSql,
];
const commandHandlersSql = [
  CreateBlogUseCaseSql,
  UpdateBlogUseCaseSql,
  DeleteBlogUseCaseSql,
  CreatePostUseCaseSql,
  UpdateBlogPostUseCaseSql,
  DeleteBlogPostUseCaseSql,
  CreateCommentUseCaseSql,
  UpdateCommentUseCaseSql,
  DeleteCommentUseCaseSql,
  MakeCommentLikeOperationUseCaseSql,
  MakePostLikeOperationUseCaseSql,
];

const controllersWrap = [
  BlogsControllerWrap,
  BlogsSaControllerWrap,
  PostsControllerWrap,
  CommentsControllerWrap,
];
const providersWrap = [
  BlogsRepositoryWrap,
  BlogsQueryRepositoryWrap,
  PostsRepositoryWrap,
  PostsQueryRepositoryWrap,
  CommentsRepositoryWrap,
  CommentsQueryRepositoryWrap,
  PostLikesRepositoryWrap,
  CommentLikesRepositoryWrap,
];
const queryHandlersWrap = [
  GetBlogByIdOrInternalFailQueryHandlerWrap,
  GetBlogByIdOrNotFoundFailQueryHandlerWrap,
  GetBlogsQueryHandlerWrap,
  GetBlogPostsQueryHandlerWrap,
  GetPostByIdOrInternalFailQueryHandlerWrap,
  GetPostByIdOrNotFoundFailQueryHandlerWrap,
  GetPostsQueryHandlerWrap,
  GetCommentByIdOrInternalFailQueryHandlerWrap,
  GetCommentByIdOrNotFoundFailQueryHandlerWrap,
  GetPostCommentsQueryHandlerWrap,
];
const commandHandlersWrap = [
  CreateBlogUseCaseWrap,
  DeleteBlogUseCaseWrap,
  UpdateBlogUseCaseWrap,
  CreatePostUseCaseWrap,
  DeleteBlogPostUseCaseWrap,
  UpdateBlogPostUseCaseWrap,
  CreateCommentUseCaseWrap,
  DeleteCommentUseCaseWrap,
  UpdateCommentUseCaseWrap,
  MakePostLikeOperationUseCaseWrap,
  MakeCommentLikeOperationUseCaseWrap,
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
    forwardRef(() => UserAccountsModule),
  ],
  controllers: [
    // BlogsController,
    // PostsController,
    // CommentsController,
    ...controllersSql,
    ...controllersWrap,
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
    ...providersWrap,
    ...queryHandlersWrap,
    ...commandHandlersWrap,
  ],
  exports: [BloggerPlatformExternalServiceSql],
})
export class BloggerPlatformModule {}
