import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { delay, deleteAllData, initApp } from '../helpers/helper';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { LikeModelType } from '../../src/features/blogger-platform/likes/domain/like.entity';
import { getModelToken } from '@nestjs/mongoose';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { CommentLikesTestManager } from './helpers/comment-likes.test-manager';
import { CommentsCommonTestManager } from '../helpers/comments.common.test-manager';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LikeInputDto } from '../../src/features/blogger-platform/likes/api/input-dto/like.input-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';

describe('comment likes', () => {
  let app: INestApplication;
  let commentLikesTestManager: CommentLikesTestManager;
  let commentsCommonTestManager: CommentsCommonTestManager;
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
    let commentator: UserViewDto;
    let commentatorData: CreateUserDto;
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

      commentatorData = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      commentator = await usersCommonTestManager.createUser(commentatorData);
    });

    afterEach(async () => {
      await commentLikesTestManager.checkCommentLikesCount(comment.id, 0);
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
        commentatorData.login,
        commentatorData.password,
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
        commentatorData.login,
        commentatorData.password,
      );

      await delay(2000);

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        'Bearer ' + accessToken,
        HttpStatus.UNAUTHORIZED,
      );
    });

    // user was deleted
    it('should return 401 if user was deleted', async () => {
      const accessToken = await authTestManager.getNewAccessToken(
        commentatorData.login,
        commentatorData.password,
      );
      await usersCommonTestManager.deleteUser(commentator.id);

      await commentLikesTestManager.makeCommentLikeOperation(
        comment.id,
        inputDto,
        'Bearer ' + accessToken,
        HttpStatus.UNAUTHORIZED,
      );
    });
  });
});
