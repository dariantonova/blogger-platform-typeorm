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
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { LikeInputDto } from '../../src/features/blogger-platform/likes/api/input-dto/like.input-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import { LikeDetailsViewDto } from '../../src/features/blogger-platform/common/dto/like-details.view-dto';
import { millisecondsToSeconds } from 'date-fns';
import { PostLikesTestRepositorySql } from '../helpers/repositories/post-likes.test-repository.sql';
import { DataSource } from 'typeorm';

describe('post likes', () => {
  let app: INestApplication;
  let postLikesTestManager: PostLikesTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;
  let postLikesTestRepository: PostLikesTestRepositorySql;
  const accessTokenExpInMs = 4000;

  beforeAll(async () => {
    const customBuilderSetup = (builder: TestingModuleBuilder) => {
      builder.overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.accessJwtSecret,
            signOptions: {
              expiresIn: millisecondsToSeconds(accessTokenExpInMs) + 's',
            },
          });
        },
      });
    };
    app = await initApp({ customBuilderSetup });

    postLikesTestManager = new PostLikesTestManager(app);

    const dataSource = app.get(DataSource);
    postLikesTestRepository = new PostLikesTestRepositorySql(dataSource);

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    let post: PostViewDto;
    let userData: CreateUserDto;
    const inputDto: LikeInputDto = {
      likeStatus: LikeStatus.Like,
    };

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      userData = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      await usersCommonTestManager.createUser(userData);
    });

    afterEach(async () => {
      await postLikesTestRepository.checkPostLikesWithLikeStatusCount(
        post.id,
        0,
      );
    });

    // missing
    it('should return 401 if authorization is missing', async () => {
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    // non-existing token
    it('should return 401 if access token is invalid', async () => {
      const accessToken = 'random';
      await postLikesTestManager.makePostLikeOperation(
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
      await postLikesTestManager.makePostLikeOperation(
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

      await delay(accessTokenExpInMs);

      await postLikesTestManager.makePostLikeOperation(
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
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      validAuth = await authTestManager.getValidAuth();
    });

    afterEach(async () => {
      await postLikesTestRepository.checkPostLikesWithLikeStatusCount(
        post.id,
        0,
      );
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
        const response = await postLikesTestManager.makePostLikeOperation(
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
      const nonExistingPostId = generateNonExistingId();

      await postLikesTestManager.makePostLikeOperation(
        nonExistingPostId,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    // it('should return 404 when post id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //
    //   await postLikesTestManager.makePostLikeOperation(
    //     invalidId,
    //     inputDto,
    //     validAuth,
    //     HttpStatus.NOT_FOUND,
    //   );
    // });

    it('should return 404 when post id is not a number', async () => {
      const invalidId = 'string';

      await postLikesTestManager.makePostLikeOperation(
        invalidId,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update like status of deleted post', async () => {
      const postToDelete =
        await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);
      await postsCommonTestManager.deleteBlogPost(blog.id, postToDelete.id);

      await postLikesTestManager.makePostLikeOperation(
        postToDelete.id,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('unauthorized user view', () => {
    let post: PostViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );
    });

    it('should return myStatus as None for unauthorized user', async () => {
      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    });
  });

  describe('single user interactions', () => {
    let post: PostViewDto;
    let user1Auth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      user1Auth = await authTestManager.getValidAuth();
    });

    it('should like post', async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`shouldn't like post multiple times by one user`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`should replace like with dislike`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`shouldn't dislike post multiple times by one user`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`should undislike post`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    });

    it(`should not change anything when removing non-existing like or dislike`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    });

    it(`should dislike post`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`should replace dislike with like`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(1);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`should unlike post`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        dto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedPost = await postsCommonTestManager.getPostSuccess(
        post.id,
        user1Auth,
      );
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    });
  });

  describe('multiple users interactions', () => {
    let blog: BlogViewDto;
    let user1Auth: string;
    let user2Auth: string;
    let user3Auth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();

      user1Auth = await authTestManager.getValidAuth(1);
      user2Auth = await authTestManager.getValidAuth(2);
      user3Auth = await authTestManager.getValidAuth(3);
    });

    it('should correctly count multiple likes from different users', async () => {
      const post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(2);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(0);
    });

    it('should correctly count multiple dislikes from different users', async () => {
      const post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(0);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(2);
    });

    it('should correctly count mixed likes and dislikes from different users', async () => {
      const post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.Like,
        },
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.Like,
        },
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.Dislike,
        },
        user3Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(updatedPost.extendedLikesInfo.likesCount).toBe(2);
      expect(updatedPost.extendedLikesInfo.dislikesCount).toBe(1);
    });
  });

  describe('newestLikes behavior', () => {
    let post: PostViewDto;
    let usersData: CreateUserInputDto[];
    let users: UserViewDto[];
    let usersAuthStrings: string[];

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      usersData = [];
      users = [];
      usersAuthStrings = [];
      for (let i = 1; i <= 4; i++) {
        const userData = {
          login: 'user' + i,
          email: 'user' + i + '@example.com',
          password: 'qwerty',
        };
        const user = await usersCommonTestManager.createUser(userData);
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        const authString = 'Bearer ' + accessToken;

        usersData.push(userData);
        users.push(user);
        usersAuthStrings.push(authString);
      }
    });

    it('should include user in newestLikes after liking', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[0],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[0].id,
          login: usersData[0].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should include multiple users in newestLikes in correct order', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[1],
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[2],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[2].id,
          login: usersData[2].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[0].id,
          login: usersData[0].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should not include user in newestLikes after disliking', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[3],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[2].id,
          login: usersData[2].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[0].id,
          login: usersData[0].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should keep only the 3 most recent likes', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[3],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[3].id,
          login: usersData[3].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[2].id,
          login: usersData[2].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should not re-add an old like if it is liked again after being pushed out', async () => {
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.None,
        },
        usersAuthStrings[0],
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.Like,
        },
        usersAuthStrings[0],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[3].id,
          login: usersData[3].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[2].id,
          login: usersData[2].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should bring back a like to newestLikes if a more recent one is removed', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[2],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[3].id,
          login: usersData[3].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[0].id,
          login: usersData[0].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should preserve like position in newestLikes when reliking one of newest likes', async () => {
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.None,
        },
        usersAuthStrings[1],
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        {
          likeStatus: LikeStatus.Like,
        },
        usersAuthStrings[1],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[3].id,
          login: usersData[3].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[0].id,
          login: usersData[0].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should shorten newestLikes when a recent like is removed and no older likes exist', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[0],
        HttpStatus.NO_CONTENT,
      );

      const expected: LikeDetailsViewDto[] = [
        {
          userId: users[3].id,
          login: usersData[3].login,
          addedAt: expect.any(String),
        },
        {
          userId: users[1].id,
          login: usersData[1].login,
          addedAt: expect.any(String),
        },
      ];

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual(expected);
    });

    it('should return empty array if all likes are removed', async () => {
      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[1],
        HttpStatus.NO_CONTENT,
      );
      await postLikesTestManager.makePostLikeOperation(
        post.id,
        inputDto,
        usersAuthStrings[3],
        HttpStatus.NO_CONTENT,
      );

      const returnedPost = await postsCommonTestManager.getPostSuccess(post.id);
      expect(returnedPost.extendedLikesInfo.newestLikes).toEqual([]);
    });
  });
});
