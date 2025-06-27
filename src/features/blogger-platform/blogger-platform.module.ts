import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsSaController } from './blogs/api/blogs-sa.controller';
import { GetBlogByIdOrInternalFailQueryHandler } from './blogs/application/queries/get-blog-by-id-or-internal-fail.query';
import { GetBlogByIdOrNotFoundFailQueryHandler } from './blogs/application/queries/get-blog-by-id-or-not-found-fail.query';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { PostsController } from './posts/api/posts.controller';
import { GetBlogPostsQueryHandler } from './posts/application/queries/get-blog-posts.query';
import { GetPostByIdOrInternalFailQueryHandler } from './posts/application/queries/get-post-by-id-or-internal-fail.query';
import { GetPostByIdOrNotFoundFailQueryHandler } from './posts/application/queries/get-post-by-id-or-not-found-fail.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { CreatePostUseCaseWrap } from './posts/application/usecases/create-post.usecase';
import { DeleteBlogPostUseCaseWrap } from './posts/application/usecases/delete-blog-post.usecase';
import { UpdateBlogPostUseCaseWrap } from './posts/application/usecases/update-blog-post.usecase';
import { CommentsController } from './comments/api/comments.controller';
import { GetCommentByIdOrInternalFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-internal-fail.query';
import { GetCommentByIdOrNotFoundFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-not-found-fail.query';
import { GetPostCommentsQueryHandler } from './comments/application/queries/get-post-comments.query';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { DeleteCommentUseCaseWrap } from './comments/application/usecases/delete-comment.usecase';
import { UpdateCommentUseCaseWrap } from './comments/application/usecases/update-comment.usecase';
import { MakePostLikeOperationUseCaseWrap } from './likes/application/usecases/make-post-like-operation.usecase';
import { MakeCommentLikeOperationUseCase } from './likes/application/usecases/make-comment-like-operation.usecase';
import { BloggerPlatformExternalService } from './common/infrastructure/external/blogger-platform.external-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { Post } from './posts/domain/post.entity';
import { Comment } from './comments/domain/comment.entity';
import { PostLike } from './likes/domain/post-like.entity';
import { CommentLike } from './likes/domain/comment-like.entity';
import { BlogsRepo } from './blogs/infrastructure/blogs.repo';
import { BlogsQueryRepo } from './blogs/infrastructure/query/blogs.query-repo';
import { PostsRepo } from './posts/infrastructure/posts.repo';
import { PostsQueryRepo } from './posts/infrastructure/query/posts.query-repo';
import { CommentsRepo } from './comments/infrastructure/comments.repo';
import { CommentsQueryRepo } from './comments/infrastructure/query/comments.query-repo';
import { PostLikesRepo } from './likes/infrastructure/post-likes.repo';
import { CommentLikesRepo } from './likes/infrastructure/comment-likes.repo';

const controllers = [
  BlogsController,
  BlogsSaController,
  PostsController,
  CommentsController,
];
const providers = [
  BloggerPlatformExternalService,
  BlogsRepo,
  BlogsQueryRepo,
  PostsRepo,
  PostsQueryRepo,
  CommentsRepo,
  CommentsQueryRepo,
  PostLikesRepo,
  CommentLikesRepo,
];
const queryHandlers = [
  GetBlogByIdOrInternalFailQueryHandler,
  GetBlogByIdOrNotFoundFailQueryHandler,
  GetBlogsQueryHandler,
  GetBlogPostsQueryHandler,
  GetPostByIdOrInternalFailQueryHandler,
  GetPostByIdOrNotFoundFailQueryHandler,
  GetPostsQueryHandler,
  GetCommentByIdOrInternalFailQueryHandler,
  GetCommentByIdOrNotFoundFailQueryHandler,
  GetPostCommentsQueryHandler,
];
const commandHandlers = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCaseWrap,
  DeleteBlogPostUseCaseWrap,
  UpdateBlogPostUseCaseWrap,
  CreateCommentUseCase,
  DeleteCommentUseCaseWrap,
  UpdateCommentUseCaseWrap,
  MakePostLikeOperationUseCaseWrap,
  MakeCommentLikeOperationUseCase,
];

@Module({
  imports: [
    CqrsModule.forRoot(),
    TypeOrmModule.forFeature([Blog, Post, Comment, PostLike, CommentLike]),
  ],
  controllers: [...controllers],
  providers: [...providers, ...queryHandlers, ...commandHandlers],
  exports: [BloggerPlatformExternalService],
})
export class BloggerPlatformModule {}
