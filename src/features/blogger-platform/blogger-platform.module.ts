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
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { GetBlogPostsQueryHandler } from './posts/application/queries/get-blog-posts.query';
import { GetPostByIdOrInternalFailQueryHandler } from './posts/application/queries/get-post-by-id-or-internal-fail.query';
import { GetPostByIdOrNotFoundFailQueryHandler } from './posts/application/queries/get-post-by-id-or-not-found-fail.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { CreatePostUseCaseWrap } from './posts/application/usecases/create-post.usecase';
import { DeleteBlogPostUseCaseWrap } from './posts/application/usecases/delete-blog-post.usecase';
import { UpdateBlogPostUseCaseWrap } from './posts/application/usecases/update-blog-post.usecase';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { GetCommentByIdOrInternalFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-internal-fail.query';
import { GetCommentByIdOrNotFoundFailQueryHandler } from './comments/application/queries/get-comment-by-id-or-not-found-fail.query';
import { GetPostCommentsQueryHandler } from './comments/application/queries/get-post-comments.query';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { DeleteCommentUseCaseWrap } from './comments/application/usecases/delete-comment.usecase';
import { UpdateCommentUseCaseWrap } from './comments/application/usecases/update-comment.usecase';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { MakePostLikeOperationUseCaseWrap } from './likes/application/usecases/make-post-like-operation.usecase';
import { PostLikesRepository } from './likes/infrastructure/post-likes.repository';
import { MakeCommentLikeOperationUseCase } from './likes/application/usecases/make-comment-like-operation.usecase';
import { CommentLikesRepository } from './likes/infrastructure/comment-likes.repository';
import { BloggerPlatformExternalService } from './common/infrastructure/external/blogger-platform.external-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../typeorm/entities/blogger-platform/blog.entity';
import { Post } from '../typeorm/entities/blogger-platform/post.entity';
import { Comment } from '../typeorm/entities/blogger-platform/comment.entity';
import { PostLike } from '../typeorm/entities/blogger-platform/post-like.entity';
import { CommentLike } from '../typeorm/entities/blogger-platform/comment-like.entity';
import { BlogsRepo } from '../typeorm/infrastructure/blogger-platform/blogs/blogs.repo';
import { BlogsQueryRepo } from '../typeorm/infrastructure/blogger-platform/blogs/query/blogs.query-repo';
import { PostsRepo } from '../typeorm/infrastructure/blogger-platform/posts/posts.repo';
import { PostsQueryRepo } from '../typeorm/infrastructure/blogger-platform/posts/query/posts.query-repo';
import { CommentsRepo } from '../typeorm/infrastructure/blogger-platform/comments/comments.repo';
import { CommentsQueryRepo } from '../typeorm/infrastructure/blogger-platform/comments/query/comments.query-repo';

const controllers = [
  BlogsController,
  BlogsSaController,
  PostsController,
  CommentsController,
];
const providers = [
  { provide: BlogsRepository, useExisting: BlogsRepo },
  { provide: BlogsQueryRepository, useExisting: BlogsQueryRepo },
  { provide: PostsRepository, useExisting: PostsRepo },
  { provide: PostsQueryRepository, useExisting: PostsQueryRepo },
  { provide: CommentsRepository, useExisting: CommentsRepo },
  { provide: CommentsQueryRepository, useExisting: CommentsQueryRepo },
  PostLikesRepository,
  CommentLikesRepository,
  BloggerPlatformExternalService,
  BlogsRepo,
  BlogsQueryRepo,
  PostsRepo,
  PostsQueryRepo,
  CommentsRepo,
  CommentsQueryRepo,
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
