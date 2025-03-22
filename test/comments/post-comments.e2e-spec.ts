import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentsTestManager } from './helpers/comments.test-manager';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import {
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';

describe('post comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;

  beforeAll(async () => {
    app = await initApp();

    commentsTestManager = new CommentsTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    blogsCommonTestManager = new BlogsCommonTestManager(app);
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
});
