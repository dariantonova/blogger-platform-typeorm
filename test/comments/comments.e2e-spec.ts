import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  delay,
  deleteAllData,
  generateIdOfWrongType,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { CommentsTestManager } from './helpers/comments.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import { UpdateCommentInputDto } from '../../src/features/blogger-platform/comments/api/input-dto/update-comment.input-dto';
import { millisecondsToSeconds } from 'date-fns';
import { CommentLikesTestManager } from '../likes/helpers/comment-likes.test-manager';
import { CommentLikesTestRepository } from '../helpers/repositories/comment-likes.test-repository';
import { DataSource } from 'typeorm';

describe('comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;
  let commentLikesTestManager: CommentLikesTestManager;
  let commentLikesTestRepository: CommentLikesTestRepository;
  const accessTokenExpInMs = 3000;

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

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app);
    commentsTestManager = new CommentsTestManager(app);
    commentLikesTestManager = new CommentLikesTestManager(app);

    const dataSource = app.get(DataSource);
    commentLikesTestRepository = new CommentLikesTestRepository(dataSource);
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
      post = await postsCommonTestManager.createBlogPostWithGeneratedData(
        blog.id,
      );

      validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();
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

    it('should return 404 when comment id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
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
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();
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

        validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
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

      it('should return 404 when comment id is not a number', async () => {
        const invalidId = generateIdOfWrongType();
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
      let post: PostViewDto;
      let comment: CommentViewDto;

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

      afterEach(async () => {
        await commentsTestManager.checkPostCommentsCount(post.id, 1);
      });

      // missing
      it('should return 401 if authorization is missing', async () => {
        await commentsTestManager.deleteComment(
          comment.id,
          '',
          HttpStatus.UNAUTHORIZED,
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

        await delay(accessTokenExpInMs);

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
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
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

        await commentsTestManager.checkPostCommentsCount(post.id, 1);
      });
    });

    describe('relations deletion', () => {
      let post: PostViewDto;
      let usersAuthStrings: string[];
      let userAuthOfCommentToDelete: string;
      let commentToDelete: CommentViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
          blog.id,
        );

        usersAuthStrings = [];
        for (let i = 1; i <= 3; i++) {
          const authString =
            await authTestManager.getValidAuthOfNewlyRegisteredUser(i);
          usersAuthStrings.push(authString);
        }
        userAuthOfCommentToDelete = usersAuthStrings[0];
      });

      beforeEach(async () => {
        commentToDelete =
          await commentsTestManager.createCommentWithGeneratedData(
            post.id,
            userAuthOfCommentToDelete,
          );
      });

      it('should delete all likes of deleted comment', async () => {
        await commentLikesTestManager.addLikesWithAllStatusesToComment(
          commentToDelete.id,
          usersAuthStrings.slice(0, 3),
        );

        await commentsTestManager.deleteCommentSuccess(
          commentToDelete.id,
          userAuthOfCommentToDelete,
        );

        await commentLikesTestRepository.checkCommentLikesCount(
          commentToDelete.id,
          0,
        );
      });

      it('should delete only likes of deleted comment', async () => {
        const anotherComment =
          await commentsTestManager.createCommentWithGeneratedData(
            post.id,
            usersAuthStrings[0],
          );

        await commentLikesTestManager.addLikesWithAllStatusesToComment(
          anotherComment.id,
          usersAuthStrings.slice(0, 3),
        );

        await commentsTestManager.deleteCommentSuccess(
          commentToDelete.id,
          userAuthOfCommentToDelete,
        );

        await commentLikesTestRepository.checkCommentLikesCount(
          anotherComment.id,
          3,
        );
      });
    });
  });

  describe('update comment', () => {
    const validInputDto: UpdateCommentInputDto = {
      content: 'after'.repeat(10),
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('success', () => {
      let post: PostViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
          blog.id,
        );

        validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();
      });

      it('should successfully update comment', async () => {
        const createCommentResponse =
          await commentsTestManager.createPostComment(
            post.id,
            {
              content: 'before'.repeat(10),
            },
            validAuth,
            HttpStatus.CREATED,
          );
        const commentBeforeUpdate = createCommentResponse.body;

        const inputDto: UpdateCommentInputDto = {
          content: 'after'.repeat(10),
        };

        await commentsTestManager.updateComment(
          commentBeforeUpdate.id,
          inputDto,
          validAuth,
          HttpStatus.NO_CONTENT,
        );

        const getUpdatedCommentResponse = await commentsTestManager.getComment(
          commentBeforeUpdate.id,
          HttpStatus.OK,
        );
        const updatedComment = getUpdatedCommentResponse.body as CommentViewDto;

        expect(updatedComment.content).toBe(inputDto.content);
        expect(updatedComment.id).toBe(commentBeforeUpdate.id);
        expect(updatedComment.commentatorInfo).toEqual(
          commentBeforeUpdate.commentatorInfo,
        );
        expect(updatedComment.createdAt).toBe(commentBeforeUpdate.createdAt);
        expect(updatedComment.likesInfo).toEqual(commentBeforeUpdate.likesInfo);
      });
    });

    describe('not found', () => {
      let validAuth: string;
      let post: PostViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
          blog.id,
        );
      });

      it('should return 404 when trying to update non-existing comment', async () => {
        const nonExistingPost = generateNonExistingId();
        await commentsTestManager.updateComment(
          nonExistingPost,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when comment id is not a number', async () => {
        const invalidId = generateIdOfWrongType();
        await commentsTestManager.updateComment(
          invalidId,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when trying to update deleted comment', async () => {
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

        await commentsTestManager.updateComment(
          commentToDelete.id,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });
    });

    describe('validation', () => {
      let post: PostViewDto;
      let validAuth: string;
      let comment: CommentViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
          blog.id,
        );

        validAuth = await authTestManager.getValidAuthOfNewlyRegisteredUser();

        comment = await commentsTestManager.createCommentWithGeneratedData(
          post.id,
          validAuth,
        );
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
          const response = await commentsTestManager.updateComment(
            comment.id,
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
      let userData: CreateUserInputDto;
      let comment: CommentViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        await usersCommonTestManager.createUser(userData);
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

      // missing
      it('should return 401 if authorization is missing', async () => {
        await commentsTestManager.updateComment(
          comment.id,
          validInputDto,
          '',
          HttpStatus.UNAUTHORIZED,
        );
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await commentsTestManager.updateComment(
          comment.id,
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
        await commentsTestManager.updateComment(
          comment.id,
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

        await delay(accessTokenExpInMs);

        await commentsTestManager.updateComment(
          comment.id,
          validInputDto,
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
        post = await postsCommonTestManager.createBlogPostWithGeneratedData(
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

        await commentsTestManager.updateComment(
          user1Comment.id,
          validInputDto,
          user2AuthString,
          HttpStatus.FORBIDDEN,
        );
      });
    });
  });
});
