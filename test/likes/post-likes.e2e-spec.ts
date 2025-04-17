import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  delay,
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { PostLikesTestManager } from './helpers/post-likes.test-manager';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { LikeModelType } from '../../src/features/blogger-platform/likes/domain/like.entity';
import { LikeInputDto } from '../../src/features/blogger-platform/likes/api/input-dto/like.input-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';

describe('post likes', () => {
  let app: INestApplication;
  let postLikesTestManager: PostLikesTestManager;
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

    const LikeModel = app.get<LikeModelType>(getModelToken('Like'));
    postLikesTestManager = new PostLikesTestManager(app, LikeModel);

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);

    const UserModel = app.get<UserModelType>(getModelToken('User'));
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    let post: PostViewDto;
    let user: UserViewDto;
    let userData: CreateUserDto;
    const inputDto: LikeInputDto = {
      likeStatus: LikeStatus.Like,
    };

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
    });

    afterEach(async () => {
      await postLikesTestManager.checkPostLikesCount(post.id, 0);
    });

    // non-existing token
    it('should return 401 if access token is invalid', async () => {
      const accessToken = 'random';
      await postLikesTestManager.updatePostLikeStatus(
        post.id,
        inputDto,
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
      await postLikesTestManager.updatePostLikeStatus(
        post.id,
        inputDto,
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

      await postLikesTestManager.updatePostLikeStatus(
        post.id,
        inputDto,
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

      await postLikesTestManager.updatePostLikeStatus(
        post.id,
        inputDto,
        'Bearer ' + accessToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('validation', () => {
    let post: PostViewDto;
    let validAuth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createPostWithGeneratedData(blog.id);

      validAuth = await authTestManager.getValidAuth();
    });

    afterEach(async () => {
      await postLikesTestManager.checkPostLikesCount(post.id, 0);
    });

    it('should return 400 if like status is invalid', async () => {
      const invalidDataCases: any[] = [];

      // missing
      const data1 = {};
      invalidDataCases.push(data1);

      // empty
      const data2 = {
        likeStatus: '',
      };
      invalidDataCases.push(data2);

      // empty with spaces
      const data3 = {
        likeStatus: '  ',
      };
      invalidDataCases.push(data3);

      // not valid enum value
      const data4 = {
        likeStatus: '-100',
      };
      invalidDataCases.push(data4);

      for (const data of invalidDataCases) {
        const response = await postLikesTestManager.updatePostLikeStatus(
          post.id,
          data,
          validAuth,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'likeStatus',
              message: expect.any(String),
            },
          ],
        });
      }
    });
  });

  describe('not found', () => {
    let blog: BlogViewDto;
    let validAuth: string;
    const inputDto: LikeInputDto = {
      likeStatus: LikeStatus.Like,
    };

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();

      validAuth = await authTestManager.getValidAuth();
    });

    it('should return 404 when trying to update like status of non-existing post', async () => {
      const nonExistingPost = generateNonExistingId();

      await postLikesTestManager.updatePostLikeStatus(
        nonExistingPost,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when post id is not valid ObjectId', async () => {
      const invalidId = 'not ObjectId';

      await postLikesTestManager.updatePostLikeStatus(
        invalidId,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update like status of deleted post', async () => {
      const postToDelete =
        await postsCommonTestManager.createPostWithGeneratedData(blog.id);
      await postsCommonTestManager.deletePost(postToDelete.id);

      await postLikesTestManager.updatePostLikeStatus(
        postToDelete.id,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
