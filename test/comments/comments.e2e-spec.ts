import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { CommentsTestManager } from './helpers/comments.test-manager';

describe('comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;

  beforeAll(async () => {
    app = await initApp();
    commentsTestManager = new CommentsTestManager(app);
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
