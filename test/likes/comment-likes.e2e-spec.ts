import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import {
  delay,
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { LikeModelType } from '../../src/features/blogger-platform/likes/domain/like.entity';
import { getModelToken } from '@nestjs/mongoose';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { CommentLikesTestManager } from './helpers/comment-likes.test-manager';
import { CommentsCommonTestManager } from '../helpers/comments.common.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LikeInputDto } from '../../src/features/blogger-platform/likes/api/input-dto/like.input-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';

describe('comment likes', () => {
  let app: INestApplication;
  let commentLikesTestManager: CommentLikesTestManager;
  let commentsCommonTestManager: CommentsCommonTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const customBuilderSetup = (builder: TestingModuleBuilder) => {
      builder.overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.accessJwtSecret,
            signOptions: {
              expiresIn: '3s',
            },
          });
        },
      });
    };
    app = await initApp({ customBuilderSetup });

    const LikeModel = app.get<LikeModelType>(getModelToken('Like'));
    commentLikesTestManager = new CommentLikesTestManager(app, LikeModel);

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);
    commentsCommonTestManager = new CommentsCommonTestManager(app);

    const UserModel = app.get<UserModelType>(getModelToken('User'));
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    let comment: CommentViewDto;
    let userData: CreateUserDto;
    const inputDto: LikeInputDto = {
      likeStatus: LikeStatus.Like,
    };

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );

      const commentAuthorData = {
        login: 'author',
        email: 'author@example.com',
        password: 'qwerty',
      };
      await usersCommonTestManager.createUser(commentAuthorData);
      const commentAuthorAccessToken = await authTestManager.getNewAccessToken(
        commentAuthorData.login,
        commentAuthorData.password,
      );
      const commentAuthorAuth = 'Bearer ' + commentAuthorAccessToken;

      comment = await commentsCommonTestManager.createCommentWithGeneratedData(
        post.id,
        commentAuthorAuth,
      );

      userData = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      await usersCommonTestManager.createUser(userData);
    });

    afterEach(async () => {
      await commentLikesTestManager.checkCommentLikesCount(comment.id, 0);
    });

    // missing
    it('should return 401 if authorization is missing', async () => {
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        '',
        HttpStatus.UNAUTHORIZED,
      );
    });

    // non-existing token
    it('should return 401 if access token is invalid', async () => {
      const accessToken = 'random';
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
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
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
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

      await delay(3000);

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        'Bearer ' + accessToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('validation', () => {
    let comment: CommentViewDto;
    let validAuth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const user1Auth = await authTestManager.getValidAuth(1);
      const user2Auth = await authTestManager.getValidAuth(2);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      comment = await commentsCommonTestManager.createCommentWithGeneratedData(
        post.id,
        user1Auth,
      );

      validAuth = user2Auth;
    });

    afterEach(async () => {
      await commentLikesTestManager.checkCommentLikesCount(comment.id, 0);
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
        const response = await commentLikesTestManager.makeCommentLikeOperation(
          comment.id,
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
    let deletedComment: CommentViewDto;
    let validAuth: string;
    const inputDto: LikeInputDto = {
      likeStatus: LikeStatus.Like,
    };

    beforeAll(async () => {
      await deleteAllData(app);

      const user1Auth = await authTestManager.getValidAuth(1);
      const user2Auth = await authTestManager.getValidAuth(2);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      deletedComment =
        await commentsCommonTestManager.createCommentWithGeneratedData(
          post.id,
          user1Auth,
        );
      await commentsCommonTestManager.deleteComment(
        deletedComment.id,
        user1Auth,
      );

      validAuth = user2Auth;
    });

    it('should return 404 when trying to update like status of non-existing comment', async () => {
      const nonExistingPost = generateNonExistingId();

      await commentLikesTestManager.makeCommentLikeOperation(
        nonExistingPost,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when comment id is not valid ObjectId', async () => {
      const invalidId = 'not ObjectId';

      await commentLikesTestManager.makeCommentLikeOperation(
        invalidId,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update like status of deleted comment', async () => {
      await commentLikesTestManager.makeCommentLikeOperation(
        deletedComment.id,
        inputDto,
        validAuth,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('unauthorized user view', () => {
    let comment: CommentViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      const commentAuthorAuth = await authTestManager.getValidAuth();
      comment = await commentsCommonTestManager.createCommentWithGeneratedData(
        post.id,
        commentAuthorAuth,
      );
    });

    it('should return myStatus as None for unauthorized user', async () => {
      const returnedPost = await commentsCommonTestManager.getComment(
        comment.id,
      );
      expect(returnedPost.likesInfo.myStatus).toBe(LikeStatus.None);
    });
  });

  describe('single user interactions', () => {
    let comment: CommentViewDto;
    let user2Auth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      const user1Auth = await authTestManager.getValidAuth(1);
      user2Auth = await authTestManager.getValidAuth(2);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const post = await postsCommonTestManager.createPostWithGeneratedData(
        blog.id,
      );
      comment = await commentsCommonTestManager.createCommentWithGeneratedData(
        post.id,
        user1Auth,
      );
    });

    it('should like comment', async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(1);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`shouldn't like comment multiple times by one user`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(1);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`should replace like with dislike`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(1);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`shouldn't dislike comment multiple times by one user`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(1);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`should undislike comment`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.None);
    });

    it(`should not change anything when removing non-existing like or dislike`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.None);
    });

    it(`should dislike comment`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(1);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Dislike);
    });

    it(`should replace dislike with like`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(1);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.Like);
    });

    it(`should unlike comment`, async () => {
      const dto: LikeInputDto = {
        likeStatus: LikeStatus.None,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        dto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
        user2Auth,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
      expect(updatedComment.likesInfo.myStatus).toBe(LikeStatus.None);
    });
  });

  describe('multiple users interactions', () => {
    let post: PostViewDto;
    let user1Auth: string;
    let user2Auth: string;
    let user3Auth: string;
    let user4Auth: string;

    beforeAll(async () => {
      await deleteAllData(app);

      user1Auth = await authTestManager.getValidAuth(1);
      user2Auth = await authTestManager.getValidAuth(2);
      user3Auth = await authTestManager.getValidAuth(3);
      user4Auth = await authTestManager.getValidAuth(4);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      post = await postsCommonTestManager.createPostWithGeneratedData(blog.id);
    });

    it('should correctly count multiple likes from different users', async () => {
      const comment =
        await commentsCommonTestManager.createCommentWithGeneratedData(
          post.id,
          user4Auth,
        );

      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Like,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(2);
      expect(updatedComment.likesInfo.dislikesCount).toBe(0);
    });

    it('should correctly count multiple dislikes from different users', async () => {
      const comment =
        await commentsCommonTestManager.createCommentWithGeneratedData(
          post.id,
          user4Auth,
        );

      const inputDto: LikeInputDto = {
        likeStatus: LikeStatus.Dislike,
      };

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        user2Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(0);
      expect(updatedComment.likesInfo.dislikesCount).toBe(2);
    });

    it('should correctly count mixed likes and dislikes from different users', async () => {
      const comment =
        await commentsCommonTestManager.createCommentWithGeneratedData(
          post.id,
          user4Auth,
        );

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        {
          likeStatus: LikeStatus.Like,
        },
        user1Auth,
        HttpStatus.NO_CONTENT,
      );
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        {
          likeStatus: LikeStatus.Like,
        },
        user2Auth,
        HttpStatus.NO_CONTENT,
      );
      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        {
          likeStatus: LikeStatus.Dislike,
        },
        user3Auth,
        HttpStatus.NO_CONTENT,
      );

      const updatedComment = await commentsCommonTestManager.getComment(
        comment.id,
      );
      expect(updatedComment.likesInfo.likesCount).toBe(2);
      expect(updatedComment.likesInfo.dislikesCount).toBe(1);
    });
  });
});
