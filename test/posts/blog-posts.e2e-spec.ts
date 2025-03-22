import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  PostsTestManager,
} from './helpers/posts.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import {
  deleteAllData,
  generateNonExistingId,
  getPageOfArray,
  initApp,
  sortArrByDateStrField,
  sortArrByStrField,
} from '../helpers/helper';
import { CreateBlogPostInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { CreatePostInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post.input-dto';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';

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

  describe('get blog posts', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return 404 when trying to get posts of non-existing blog', async () => {
      const nonExistingId = generateNonExistingId();
      await postsTestManager.getBlogPosts(nonExistingId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to get posts of deleted blog', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      await blogsCommonTestManager.deleteBlog(blog.id);

      await postsTestManager.getBlogPosts(blog.id, HttpStatus.NOT_FOUND);
    });

    it('should return empty array if blog has no posts', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const response = await postsTestManager.getBlogPosts(
        blog.id,
        HttpStatus.OK,
      );

      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return blog posts with default pagination and sorting', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const blogPosts = await postsTestManager.createPostsWithGeneratedData(
        2,
        blog.id,
      );

      const response = await postsTestManager.getBlogPosts(
        blog.id,
        HttpStatus.OK,
      );
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

      expect(responseBody.items).toEqual(blogPosts.toReversed());
      expect(responseBody.totalCount).toBe(blogPosts.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
      expect(responseBody.pageSize).toBe(DEFAULT_POSTS_PAGE_SIZE);
    });

    it(`shouldn't return posts of other blogs`, async () => {
      const blogs =
        await blogsCommonTestManager.createBlogsWithGeneratedData(2);
      const blog1Posts = await postsTestManager.createPostsWithGeneratedData(
        2,
        blogs[0].id,
      );
      await postsTestManager.createPostsWithGeneratedData(2, blogs[1].id);

      const response = await postsTestManager.getBlogPosts(
        blogs[0].id,
        HttpStatus.OK,
      );
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual(blog1Posts.toReversed());
    });

    it(`shouldn't return deleted posts`, async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const posts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blog.id,
      );
      await postsTestManager.deletePost(posts[0].id, HttpStatus.NO_CONTENT);

      const response = await postsTestManager.getBlogPosts(
        blog.id,
        HttpStatus.OK,
      );
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('pagination', () => {
      let blog: BlogViewDto;
      let blogPosts: PostViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        blogPosts = await postsTestManager.createPostsWithGeneratedData(
          12,
          blog.id,
        );
      });

      it('should return specified page of posts array', async () => {
        const pageNumber = 2;
        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            pageNumber,
          },
        );
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_POSTS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          blogPosts.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of posts', async () => {
        const pageSize = 2;
        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            pageSize,
          },
        );
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          blogPosts.toReversed(),
          expectedPageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(expectedPageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return correct page with specified page size', async () => {
        const pageNumber = 2;
        const pageSize = 2;
        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            pageNumber,
            pageSize,
          },
        );
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          blogPosts.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            pageNumber,
          },
        );
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let blog: BlogViewDto;
      let posts: PostViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();

        const postsData: CreatePostInputDto[] = [
          {
            title: 'post-a',
            shortDescription: 'desc-3',
            content: 'content-d',
            blogId: blog.id,
          },
          {
            title: 'post-c',
            shortDescription: 'desc-4',
            content: 'content-c',
            blogId: blog.id,
          },
          {
            title: 'post-b',
            shortDescription: 'desc-2',
            content: 'content-b',
            blogId: blog.id,
          },
          {
            title: 'post-d',
            shortDescription: 'desc-1',
            content: 'content-a',
            blogId: blog.id,
          },
        ];
        posts = await postsTestManager.createPosts(postsData);
      });

      it('should return posts sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(posts, 'createdAt', 'desc');

        const response1 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
          },
        );
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
        );
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(posts, 'createdAt', 'asc');

        const response1 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by title in desc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'title', 'desc');

        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.Title,
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by title in asc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'title', 'asc');

        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.Title,
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by short description in desc order', async () => {
        const expectedItems = sortArrByStrField(
          posts,
          'shortDescription',
          'desc',
        );

        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.ShortDescription,
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by short description in asc order', async () => {
        const expectedItems = sortArrByStrField(
          posts,
          'shortDescription',
          'asc',
        );

        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.ShortDescription,
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });

      it(`should return posts in order of creation if sort field doesn't exist`, async () => {
        const expectedItems = posts;

        const response = await postsTestManager.getBlogPosts(
          blog.id,
          HttpStatus.OK,
          {
            sortBy: 'nonExisting',
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });
    });
  });
});
