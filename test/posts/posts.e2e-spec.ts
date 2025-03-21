import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  deleteAllData,
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
import { CreatePostInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post.input-dto';
import { CreateBlogInputDto } from '../../src/features/blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { UpdatePostInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/update-post.input-dto';

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

  describe('get post', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should return post', async () => {
      const posts = await postsTestManager.createPostsWithGeneratedData(
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

    it('should return 404 when trying to get deleted post', async () => {
      const createdPosts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blog.id,
      );
      const postToDelete = createdPosts[0];

      await postsTestManager.deletePost(postToDelete.id, HttpStatus.NO_CONTENT);

      await postsTestManager.getPost(postToDelete.id, HttpStatus.NOT_FOUND);
    });
  });

  describe('create post', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should create post', async () => {
      const inputDto: CreatePostInputDto = {
        title: 'post',
        shortDescription: 'short description',
        content: 'content',
        blogId: blog.id,
      };

      const response = await postsTestManager.createPost(
        inputDto,
        HttpStatus.CREATED,
      );
      const createdPost: PostViewDto = response.body;

      expect(createdPost.id).toEqual(expect.any(String));
      expect(createdPost.title).toBe(inputDto.title);
      expect(createdPost.shortDescription).toBe(inputDto.shortDescription);
      expect(createdPost.content).toBe(inputDto.content);
      expect(createdPost.blogId).toBe(inputDto.blogId);
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
  });

  describe('update post', () => {
    let blogs: BlogViewDto[];
    let validInputDto: UpdatePostInputDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blogs = await blogsCommonTestManager.createBlogsWithGeneratedData(2);

      validInputDto = {
        title: 'post',
        shortDescription: 'short description',
        content: 'content',
        blogId: blogs[0].id,
      };
    });

    it('should update post', async () => {
      const blogBeforeUpdate = blogs[0];
      const blogAfterUpdate = blogs[1];

      const createInputDto: CreatePostInputDto = {
        title: 'post before update',
        shortDescription: 'short description before update',
        content: 'content before update',
        blogId: blogBeforeUpdate.id,
      };

      const createResponse = await postsTestManager.createPost(
        createInputDto,
        HttpStatus.CREATED,
      );
      const createdPost: PostViewDto = createResponse.body;

      const updateInputDto: UpdatePostInputDto = {
        title: 'post after update',
        shortDescription: 'short description after update',
        content: 'content after update',
        blogId: blogAfterUpdate.id,
      };
      await postsTestManager.updatePost(
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
      expect(updatedPost.blogId).toBe(updateInputDto.blogId);
      expect(updatedPost.blogName).toBe(blogAfterUpdate.name);
      expect(updatedPost.id).toBe(createdPost.id);
      expect(updatedPost.createdAt).toBe(createdPost.createdAt);
      expect(updatedPost.extendedLikesInfo).toEqual(
        createdPost.extendedLikesInfo,
      );
    });

    it('should return 404 when trying to update non-existing post', async () => {
      const nonExistingPost = generateNonExistingId();

      await postsTestManager.updatePost(
        nonExistingPost,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 404 when trying to update deleted post', async () => {
      const createdPosts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blogs[0].id,
      );
      const postToDelete = createdPosts[0];

      await postsTestManager.deletePost(postToDelete.id, HttpStatus.NO_CONTENT);

      await postsTestManager.updatePost(
        postToDelete.id,
        validInputDto,
        HttpStatus.NOT_FOUND,
      );
    });
  });

  describe('delete post', () => {
    let blog: BlogViewDto;

    beforeAll(async () => {
      await deleteAllData(app);

      blog = await blogsCommonTestManager.createBlogWithGeneratedData();
    });

    it('should delete post', async () => {
      const createdPosts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blog.id,
      );
      const postToDelete = createdPosts[0];

      await postsTestManager.deletePost(postToDelete.id, HttpStatus.NO_CONTENT);

      await postsTestManager.getPost(postToDelete.id, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to delete non-existing post', async () => {
      const nonExistingPost = generateNonExistingId();
      await postsTestManager.deletePost(nonExistingPost, HttpStatus.NOT_FOUND);
    });

    it('should return 404 when trying to delete already deleted post', async () => {
      const createdPosts = await postsTestManager.createPostsWithGeneratedData(
        1,
        blog.id,
      );
      const postToDelete = createdPosts[0];

      await postsTestManager.deletePost(postToDelete.id, HttpStatus.NO_CONTENT);

      await postsTestManager.deletePost(postToDelete.id, HttpStatus.NOT_FOUND);
    });

    it('should delete all blogs posts when blog is deleted', async () => {
      await deleteAllData(app);

      const blogs =
        await blogsCommonTestManager.createBlogsWithGeneratedData(2);

      const blog1Posts = await postsTestManager.createPostsWithGeneratedData(
        2,
        blogs[0].id,
      );
      await postsTestManager.createPostsWithGeneratedData(2, blogs[1].id);

      await blogsCommonTestManager.deleteBlog(blogs[1].id);

      const getPostsResponse = await postsTestManager.getPosts(HttpStatus.OK);
      const responseBody: PaginatedViewDto<PostViewDto[]> =
        getPostsResponse.body;
      expect(responseBody.items).toEqual(blog1Posts.toReversed());
    });
  });
});
