import { HttpStatus, INestApplication } from '@nestjs/common';
import { PostsTestManager } from './helpers/posts.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import {
  deleteAllData,
  generateNonExistingId,
  initApp,
} from '../helpers/helper';
import { CreateBlogPostInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';

describe('blog posts', () => {
  let app: INestApplication;
  let postsTestManager: PostsTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;

  beforeAll(async () => {
    app = await initApp();
    postsTestManager = new PostsTestManager(app);
    blogsCommonTestManager = new BlogsCommonTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create blog post', () => {
    const validInputDto: CreateBlogPostInputDto = {
      title: 'post',
      shortDescription: 'short description',
      content: 'content',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should create blog post', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const inputDto: CreateBlogPostInputDto = validInputDto;

      const response = await postsTestManager.createBlogPost(
        blog.id,
        inputDto,
        HttpStatus.CREATED,
      );
      const createdPost: PostViewDto = response.body;

      expect(createdPost.id).toEqual(expect.any(String));
      expect(createdPost.title).toBe(inputDto.title);
      expect(createdPost.shortDescription).toBe(inputDto.shortDescription);
      expect(createdPost.content).toBe(inputDto.content);
      expect(createdPost.blogId).toBe(blog.id);
      expect(createdPost.blogName).toBe(blog.name);
      expect(createdPost.createdAt).toEqual(expect.any(String));
      expect(Date.parse(createdPost.createdAt)).not.toBeNaN();
      expect(createdPost.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      });

      const getPostResponse = await postsTestManager.getPost(
        createdPost.id,
        HttpStatus.OK,
      );
      expect(getPostResponse.body).toEqual(createdPost);
    });

    it('should return 404 when trying to create post of non-existing blog', async () => {
      const nonExistingId = generateNonExistingId();
      await postsTestManager.createBlogPost(
        nonExistingId,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to create post of deleted blog', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      await blogsCommonTestManager.deleteBlog(blog.id);

      await postsTestManager.createBlogPost(
        blog.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
