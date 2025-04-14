import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentsTestManager } from './helpers/comments.test-manager';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import {
  delay,
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
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';

describe('post comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder.overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.accessJwtSecret,
            signOptions: {
              expiresIn: '2s',
            },
          });
        },
      });
    });

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
    const validInputDto: CreatePostCommentInputDto = {
      content: 'valid'.repeat(10),
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('success', () => {
      let post: PostViewDto;
      let userData: CreateUserDto;
      let user: UserViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        user = await usersCommonTestManager.createUser(userData);
        const userAccessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        validAuth = 'Bearer ' + userAccessToken;
      });

      it('should successfully create post comment', async () => {
        const inputDto: CreatePostCommentInputDto = {
          content: 'success'.repeat(10),
        };

        const response = await commentsTestManager.createPostComment(
          post.id,
          inputDto,
          validAuth,
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

        const getPostCommentsResponse =
          await commentsTestManager.getPostComments(post.id, HttpStatus.OK);
        const responseBody = getPostCommentsResponse.body as PaginatedViewDto<
          CommentViewDto[]
        >;
        expect(responseBody.items).toEqual([createdComment]);
      });
    });

    describe('not found', () => {
      let blog: BlogViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();

        const userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        await usersCommonTestManager.createUser(userData);
        const userAccessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        validAuth = 'Bearer ' + userAccessToken;
      });

      it('should return 404 when trying to create comment of non-existing post', async () => {
        const nonExistingId = generateNonExistingId();
        await commentsTestManager.createPostComment(
          nonExistingId,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when post id is not valid ObjectId', async () => {
        const invalidId = 'not ObjectId';
        await commentsTestManager.createPostComment(
          invalidId,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when trying to create comment of deleted post', async () => {
        const postToDelete =
          await postsCommonTestManager.createPostWithGeneratedData(blog.id);
        await postsCommonTestManager.deletePost(postToDelete.id);

        await commentsTestManager.createPostComment(
          postToDelete.id,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });
    });

    describe('validation', () => {
      let post: PostViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        const userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        await usersCommonTestManager.createUser(userData);
        const userAccessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        validAuth = 'Bearer ' + userAccessToken;
      });

      it('should return 400 if content is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {};
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          content: 4,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          content: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          content: '  ',
        };
        invalidDataCases.push(data4);

        // too short
        const data5 = {
          content: 'a'.repeat(19),
        };
        invalidDataCases.push(data5);

        // too long
        const data6 = {
          content: 'a'.repeat(301),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await commentsTestManager.createPostComment(
            post.id,
            data,
            validAuth,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'content',
                message: expect.any(String),
              },
            ],
          });
        }
      });
    });

    describe('authentication', () => {
      let post: PostViewDto;
      let user: UserViewDto;
      let userData: CreateUserDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        user = await usersCommonTestManager.createUser(userData);
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // wrong format auth header
      it('should return 401 if auth header format is invalid', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // expired token
      it('should return 401 if access token is expired', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );

        await delay(2000);

        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // user was deleted
      it('should return 401 if user was deleted', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await usersCommonTestManager.deleteUser(user.id);
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });
  });
});
