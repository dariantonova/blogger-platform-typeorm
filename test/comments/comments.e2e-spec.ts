import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  delay,
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { CommentsTestManager } from './helpers/comments.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';

describe('comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
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

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);

    const UserModel = app.get<UserModelType>(getModelToken('User'));
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);

    commentsTestManager = new CommentsTestManager(
      app,
      usersCommonTestManager,
      authTestManager,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get comment', () => {
    let post: PostViewDto;
    let validAuth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createPostWithGeneratedData(blog.id);

      validAuth = await commentsTestManager.getValidAuth();
    });

    it('should return comment', async () => {
      const comment = await commentsTestManager.createCommentWithGeneratedData(
        post.id,
        validAuth,
      );

      const response = await commentsTestManager.getComment(
        comment.id,
        HttpStatus.OK,
      );
      const responseBody = response.body as CommentViewDto;

      expect(responseBody).toEqual({
        id: expect.any(String),
        content: expect.any(String),
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
        },
      });
      expect(responseBody).toEqual(comment);
    });

    it('should return 404 when trying to get non-existing comment', async () => {
      const nonExistingId = generateNonExistingId();
      await commentsTestManager.getComment(nonExistingId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when comment id is not valid ObjectId', async () => {
      const invalidId = 'not ObjectId';
      await commentsTestManager.getComment(invalidId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to get deleted comment', async () => {
      const commentToDelete =
        await commentsTestManager.createCommentWithGeneratedData(
          post.id,
          validAuth,
        );
      await commentsTestManager.deleteComment(
        commentToDelete.id,
        validAuth,
        HttpStatus.NO_CONTENT,
      );

      await commentsTestManager.getComment(
        commentToDelete.id,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('delete comment', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('success', () => {
      let validAuth: string;
      let comment: CommentViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        validAuth = await commentsTestManager.getValidAuth();
        comment = await commentsTestManager.createCommentWithGeneratedData(
          post.id,
          validAuth,
        );
      });

      it('should successfully delete comment', async () => {
        await commentsTestManager.deleteComment(
          comment.id,
          validAuth,
          HttpStatus.NO_CONTENT,
        );

        await commentsTestManager.getComment(comment.id, HttpStatus.NOT_FOUND);
      });
    });

    describe('not found', () => {
      let validAuth: string;
      let post: PostViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        validAuth = await commentsTestManager.getValidAuth();

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );
      });

      it('should return 404 when trying to delete non-existing comment', async () => {
        const nonExistingPost = generateNonExistingId();
        await commentsTestManager.deleteComment(
          nonExistingPost,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when comment id is not valid ObjectId', async () => {
        const invalidId = 'not ObjectId';
        await commentsTestManager.deleteComment(
          invalidId,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when trying to delete already deleted comment', async () => {
        const commentToDelete =
          await commentsTestManager.createCommentWithGeneratedData(
            post.id,
            validAuth,
          );

        await commentsTestManager.deleteComment(
          commentToDelete.id,
          validAuth,
          HttpStatus.NO_CONTENT,
        );

        await commentsTestManager.deleteComment(
          commentToDelete.id,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });
    });

    describe('authentication', () => {
      let userData: CreateUserInputDto;
      let user: UserViewDto;
      let comment: CommentViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const post = await postsCommonTestManager.createPostWithGeneratedData(
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
        const validAuth = 'Bearer ' + userAccessToken;

        comment = await commentsTestManager.createCommentWithGeneratedData(
          post.id,
          validAuth,
        );
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await commentsTestManager.deleteComment(
          comment.id,
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
        await commentsTestManager.deleteComment(
          comment.id,
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

        await commentsTestManager.deleteComment(
          comment.id,
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
        await commentsTestManager.deleteComment(
          comment.id,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });

    describe('authorization', () => {
      let post: PostViewDto;
      let user1AuthString: string;
      let user2AuthString: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        const usersData: CreateUserInputDto[] = [
          {
            login: 'user1',
            email: 'user1@example.com',
            password: 'qwerty',
          },
          {
            login: 'user2',
            email: 'user2@example.com',
            password: 'qwerty',
          },
        ];

        await usersCommonTestManager.createUsers(usersData);

        const user1AuthToken = await authTestManager.getNewAccessToken(
          usersData[0].login,
          usersData[0].password,
        );
        const user2AuthToken = await authTestManager.getNewAccessToken(
          usersData[1].login,
          usersData[1].password,
        );

        user1AuthString = 'Bearer ' + user1AuthToken;
        user2AuthString = 'Bearer ' + user2AuthToken;
      });

      it('should return 403 when user is trying to delete a comment that is not their own', async () => {
        const user1Comment =
          await commentsTestManager.createCommentWithGeneratedData(
            post.id,
            user1AuthString,
          );

        await commentsTestManager.deleteComment(
          user1Comment.id,
          user2AuthString,
          HttpStatus.FORBIDDEN,
        );
      });
    });
  });
});
