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

describe('comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    app = await initApp();

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
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return 404 when trying to get non-existing comment', async () => {
      const nonExistingId = generateNonExistingId();
      await commentsTestManager.getComment(nonExistingId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when comment id is not valid ObjectId', async () => {
      const invalidId = 'not ObjectId';
      await commentsTestManager.getComment(invalidId, HttpStatus.NOT_FOUND);
    });
  });
});
