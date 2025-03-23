import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  caseInsensitiveSearch,
  deleteAllData,
  generateNonExistingId,
  getPageOfArray,
  initApp,
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

describe('blogs', () => {
  let app: INestApplication;
  let blogsTestManager: BlogsTestManager;

  beforeAll(async () => {
    app = await initApp();
    blogsTestManager = new BlogsTestManager(app);
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

      it(`should return blogs in order of creation if sort field doesn't exist`, async () => {
        const expectedItems = blogs;

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
  });

  describe('update blog', () => {
    const validInputDto: UpdateBlogInputDto = {
      name: 'name',
      description: 'description',
      websiteUrl: 'https://site.com',
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should update blog', async () => {
      const createInputDto: CreateBlogInputDto = {
        name: 'name before update',
        description: 'description before update',
        websiteUrl: 'https://site-before-update.com',
      };

      const createResponse = await blogsTestManager.createBlog(
        createInputDto,
        HttpStatus.CREATED,
      );
      const createdBlog: BlogViewDto = createResponse.body;

      const updateInputDto: UpdateBlogInputDto = {
        name: 'name after update',
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

    it('should return 404 when trying to delete already deleted blog', async () => {
      const createdBlogs =
        await blogsTestManager.createBlogsWithGeneratedData(1);
      const blogToDelete = createdBlogs[0];

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NO_CONTENT);

      await blogsTestManager.deleteBlog(blogToDelete.id, HttpStatus.NOT_FOUND);
    });
  });
});
