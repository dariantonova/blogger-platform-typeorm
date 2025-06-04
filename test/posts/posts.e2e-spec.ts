import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  deleteAllData,
  generateIdOfWrongType,
  generateNonExistingId,
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
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { CreateBlogPostInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { CoreConfig } from '../../src/core/core.config';

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
      const coreConfig = app.get(CoreConfig);
      console.log(coreConfig.pgDbName);

      await deleteAllData(app);
    });

    it('should return empty array', async () => {
      const response = await postsTestManager.getPosts(HttpStatus.OK);

      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return posts with default pagination and sorting', async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const posts = await postsTestManager.createBlogPostsWithGeneratedData(
        2,
        blog.id,
      );

      const response = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;

      expect(responseBody.items).toEqual(posts.toReversed());
      expect(responseBody.totalCount).toBe(posts.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
      expect(responseBody.pageSize).toBe(DEFAULT_POSTS_PAGE_SIZE);
    });

    it(`shouldn't return deleted posts`, async () => {
      await deleteAllData(app);

      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const posts = await postsTestManager.createBlogPostsWithGeneratedData(
        1,
        blog.id,
      );
      await postsTestManager.deleteBlogPost(
        blog.id,
        posts[0].id,
        HttpStatus.NO_CONTENT,
      );

      const response = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('pagination', () => {
      let posts: PostViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        posts = await postsTestManager.createBlogPostsWithGeneratedData(
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

        const postsData: CreateBlogPostInputDto[] = [
          {
            title: 'post-a',
            shortDescription: 'desc-3',
            content: 'content-d',
          },
          {
            title: 'post-c',
            shortDescription: 'desc-4',
            content: 'content-c',
          },
          {
            title: 'post-b',
            shortDescription: 'desc-2',
            content: 'content-b',
          },
          {
            title: 'post-d',
            shortDescription: 'desc-1',
            content: 'content-a',
          },
        ];

        posts = [];
        for (let i = 0; i < blogs.length; i++) {
          const createResponse = await postsTestManager.createBlogPost(
            blogs[i].id,
            postsData[i],
            HttpStatus.CREATED,
          );
          posts.push(createResponse.body as PostViewDto);
        }
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

      it(`should return posts in desc order of creation if sort field doesn't exist`, async () => {
        const expectedItems = posts.toReversed();

        const response = await postsTestManager.getPosts(HttpStatus.OK, {
          sortBy: 'nonExisting',
        });
        expect(response.body.items).toEqual(expectedItems);
      });
    });
  });

  describe('get post', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should return post', async () => {
      const posts = await postsTestManager.createBlogPostsWithGeneratedData(
        1,
        blog.id,
      );
      const postToGet = posts[0];

      const response = await postsTestManager.getPost(
        postToGet.id,
        HttpStatus.OK,
      );
      const responseBody: PostViewDto = response.body;

      expect(responseBody).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: expect.any(String),
          newestLikes: expect.any(Array),
        },
      });
      expect(responseBody).toEqual(postToGet);
    });

    it('should return 404 when trying to get non-existing post', async () => {
      const nonExistingId = generateNonExistingId();
      await postsTestManager.getPost(nonExistingId, HttpStatus.NOT_FOUND);
    });

    // it('should return 404 when post id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await postsTestManager.getPost(invalidId, HttpStatus.NOT_FOUND);
    // });

    it('should return 404 when post id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await postsTestManager.getPost(invalidId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to get deleted post', async () => {
      const createdPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(1, blog.id);
      const postToDelete = createdPosts[0];

      await postsTestManager.deleteBlogPost(
        blog.id,
        postToDelete.id,
        HttpStatus.NO_CONTENT,
      );

      await postsTestManager.getPost(postToDelete.id, HttpStatus.NOT_FOUND);
    });
  });
});
