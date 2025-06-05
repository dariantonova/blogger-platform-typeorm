import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  caseInsensitiveSearch,
  deleteAllData,
  generateIdOfWrongType,
  generateNonExistingId,
  getPageOfArray,
  initApp,
  invalidBasicAuthTestValues,
  sortArrByDateStrField,
  sortArrByStrField,
} from '../helpers/helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import {
  BlogsTestManager,
  DEFAULT_BLOGS_PAGE_SIZE,
} from './helpers/blogs.test-manager';
import { BlogsSortBy } from '../../src/features/blogger-platform/blogs/api/input-dto/blogs-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/update-blog.input-dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { CommentsCommonTestManager } from '../helpers/comments.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { PostLikesTestManager } from '../likes/helpers/post-likes.test-manager';
import { CommentLikesTestManager } from '../likes/helpers/comment-likes.test-manager';
import { CommentLikesTestRepositorySql } from '../helpers/repositories/comment-likes.test-repository.sql';
import { PostLikesTestRepositorySql } from '../helpers/repositories/post-likes.test-repository.sql';
import { DataSource } from 'typeorm';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let commentsCommonTestManager: CommentsCommonTestManager;
  let postLikesTestManager: PostLikesTestManager;
  let postLikesTestRepository: PostLikesTestRepositorySql;
  let commentLikesTestManager: CommentLikesTestManager;
  let commentLikesTestRepository: CommentLikesTestRepositorySql;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    app = await initApp();

    blogsTestManager = new BlogsTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    commentsCommonTestManager = new CommentsCommonTestManager(app);
    postLikesTestManager = new PostLikesTestManager(app);
    commentLikesTestManager = new CommentLikesTestManager(app);
    authTestManager = new AuthTestManager(app);

    const dataSource = app.get(DataSource);
    postLikesTestRepository = new PostLikesTestRepositorySql(dataSource);
    commentLikesTestRepository = new CommentLikesTestRepositorySql(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get blogs', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return empty array', async () => {
      const response = await blogsTestManager.getBlogs(HttpStatus.OK);

      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return blogs with default pagination and sorting', async () => {
      const blogs = await blogsTestManager.createBlogsWithGeneratedData(2);

      const response = await blogsTestManager.getBlogs(HttpStatus.OK);
      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

      expect(responseBody.items).toEqual(blogs.toReversed());
      expect(responseBody.totalCount).toBe(blogs.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
      expect(responseBody.pageSize).toBe(DEFAULT_BLOGS_PAGE_SIZE);
    });

    it(`shouldn't return deleted blogs`, async () => {
      await deleteAllData(app);

      const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
      await blogsTestManager.deleteBlog(blogs[0].id, HttpStatus.NO_CONTENT);

      const response = await blogsTestManager.getBlogs(HttpStatus.OK);
      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('pagination', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        blogs = await blogsTestManager.createBlogsWithGeneratedData(12);
      });

      it('should return specified page of blogs array', async () => {
        const pageNumber = 2;
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_BLOGS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of blogs', async () => {
        const pageSize = 2;
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          pageSize,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          expectedPageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(1);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return correct page with specified page size', async () => {
        const pageNumber = 2;
        const pageSize = 2;
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          pageNumber,
          pageSize,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blogsData: CreateBlogInputDto[] = [
          {
            name: 'blog-a',
            description: 'desc-z',
            websiteUrl: 'https://site-1.com',
          },
          {
            name: 'blog-b',
            description: 'desc-y',
            websiteUrl: 'https://site-3.com',
          },
          {
            name: 'blog-g',
            description: 'desc-x',
            websiteUrl: 'https://site-2.com',
          },
          {
            name: 'blog-d',
            description: 'desc-w',
            websiteUrl: 'https://site-4.com',
          },
        ];
        blogs = await blogsTestManager.createBlogs(blogsData);
      });

      it('should return blogs sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(blogs, 'createdAt', 'desc');

        const response1 = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortDirection: SortDirection.Desc,
        });
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
        });
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await blogsTestManager.getBlogs(HttpStatus.OK);
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(blogs, 'createdAt', 'asc');

        const response1 = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
          sortDirection: SortDirection.Asc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortDirection: SortDirection.Asc,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by name in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'name', 'desc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.Name,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by name in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'name', 'asc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.Name,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by description in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'description', 'desc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.Description,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by description in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'description', 'asc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.Description,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by website url in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'websiteUrl', 'desc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.WebsiteUrl,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by website url in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'websiteUrl', 'asc');

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: BlogsSortBy.WebsiteUrl,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it(`should return blogs in desc order of creation if sort field doesn't exist`, async () => {
        const expectedItems = blogs.toReversed();

        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          sortBy: 'nonExisting',
        });
        expect(response.body.items).toEqual(expectedItems);
      });
    });

    describe('filtering', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blogsData: CreateBlogInputDto[] = [
          {
            name: 'blog-abc',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-baB',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-ABl',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-d',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
        ];
        blogs = await blogsTestManager.createBlogs(blogsData);
      });

      it('should return blogs with name containing search name term', async () => {
        const searchNameTerm = 'ab';
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          searchNameTerm,
        });
        const expectedItems = blogs
          .filter((b) => caseInsensitiveSearch(b.name, searchNameTerm))
          .toReversed();
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return empty array if no blog matches search name term', async () => {
        const searchNameTerm = 'non-existing';
        const response = await blogsTestManager.getBlogs(HttpStatus.OK, {
          searchNameTerm,
        });
        expect(response.body.items).toEqual([]);
      });
    });
  });

  describe('get blogs sa', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return empty array', async () => {
      const response = await blogsTestManager.getBlogsSa(HttpStatus.OK);

      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return blogs with default pagination and sorting', async () => {
      const blogs = await blogsTestManager.createBlogsWithGeneratedData(2);

      const response = await blogsTestManager.getBlogsSa(HttpStatus.OK);
      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

      expect(responseBody.items).toEqual(blogs.toReversed());
      expect(responseBody.totalCount).toBe(blogs.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
      expect(responseBody.pageSize).toBe(DEFAULT_BLOGS_PAGE_SIZE);
    });

    it(`shouldn't return deleted blogs`, async () => {
      await deleteAllData(app);

      const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
      await blogsTestManager.deleteBlog(blogs[0].id, HttpStatus.NO_CONTENT);

      const response = await blogsTestManager.getBlogsSa(HttpStatus.OK);
      const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('authentication', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should forbid getting blogs for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await blogsTestManager.getBlogsSa(
            HttpStatus.UNAUTHORIZED,
            {},
            invalidAuthValue,
          );
        }
      });
    });

    describe('pagination', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        blogs = await blogsTestManager.createBlogsWithGeneratedData(12);
      });

      it('should return specified page of blogs array', async () => {
        const pageNumber = 2;
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_BLOGS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of blogs', async () => {
        const pageSize = 2;
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          pageSize,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          expectedPageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(1);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return correct page with specified page size', async () => {
        const pageNumber = 2;
        const pageSize = 2;
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          pageNumber,
          pageSize,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          blogs.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<BlogViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blogsData: CreateBlogInputDto[] = [
          {
            name: 'blog-a',
            description: 'desc-z',
            websiteUrl: 'https://site-1.com',
          },
          {
            name: 'blog-b',
            description: 'desc-y',
            websiteUrl: 'https://site-3.com',
          },
          {
            name: 'blog-g',
            description: 'desc-x',
            websiteUrl: 'https://site-2.com',
          },
          {
            name: 'blog-d',
            description: 'desc-w',
            websiteUrl: 'https://site-4.com',
          },
        ];
        blogs = await blogsTestManager.createBlogs(blogsData);
      });

      it('should return blogs sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(blogs, 'createdAt', 'desc');

        const response1 = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortDirection: SortDirection.Desc,
        });
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
        });
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await blogsTestManager.getBlogsSa(HttpStatus.OK);
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(blogs, 'createdAt', 'asc');

        const response1 = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.CreatedAt,
          sortDirection: SortDirection.Asc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortDirection: SortDirection.Asc,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by name in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'name', 'desc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.Name,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by name in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'name', 'asc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.Name,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by description in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'description', 'desc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.Description,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by description in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'description', 'asc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.Description,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by website url in desc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'websiteUrl', 'desc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.WebsiteUrl,
          sortDirection: SortDirection.Desc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return blogs sorted by website url in asc order', async () => {
        const expectedItems = sortArrByStrField(blogs, 'websiteUrl', 'asc');

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: BlogsSortBy.WebsiteUrl,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it(`should return blogs in desc order of creation if sort field doesn't exist`, async () => {
        const expectedItems = blogs.toReversed();

        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          sortBy: 'nonExisting',
        });
        expect(response.body.items).toEqual(expectedItems);
      });
    });

    describe('filtering', () => {
      let blogs: BlogViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blogsData: CreateBlogInputDto[] = [
          {
            name: 'blog-abc',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-baB',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-ABl',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
          {
            name: 'blog-d',
            description: 'description',
            websiteUrl: 'https://site.com',
          },
        ];
        blogs = await blogsTestManager.createBlogs(blogsData);
      });

      it('should return blogs with name containing search name term', async () => {
        const searchNameTerm = 'ab';
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          searchNameTerm,
        });
        const expectedItems = blogs
          .filter((b) => caseInsensitiveSearch(b.name, searchNameTerm))
          .toReversed();
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return empty array if no blog matches search name term', async () => {
        const searchNameTerm = 'non-existing';
        const response = await blogsTestManager.getBlogsSa(HttpStatus.OK, {
          searchNameTerm,
        });
        expect(response.body.items).toEqual([]);
      });
    });
  });

  describe('get blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return blog', async () => {
      const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToGet = blogs[0];

      const response = await blogsTestManager.getBlog(
        blogToGet.id,
        HttpStatus.OK,
      );
      const responseBody: BlogViewDto = response.body;

      expect(responseBody).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });
      expect(responseBody).toEqual(blogToGet);
    });

    it('should return 404 when trying to get non-existing blog', async () => {
      const nonExistingId = generateNonExistingId();
      await blogsTestManager.getBlog(nonExistingId, HttpStatus.NOT_FOUND);
    });

    // it('should return 404 when blog id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await blogsTestManager.getBlog(invalidId, HttpStatus.NOT_FOUND);
    // });

    it('should return 404 when blog id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await blogsTestManager.getBlog(invalidId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to get deleted blog', async () => {
      const createdBlogs =
        await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToDelete = createdBlogs[0];

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NO_CONTENT);

      await blogsTestManager.getBlog(blogToDelete.id, HttpStatus.NOT_FOUND);
    });
  });

  describe('create blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should create blog', async () => {
      const inputDto: CreateBlogInputDto = {
        name: 'blog',
        description: 'description',
        websiteUrl: 'https://site.com',
      };

      const response = await blogsTestManager.createBlog(
        inputDto,
        HttpStatus.CREATED,
      );
      const createdBlog: BlogViewDto = response.body;

      expect(createdBlog.id).toEqual(expect.any(String));
      expect(createdBlog.name).toBe(inputDto.name);
      expect(createdBlog.description).toBe(inputDto.description);
      expect(createdBlog.websiteUrl).toBe(inputDto.websiteUrl);
      expect(createdBlog.createdAt).toEqual(expect.any(String));
      expect(Date.parse(createdBlog.createdAt)).not.toBeNaN();
      expect(createdBlog.isMembership).toBe(false);

      const getBlogResponse = await blogsTestManager.getBlog(
        createdBlog.id,
        HttpStatus.OK,
      );
      expect(getBlogResponse.body).toEqual(createdBlog);
    });

    describe('validation', () => {
      const validInput: CreateBlogInputDto = {
        name: 'blog',
        description: 'description',
        websiteUrl: 'https://site.com',
      };

      beforeAll(async () => {
        await deleteAllData(app);
      });

      afterEach(async () => {
        await blogsTestManager.checkBlogsCount(0);
      });

      it('should return 400 if name is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: 4,
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: '',
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: '  ',
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: 'a'.repeat(16),
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.createBlog(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'name',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if description is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          name: validInput.name,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: validInput.name,
          description: 4,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: validInput.name,
          description: '',
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: validInput.name,
          description: '  ',
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: validInput.name,
          description: 'a'.repeat(501),
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.createBlog(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'description',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if websiteUrl is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          name: validInput.name,
          description: validInput.description,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 'a'.repeat(101),
        };
        invalidDataCases.push(data5);

        // does not match pattern
        const data6 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 'not url',
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.createBlog(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'websiteUrl',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          name: '',
          description: 'a'.repeat(501),
        };

        const response = await blogsTestManager.createBlog(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
            {
              field: 'description',
              message: expect.any(String),
            },
            {
              field: 'websiteUrl',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });

    describe('authentication', () => {
      const validInput: CreateBlogInputDto = {
        name: 'blog',
        description: 'description',
        websiteUrl: 'https://site.com',
      };

      beforeAll(async () => {
        await deleteAllData(app);
      });

      afterEach(async () => {
        await blogsTestManager.checkBlogsCount(0);
      });

      it('should forbid creating blog for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await blogsTestManager.createBlog(
            validInput,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });
  });

  describe('update blog', () => {
    const validInputDto: UpdateBlogInputDto = {
      name: 'after',
      description: 'description after update',
      websiteUrl: 'https://site-after-update.com',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should update blog', async () => {
      const createInputDto: CreateBlogInputDto = {
        name: 'before',
        description: 'description before update',
        websiteUrl: 'https://site-before-update.com',
      };

      const createResponse = await blogsTestManager.createBlog(
        createInputDto,
        HttpStatus.CREATED,
      );
      const createdBlog: BlogViewDto = createResponse.body;

      const updateInputDto: UpdateBlogInputDto = {
        name: 'after',
        description: 'description after update',
        websiteUrl: 'https://site-after-update.com',
      };
      await blogsTestManager.updateBlog(
        createdBlog.id,
        updateInputDto,
        HttpStatus.NO_CONTENT,
      );

      const getBlogResponse = await blogsTestManager.getBlog(
        createdBlog.id,
        HttpStatus.OK,
      );
      const updatedBlog: BlogViewDto = getBlogResponse.body;

      expect(updatedBlog.name).toBe(updateInputDto.name);
      expect(updatedBlog.description).toBe(updateInputDto.description);
      expect(updatedBlog.websiteUrl).toBe(updateInputDto.websiteUrl);
      expect(updatedBlog.id).toBe(createdBlog.id);
      expect(updatedBlog.createdAt).toBe(createdBlog.createdAt);
      expect(updatedBlog.isMembership).toBe(createdBlog.isMembership);
    });

    it('should return 404 when trying to update non-existing blog', async () => {
      const nonExistingId = generateNonExistingId();

      await blogsTestManager.updateBlog(
        nonExistingId,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    // it('should return 404 when blog id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //
    //   await blogsTestManager.updateBlog(
    //     invalidId,
    //     validInputDto,
    //     HttpStatus.NOT_FOUND,
    //   );
    // });

    it('should return 404 when blog id is not a number', async () => {
      const invalidId = generateIdOfWrongType();

      await blogsTestManager.updateBlog(
        invalidId,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update deleted blog', async () => {
      const createdBlogs =
        await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToDelete = createdBlogs[0];

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NO_CONTENT);

      await blogsTestManager.updateBlog(
        blogToDelete.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    describe('validation', () => {
      let blogToUpdate: BlogViewDto;
      const validInput: UpdateBlogInputDto = {
        name: 'after',
        description: 'description after update',
        websiteUrl: 'https://site-after-update.com',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
        blogToUpdate = blogs[0];
      });

      it('should return 400 if name is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: 4,
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: '',
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: '  ',
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: 'a'.repeat(16),
          description: validInput.description,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.updateBlog(
            blogToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'name',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if description is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          name: validInput.name,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: validInput.name,
          description: 4,
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: validInput.name,
          description: '',
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: validInput.name,
          description: '  ',
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: validInput.name,
          description: 'a'.repeat(501),
          websiteUrl: validInput.websiteUrl,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.updateBlog(
            blogToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'description',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if websiteUrl is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          name: validInput.name,
          description: validInput.description,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 'a'.repeat(101),
        };
        invalidDataCases.push(data5);

        // does not match pattern
        const data6 = {
          name: validInput.name,
          description: validInput.description,
          websiteUrl: 'not url',
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await blogsTestManager.updateBlog(
            blogToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'websiteUrl',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          name: '',
          description: 'a'.repeat(501),
        };

        const response = await blogsTestManager.updateBlog(
          blogToUpdate.id,
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'name',
              message: expect.any(String),
            },
            {
              field: 'description',
              message: expect.any(String),
            },
            {
              field: 'websiteUrl',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });

    describe('authentication', () => {
      let blogToUpdate: BlogViewDto;
      const validInput: UpdateBlogInputDto = {
        name: 'after',
        description: 'description after update',
        websiteUrl: 'https://site-after-update.com',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
        blogToUpdate = blogs[0];
      });

      it('should forbid updating blog for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await blogsTestManager.updateBlog(
            blogToUpdate.id,
            validInput,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });
  });

  describe('delete blog', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should delete blog', async () => {
      const createdBlogs =
        await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToDelete = createdBlogs[0];

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NO_CONTENT);

      await blogsTestManager.getBlog(blogToDelete.id, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to delete non-existing blog', async () => {
      const nonExistingId = generateNonExistingId();
      await blogsTestManager.deleteBlog(nonExistingId, HttpStatus.NOT_FOUND);
    });

    // it('should return 404 when blog id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await blogsTestManager.deleteBlog(invalidId, HttpStatus.NOT_FOUND);
    // });

    it('should return 404 when blog id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await blogsTestManager.deleteBlog(invalidId, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to delete already deleted blog', async () => {
      const createdBlogs =
        await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToDelete = createdBlogs[0];

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NO_CONTENT);

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NOT_FOUND);
    });

    describe('authentication', () => {
      let blogToDelete: BlogViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blogs = await blogsTestManager.createBlogsWithGeneratedData(1);
        blogToDelete = blogs[0];
      });

      afterEach(async () => {
        await blogsTestManager.checkBlogsCount(1);
      });

      it('should forbid deleting blog for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await blogsTestManager.deleteBlog(
            blogToDelete.id,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });

    describe('relations deletion', () => {
      let blogToDelete: BlogViewDto;
      let usersAuthStrings: string[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersAuthStrings = [];
        for (let i = 1; i <= 3; i++) {
          const authString =
            await authTestManager.getValidAuthOfNewlyRegisteredUser(i);
          usersAuthStrings.push(authString);
        }
      });

      beforeEach(async () => {
        blogToDelete = await blogsTestManager.createBlogWithGeneratedData();
      });

      it('should delete all related posts', async () => {
        const blogPosts =
          await postsCommonTestManager.createBlogPostsWithGeneratedData(
            3,
            blogToDelete.id,
          );

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await postsCommonTestManager.assertPostsAreDeleted(
          blogPosts.map((p) => p.id),
        );
      });

      it('should delete only related posts', async () => {
        const anotherBlog =
          await blogsTestManager.createBlogWithGeneratedData();
        const anotherBlogPost =
          await postsCommonTestManager.createBlogPostWithGeneratedData(
            anotherBlog.id,
          );

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await postsCommonTestManager.getPostSuccess(anotherBlogPost.id);
      });

      it('should delete all likes of related posts', async () => {
        const blogPosts =
          await postsCommonTestManager.createBlogPostsWithGeneratedData(
            2,
            blogToDelete.id,
          );

        for (const blogPost of blogPosts) {
          await postLikesTestManager.addLikesWithAllStatusesToPost(
            blogPost.id,
            usersAuthStrings.slice(0, 3),
          );
        }

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await postLikesTestRepository.assertPostsHaveNoLikes(
          blogPosts.map((p) => p.id),
        );
      });

      it('should delete only likes of related posts', async () => {
        const anotherBlog =
          await blogsTestManager.createBlogWithGeneratedData();
        const postOfAnotherBlog =
          await postsCommonTestManager.createBlogPostWithGeneratedData(
            anotherBlog.id,
          );

        await postLikesTestManager.addLikesWithAllStatusesToPost(
          postOfAnotherBlog.id,
          usersAuthStrings.slice(0, 3),
        );

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await postLikesTestRepository.checkPostLikesCount(
          postOfAnotherBlog.id,
          3,
        );
      });

      it('should delete all related comments', async () => {
        const blogPosts =
          await postsCommonTestManager.createBlogPostsWithGeneratedData(
            2,
            blogToDelete.id,
          );

        const relatedComments: CommentViewDto[] = [];
        for (const blogPost of blogPosts) {
          const comments =
            await commentsCommonTestManager.createCommentsWithGeneratedData(
              2,
              blogPost.id,
              usersAuthStrings[0],
            );
          relatedComments.push(...comments);
        }

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await commentsCommonTestManager.assertCommentsAreDeleted(
          relatedComments.map((c) => c.id),
        );
      });

      it('should delete only related comments', async () => {
        const anotherBlog =
          await blogsTestManager.createBlogWithGeneratedData();
        const anotherBlogPost =
          await postsCommonTestManager.createBlogPostWithGeneratedData(
            anotherBlog.id,
          );

        const anotherBlogComment =
          await commentsCommonTestManager.createCommentWithGeneratedData(
            anotherBlogPost.id,
            usersAuthStrings[0],
          );

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await commentsCommonTestManager.getCommentSuccess(
          anotherBlogComment.id,
        );
      });

      it('should delete all likes of related comments', async () => {
        const blogPosts =
          await postsCommonTestManager.createBlogPostsWithGeneratedData(
            2,
            blogToDelete.id,
          );

        const relatedComments: CommentViewDto[] = [];
        for (const blogPost of blogPosts) {
          const comment1 =
            await commentsCommonTestManager.createCommentWithGeneratedData(
              blogPost.id,
              usersAuthStrings[0],
            );
          const comment2 =
            await commentsCommonTestManager.createCommentWithGeneratedData(
              blogPost.id,
              usersAuthStrings[0],
            );

          relatedComments.push(comment1, comment2);
        }

        for (const relatedComment of relatedComments) {
          await commentLikesTestManager.addLikesWithAllStatusesToComment(
            relatedComment.id,
            usersAuthStrings.slice(0, 3),
          );
        }

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await commentLikesTestRepository.assertCommentsHaveNoLikes(
          relatedComments.map((c) => c.id),
        );
      });

      it('should delete only likes of related comments', async () => {
        const anotherBlog =
          await blogsTestManager.createBlogWithGeneratedData();
        const anotherBlogPost =
          await postsCommonTestManager.createBlogPostWithGeneratedData(
            anotherBlog.id,
          );

        const anotherBlogComment =
          await commentsCommonTestManager.createCommentWithGeneratedData(
            anotherBlogPost.id,
            usersAuthStrings[0],
          );

        await commentLikesTestManager.addLikesWithAllStatusesToComment(
          anotherBlogComment.id,
          usersAuthStrings.slice(0, 3),
        );

        await blogsTestManager.deleteBlogSuccess(blogToDelete.id);

        await commentLikesTestRepository.checkCommentLikesCount(
          anotherBlogComment.id,
          3,
        );
      });
    });
  });
});
