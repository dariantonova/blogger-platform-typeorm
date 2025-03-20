import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  deleteAllData,
  getPageOfArray,
  initApp,
  sortArrByDateStrField,
  sortArrByStrField,
} from '../helpers/helper';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  PostsTestManager,
} from './helpers/posts.test-manager';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { CreatePostInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post.input-dto';
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';

describe('posts', () => {
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

  describe('get posts', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return empty array', async () => {
      const response = await postsTestManager.getPosts(HttpStatus.OK);

      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return array of posts', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const posts = await postsTestManager.createPostsWithGeneratedData(
        2,
        blog.id,
      );

      const response = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

      expect(responseBody.items).toEqual(posts.toReversed());
      expect(responseBody.totalCount).toBe(posts.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
    });

    it(`shouldn't return deleted posts`, async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const posts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blog.id,
      );
      await postsTestManager.deletePost(posts[0].id, HttpStatus.NO_CONTENT);

      const response = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('pagination', () => {
      let posts: PostViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        posts = await postsTestManager.createPostsWithGeneratedData(
          12,
          blog.id,
        );
      });

      it('should return specified page of posts array', async () => {
        const pageNumber = 2;
        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_POSTS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          posts.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of posts', async () => {
        const pageSize = 2;
        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          pageSize,
        });
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          posts.toReversed(),
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
        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          pageNumber,
          pageSize,
        });
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          posts.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let posts: PostViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blogsData: CreateBlogInputDto[] = [
          {
            name: 'blog-a',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-b',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-d',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-c',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
        ];
        const blogs = await blogsCommonTestManager.createBlogs(blogsData);

        const postsData: CreatePostInputDto[] = [
          {
            title: 'post-a',
            shortDescription: 'desc-3',
            content: 'content-d',
            blogId: blogs[0].id,
          },
          {
            title: 'post-c',
            shortDescription: 'desc-4',
            content: 'content-c',
            blogId: blogs[1].id,
          },
          {
            title: 'post-b',
            shortDescription: 'desc-2',
            content: 'content-b',
            blogId: blogs[2].id,
          },
          {
            title: 'post-d',
            shortDescription: 'desc-1',
            content: 'content-a',
            blogId: blogs[3].id,
          },
        ];
        posts = await postsTestManager.createPosts(postsData);
      });

      it('should return posts sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(posts, 'createdAt', 'desc');

        const response1 = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.CreatedAt,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await postsTestManager.getPosts(HttpStatus.OK, {
          sortDirection: SortDirection.Desc,
        });
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.CreatedAt,
        });
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await postsTestManager.getPosts(HttpStatus.OK);
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(posts, 'createdAt', 'asc');

        const response1 = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.CreatedAt,
          sortDirection: SortDirection.Asc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await postsTestManager.getPosts(HttpStatus.OK, {
          sortDirection: SortDirection.Asc,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by title in desc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'title', 'desc');

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.Title,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by title in asc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'title', 'asc');

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.Title,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by short description in desc order', async () => {
        const expectedItems = sortArrByStrField(
          posts,
          'shortDescription',
          'desc',
        );

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.ShortDescription,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by short description in asc order', async () => {
        const expectedItems = sortArrByStrField(
          posts,
          'shortDescription',
          'asc',
        );

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.ShortDescription,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by blog name in desc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'blogName', 'desc');

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.BlogName,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return posts sorted by blog name in asc order', async () => {
        const expectedItems = sortArrByStrField(posts, 'blogName', 'asc');

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: PostsSortBy.BlogName,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it(`should return posts in order of creation if sort field doesn't exist`, async () => {
        const expectedItems = posts;

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: 'nonExisting',
        });
        expect(response.body.items).toEqual(expectedItems);
      });
    });
  });
});
