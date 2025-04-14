import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentsTestManager } from './helpers/comments.test-manager';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import {
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { CreatePostCommentInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';

describe('post comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    app = await initApp();

    commentsTestManager = new CommentsTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    blogsCommonTestManager = new BlogsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);

    const UserModel = app.get<UserModelType>(getModelToken('User'));
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get post comments', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should return 404 when trying to get comments of non-existing post', async () => {
      const nonExistingId = generateNonExistingId();
      await commentsTestManager.getPostComments(
        nonExistingId,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when post id is not valid ObjectId', async () => {
      const invalidId = 'not ObjectId';
      await commentsTestManager.getPostComments(
        invalidId,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to get comments of deleted post', async () => {
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      await postsCommonTestManager.deletePost(post.id);

      await commentsTestManager.getPostComments(post.id, HttpStatus.NOT_FOUND);
    });

    it('should return empty array if post has no comments', async () => {
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      const response = await commentsTestManager.getPostComments(
        post.id,
        HttpStatus.OK,
      );

      const responseBody: PaginatedViewDto<CommentViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });
  });

  describe('create post comment', () => {
    let post: PostViewDto;
    let userData: CreateUserDto;
    let user: UserViewDto;
    let userAccessToken: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createPostWithGeneratedData(blog.id);

      userData = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      user = await usersCommonTestManager.createUser(userData);
      userAccessToken = await authTestManager.getNewAccessToken(
        userData.login,
        userData.password,
      );
    });

    it('should successfully create post comment', async () => {
      const inputDto: CreatePostCommentInputDto = {
        content: 'success'.repeat(10),
      };

      const response = await commentsTestManager.createPostComment(
        post.id,
        inputDto,
        'Bearer ' + userAccessToken,
        HttpStatus.CREATED,
      );

      const createdComment = response.body as CommentViewDto;
      expect(createdComment.id).toEqual(expect.any(String));
      expect(createdComment.content).toBe(inputDto.content);
      expect(createdComment.commentatorInfo.userId).toBe(user.id);
      expect(createdComment.commentatorInfo.userLogin).toBe(userData.login);
      expect(createdComment.createdAt).toEqual(expect.any(String));
      expect(Date.parse(createdComment.createdAt)).not.toBeNaN();
      expect(createdComment.likesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      });

      const getPostCommentsResponse = await commentsTestManager.getPostComments(
        post.id,
        HttpStatus.OK,
      );
      const responseBody = getPostCommentsResponse.body as PaginatedViewDto<
        CommentViewDto[]
      >;
      expect(responseBody.items).toEqual([createdComment]);
    });
  });
});
