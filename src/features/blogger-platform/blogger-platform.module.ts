import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsService } from './posts/application/posts.service';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentsService } from './comments/application/comments.service';
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
import { GetCommentByIdOrNotFoundQueryHandler } from './comments/application/queries/get-comment-by-id-or-not-found-fail.query';

const commandHandlers = [
  DeleteBlogUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
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
  GetCommentByIdOrNotFoundQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    CqrsModule.forRoot(),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsQueryRepository,
    BlogsRepository,
    PostsService,
    PostsQueryRepository,
    PostsRepository,
    CommentsQueryRepository,
    CommentsService,
    CommentsRepository,
    IsExistingBlogIdConstraint,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class BloggerPlatformModule {}
