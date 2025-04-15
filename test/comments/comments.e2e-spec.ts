import { HttpStatus, INestApplication } from '@nestjs/common';
import {
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
});
