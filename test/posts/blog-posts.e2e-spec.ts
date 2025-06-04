import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  DEFAULT_POSTS_PAGE_SIZE,
  PostsTestManager,
} from './helpers/posts.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import {
  deleteAllData,
  generateIdOfWrongType,
  generateNonExistingId,
  getPageOfArray,
  initApp,
  invalidBasicAuthTestValues,
  sortArrByDateStrField,
  sortArrByStrField,
} from '../helpers/helper';
import { CreateBlogPostInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { UpdateBlogPostInputDtoSql } from '../../src/features/blogger-platform-sql/blogs/api/input-dto/update-blog-post.input-dto.sql';

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

    // it('should return 404 when blog id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await postsTestManager.createBlogPost(
    //     invalidId,
    //     validInputDto,
    //     HttpStatus.NOT_FOUND,
    //   );
    // });

    it('should return 404 when blog id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await postsTestManager.createBlogPost(
        invalidId,
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

    describe('validation', () => {
      let blogId: string;
      const validInput: CreateBlogPostInputDto = {
        title: 'post',
        shortDescription: 'short description',
        content: 'content',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        blogId = blog.id;
      });

      afterEach(async () => {
        await postsTestManager.checkBlogPostsCount(blogId, 0);
      });

      it('should return 400 if title is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: 4,
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: '',
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: '  ',
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: 'a'.repeat(31),
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.createBlogPost(
            blogId,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'title',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if short description is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          title: validInput.title,
          content: validInput.content,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: validInput.title,
          shortDescription: 4,
          content: validInput.content,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: validInput.title,
          shortDescription: '',
          content: validInput.content,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: validInput.title,
          shortDescription: '  ',
          content: validInput.content,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: validInput.title,
          shortDescription: 'a'.repeat(101),
          content: validInput.content,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.createBlogPost(
            blogId,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'shortDescription',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if content is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: 'a'.repeat(1001),
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.createBlogPost(
            blogId,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'content',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          title: '',
          shortDescription: 'a'.repeat(101),
        };

        const response = await postsTestManager.createBlogPost(
          blogId,
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'title',
              message: expect.any(String),
            },
            {
              field: 'shortDescription',
              message: expect.any(String),
            },
            {
              field: 'content',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });

    describe('authentication', () => {
      let blogId: string;
      const validInput: CreateBlogPostInputDto = {
        title: 'post',
        shortDescription: 'short description',
        content: 'content',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        blogId = blog.id;
      });

      afterEach(async () => {
        await postsTestManager.checkBlogPostsCount(blogId, 0);
      });

      it('should forbid creating blog post for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await postsTestManager.createBlogPost(
            blogId,
            validInput,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
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

    // it('should return 404 when blog id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await postsTestManager.getBlogPosts(invalidId, HttpStatus.NOT_FOUND);
    // });

    it('should return 404 when blog id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await postsTestManager.getBlogPosts(invalidId, HttpStatus.NOT_FOUND);
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
      const blogPosts = await postsTestManager.createBlogPostsWithGeneratedData(
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
      const blog1Posts =
        await postsTestManager.createBlogPostsWithGeneratedData(2, blogs[0].id);
      await postsTestManager.createBlogPostsWithGeneratedData(2, blogs[1].id);

      const response = await postsTestManager.getBlogPosts(
        blogs[0].id,
        HttpStatus.OK,
      );
      const responseBody: PaginatedViewDto<PostViewDto[]> = response.body;
      expect(responseBody.items).toEqual(blog1Posts.toReversed());
    });

    it(`shouldn't return deleted posts`, async () => {
      const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
      const blogPosts = await postsTestManager.createBlogPostsWithGeneratedData(
        1,
        blog.id,
      );
      await postsTestManager.deleteBlogPost(
        blog.id,
        blogPosts[0].id,
        HttpStatus.NO_CONTENT,
      );

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
        blogPosts = await postsTestManager.createBlogPostsWithGeneratedData(
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
        posts = await postsTestManager.createBlogPosts(blog.id, postsData);
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

      it(`should return posts in desc order of creation if sort field doesn't exist`, async () => {
        const expectedItems = posts.toReversed();

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

  describe('update blog post', () => {
    let blog: BlogViewDto;
    let validInputDto: UpdateBlogPostInputDtoSql;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();

      validInputDto = {
        title: 'post',
        shortDescription: 'short description',
        content: 'content',
      };
    });

    it('should update blog post', async () => {
      const createInputDto: CreateBlogPostInputDto = {
        title: 'post before update',
        shortDescription: 'short description before update',
        content: 'content before update',
      };

      const createResponse = await postsTestManager.createBlogPost(
        blog.id,
        createInputDto,
        HttpStatus.CREATED,
      );
      const createdPost: PostViewDto = createResponse.body;

      const updateInputDto: UpdateBlogPostInputDtoSql = {
        title: 'post after update',
        shortDescription: 'short description after update',
        content: 'content after update',
      };
      await postsTestManager.updateBlogPost(
        blog.id,
        createdPost.id,
        updateInputDto,
        HttpStatus.NO_CONTENT,
      );

      const getPostResponse = await postsTestManager.getPost(
        createdPost.id,
        HttpStatus.OK,
      );
      const updatedPost: PostViewDto = getPostResponse.body;

      expect(updatedPost.title).toBe(updateInputDto.title);
      expect(updatedPost.shortDescription).toBe(
        updateInputDto.shortDescription,
      );
      expect(updatedPost.content).toBe(updateInputDto.content);
      expect(updatedPost.blogId).toBe(createdPost.blogId);
      expect(updatedPost.blogName).toBe(createdPost.blogName);
      expect(updatedPost.id).toBe(createdPost.id);
      expect(updatedPost.createdAt).toBe(createdPost.createdAt);
      expect(updatedPost.extendedLikesInfo).toEqual(
        createdPost.extendedLikesInfo,
      );
    });

    it('should return 404 when trying to update non-existing post', async () => {
      const nonExistingPostId = generateNonExistingId();

      await postsTestManager.updateBlogPost(
        blog.id,
        nonExistingPostId,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update post of non-existing blog', async () => {
      const createdPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(1, blog.id);
      const postToUpdate = createdPosts[0];

      const nonExistingBlogId = generateNonExistingId();

      await postsTestManager.updateBlogPost(
        nonExistingBlogId,
        postToUpdate.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update post of another blog', async () => {
      const anotherBlog =
        await blogsCommonTestManager.createBlogWithGeneratedData();
      const anotherBlogPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(
          1,
          anotherBlog.id,
        );
      const anotherBlogPost = anotherBlogPosts[0];

      await postsTestManager.updateBlogPost(
        blog.id,
        anotherBlogPost.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    // it('should return 404 when post id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //
    //   await postsTestManager.updatePost(
    //     invalidId,
    //     validInputDto,
    //     HttpStatus.NOT_FOUND,
    //   );
    // });

    it('should return 404 when post id is not a number', async () => {
      const invalidId = generateIdOfWrongType();

      await postsTestManager.updateBlogPost(
        blog.id,
        invalidId,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update deleted post', async () => {
      const createdPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(1, blog.id);
      const postToDelete = createdPosts[0];

      await postsTestManager.deleteBlogPost(
        blog.id,
        postToDelete.id,
        HttpStatus.NO_CONTENT,
      );

      await postsTestManager.updateBlogPost(
        blog.id,
        postToDelete.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    describe('validation', () => {
      let blog: BlogViewDto;
      let postToUpdate: PostViewDto;
      let validInput: UpdateBlogPostInputDtoSql;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const posts = await postsTestManager.createBlogPostsWithGeneratedData(
          1,
          blog.id,
        );
        postToUpdate = posts[0];

        validInput = {
          title: 'post',
          shortDescription: 'short description',
          content: 'content',
        };
      });

      it('should return 400 if title is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: 4,
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: '',
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: '  ',
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: 'a'.repeat(31),
          shortDescription: validInput.shortDescription,
          content: validInput.content,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.updateBlogPost(
            blog.id,
            postToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'title',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if short description is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          title: validInput.title,
          content: validInput.content,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: validInput.title,
          shortDescription: 4,
          content: validInput.content,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: validInput.title,
          shortDescription: '',
          content: validInput.content,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: validInput.title,
          shortDescription: '  ',
          content: validInput.content,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: validInput.title,
          shortDescription: 'a'.repeat(101),
          content: validInput.content,
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.updateBlogPost(
            blog.id,
            postToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'shortDescription',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if content is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          title: validInput.title,
          shortDescription: validInput.shortDescription,
          content: 'a'.repeat(1001),
        };
        invalidDataCases.push(data5);

        for (const data of invalidDataCases) {
          const response = await postsTestManager.updateBlogPost(
            blog.id,
            postToUpdate.id,
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'content',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          title: '',
          shortDescription: 'a'.repeat(101),
        };

        const response = await postsTestManager.updateBlogPost(
          blog.id,
          postToUpdate.id,
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'title',
              message: expect.any(String),
            },
            {
              field: 'shortDescription',
              message: expect.any(String),
            },
            {
              field: 'content',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });

    describe('authentication', () => {
      let blog: BlogViewDto;
      let postToUpdate: PostViewDto;
      let validInput: UpdateBlogPostInputDtoSql;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const posts = await postsTestManager.createBlogPostsWithGeneratedData(
          1,
          blog.id,
        );
        postToUpdate = posts[0];

        validInput = {
          title: 'post',
          shortDescription: 'short description',
          content: 'content',
        };
      });

      it('should forbid updating blog post for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await postsTestManager.updateBlogPost(
            blog.id,
            postToUpdate.id,
            validInput,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });
  });

  describe('delete blog post', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should delete blog post', async () => {
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

    it('should return 404 when trying to delete non-existing post', async () => {
      const nonExistingPost = generateNonExistingId();
      await postsTestManager.deleteBlogPost(
        blog.id,
        nonExistingPost,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to delete post of non-existing blog', async () => {
      const createdPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(1, blog.id);
      const postToDelete = createdPosts[0];

      const nonExistingBlogId = generateNonExistingId();

      await postsTestManager.deleteBlogPost(
        nonExistingBlogId,
        postToDelete.id,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to delete post of another blog', async () => {
      const anotherBlog =
        await blogsCommonTestManager.createBlogWithGeneratedData();
      const anotherBlogPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(
          1,
          anotherBlog.id,
        );
      const anotherBlogPost = anotherBlogPosts[0];

      await postsTestManager.deleteBlogPost(
        blog.id,
        anotherBlogPost.id,
        HttpStatus.NOT_FOUND,
      );
    });

    // it('should return 404 when post id is not valid ObjectId', async () => {
    //   const invalidId = 'not ObjectId';
    //   await postsTestManager.deletePost(invalidId, HttpStatus.NOT_FOUND);
    // });

    it('should return 404 when post id is not a number', async () => {
      const invalidId = generateIdOfWrongType();
      await postsTestManager.deleteBlogPost(
        blog.id,
        invalidId,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to delete already deleted post', async () => {
      const createdPosts =
        await postsTestManager.createBlogPostsWithGeneratedData(1, blog.id);
      const postToDelete = createdPosts[0];

      await postsTestManager.deleteBlogPost(
        blog.id,
        postToDelete.id,
        HttpStatus.NO_CONTENT,
      );

      await postsTestManager.deleteBlogPost(
        blog.id,
        postToDelete.id,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should delete all blogs posts when blog is deleted', async () => {
      await deleteAllData(app);

      const blogs =
        await blogsCommonTestManager.createBlogsWithGeneratedData(2);

      const blog1Posts =
        await postsTestManager.createBlogPostsWithGeneratedData(2, blogs[0].id);
      await postsTestManager.createBlogPostsWithGeneratedData(2, blogs[1].id);

      await blogsCommonTestManager.deleteBlog(blogs[1].id);

      const getPostsResponse = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> =
        getPostsResponse.body;
      expect(responseBody.items).toEqual(blog1Posts.toReversed());
    });

    describe('authentication', () => {
      let blog: BlogViewDto;
      let postToDelete: PostViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        const posts = await postsTestManager.createBlogPostsWithGeneratedData(
          1,
          blog.id,
        );
        postToDelete = posts[0];
      });

      afterEach(async () => {
        await postsTestManager.checkPostsCount(1);
      });

      it('should forbid deleting blog post for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await postsTestManager.deleteBlogPost(
            blog.id,
            postToDelete.id,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });
  });
});
