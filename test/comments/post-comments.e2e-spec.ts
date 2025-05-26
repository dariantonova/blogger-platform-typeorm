import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  CommentsTestManager,
  DEFAULT_COMMENTS_PAGE_SIZE,
} from './helpers/comments.test-manager';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import {
  delay,
  deleteAllData,
  generateNonExistingId,
  getPageOfArray,
  initApp,
  sortArrByDateStrField,
} from '../helpers/helper';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../src/features/blogger-platform/comments/api/view-dto/comments.view-dto';
import { PostViewDto } from '../../src/features/blogger-platform/posts/api/view-dto/posts.view-dto';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { CreatePostCommentInputDto } from '../../src/features/blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { TestingModuleBuilder } from '@nestjs/testing';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';
import { CoreConfig } from '../../src/core/core.config';
import { JwtService } from '@nestjs/jwt';
import { PostsSortBy } from '../../src/features/blogger-platform/posts/api/input-dto/posts-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { millisecondsToSeconds } from 'date-fns';

describe('post comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;
  const accessTokenExpInMs = 2000;

  beforeAll(async () => {
    const customBuilderSetup = (builder: TestingModuleBuilder) => {
      builder.overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
        inject: [CoreConfig],
        factory: (coreConfig: CoreConfig) => {
          return new JwtService({
            secret: coreConfig.accessJwtSecret,
            signOptions: {
              expiresIn: millisecondsToSeconds(accessTokenExpInMs) + 's',
            },
          });
        },
      });
    };
    app = await initApp({ customBuilderSetup });

    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    authTestManager = new AuthTestManager(app);

    const UserModel = app.get<UserModelType>(getModelToken('User'));
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);

    commentsTestManager = new CommentsTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('get post comments', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('common', () => {
      let blog: BlogViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();

        validAuth = await authTestManager.getValidAuth();
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

      it('should return post comments with default pagination and sorting', async () => {
        const post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );
        const postComments =
          await commentsTestManager.createCommentsWithGeneratedData(
            2,
            post.id,
            validAuth,
          );

        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
        );
        const responseBody = response.body as PaginatedViewDto<
          CommentViewDto[]
        >;

        expect(responseBody.items).toEqual(postComments.toReversed());
        expect(responseBody.totalCount).toBe(postComments.length);
        expect(responseBody.pagesCount).toBe(1);
        expect(responseBody.page).toBe(1);
        expect(responseBody.pageSize).toBe(DEFAULT_COMMENTS_PAGE_SIZE);
      });

      it(`shouldn't return comments of other posts`, async () => {
        const posts = await postsCommonTestManager.createPostsWithGeneratedData(
          2,
          blog.id,
        );
        const post1Comments =
          await commentsTestManager.createCommentsWithGeneratedData(
            2,
            posts[0].id,
            validAuth,
          );
        await commentsTestManager.createCommentsWithGeneratedData(
          2,
          posts[1].id,
          validAuth,
        );

        const response = await commentsTestManager.getPostComments(
          posts[0].id,
          HttpStatus.OK,
        );
        const responseBody = response.body as PaginatedViewDto<
          CommentViewDto[]
        >;
        expect(responseBody.items).toEqual(post1Comments.toReversed());
      });

      it(`shouldn't return deleted comments`, async () => {
        const post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );
        const postComments =
          await commentsTestManager.createCommentsWithGeneratedData(
            1,
            post.id,
            validAuth,
          );
        await commentsTestManager.deleteComment(
          postComments[0].id,
          validAuth,
          HttpStatus.NO_CONTENT,
        );

        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
        );
        const responseBody = response.body as PaginatedViewDto<
          CommentViewDto[]
        >;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('not found', () => {
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

      it('should return 404 when post id is not valid ObjectId', async () => {
        const invalidId = 'not ObjectId';
        await commentsTestManager.getPostComments(
          invalidId,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when trying to get comments of deleted post', async () => {
        const postToDelete =
          await postsCommonTestManager.createPostWithGeneratedData(blog.id);
        await postsCommonTestManager.deletePost(postToDelete.id);

        await commentsTestManager.getPostComments(
          postToDelete.id,
          HttpStatus.NOT_FOUND,
        );
      });
    });

    describe('pagination', () => {
      let post: PostViewDto;
      let postComments: CommentViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        const validAuth = await authTestManager.getValidAuth();

        postComments =
          await commentsTestManager.createCommentsWithGeneratedData(
            12,
            post.id,
            validAuth,
          );
      });

      it('should return specified page of comments array', async () => {
        const pageNumber = 2;
        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            pageNumber,
          },
        );
        const responseBody: PaginatedViewDto<CommentViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_COMMENTS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          postComments.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of comments', async () => {
        const pageSize = 2;
        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            pageSize,
          },
        );
        const responseBody: PaginatedViewDto<CommentViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          postComments.toReversed(),
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
        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            pageNumber,
            pageSize,
          },
        );
        const responseBody: PaginatedViewDto<CommentViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          postComments.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            pageNumber,
          },
        );
        const responseBody: PaginatedViewDto<CommentViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let post: PostViewDto;
      let comments: CommentViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        const validAuth = await authTestManager.getValidAuth();

        comments = await commentsTestManager.createCommentsWithGeneratedData(
          4,
          post.id,
          validAuth,
        );
      });

      it('should return comments sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(
          comments,
          'createdAt',
          'desc',
        );

        const response1 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortDirection: SortDirection.Desc,
          },
        );
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
          },
        );
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
        );
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return comments sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(
          comments,
          'createdAt',
          'asc',
        );

        const response1 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortBy: PostsSortBy.CreatedAt,
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortDirection: SortDirection.Asc,
          },
        );
        expect(response2.body.items).toEqual(expectedItems);
      });

      it(`should return comments in order of creation if sort field doesn't exist`, async () => {
        const expectedItems = comments;

        const response = await commentsTestManager.getPostComments(
          post.id,
          HttpStatus.OK,
          {
            sortBy: 'nonExisting',
          },
        );
        expect(response.body.items).toEqual(expectedItems);
      });
    });
  });

  describe('create post comment', () => {
    const validInputDto: CreatePostCommentInputDto = {
      content: 'valid'.repeat(10),
    };

    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('success', () => {
      let post: PostViewDto;
      let userData: CreateUserDto;
      let user: UserViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        user = await usersCommonTestManager.createUser(userData);
        const userAccessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        validAuth = 'Bearer ' + userAccessToken;
      });

      it('should successfully create post comment', async () => {
        const inputDto: CreatePostCommentInputDto = {
          content: 'success'.repeat(10),
        };

        const response = await commentsTestManager.createPostComment(
          post.id,
          inputDto,
          validAuth,
          HttpStatus.CREATED,
        );

        const createdComment = response.body as CommentViewDto;
        expect(createdComment.id).toEqual(expect.any(String));
        expect(createdComment.content).toBe(inputDto.content);
        expect(createdComment.commentatorInfo.userId).toBe(user.id);
        expect(createdComment.commentatorInfo.userLogin).toBe(userData.login);
        expect(createdComment.createdAt).toEqual(expect.any(String));
        expect(Date.parse(createdComment.createdAt)).not.toBeNaN();
        expect(createdComment.likesInfo).toEqual({
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        });

        const getPostCommentsResponse =
          await commentsTestManager.getPostComments(post.id, HttpStatus.OK);
        const responseBody = getPostCommentsResponse.body as PaginatedViewDto<
          CommentViewDto[]
        >;
        expect(responseBody.items).toEqual([createdComment]);
      });
    });

    describe('not found', () => {
      let blog: BlogViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();

        validAuth = await authTestManager.getValidAuth();
      });

      it('should return 404 when trying to create comment of non-existing post', async () => {
        const nonExistingId = generateNonExistingId();
        await commentsTestManager.createPostComment(
          nonExistingId,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when post id is not valid ObjectId', async () => {
        const invalidId = 'not ObjectId';
        await commentsTestManager.createPostComment(
          invalidId,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });

      it('should return 404 when trying to create comment of deleted post', async () => {
        const postToDelete =
          await postsCommonTestManager.createPostWithGeneratedData(blog.id);
        await postsCommonTestManager.deletePost(postToDelete.id);

        await commentsTestManager.createPostComment(
          postToDelete.id,
          validInputDto,
          validAuth,
          HttpStatus.NOT_FOUND,
        );
      });
    });

    describe('validation', () => {
      let post: PostViewDto;
      let validAuth: string;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        validAuth = await authTestManager.getValidAuth();
      });

      afterEach(async () => {
        await commentsTestManager.checkPostCommentsCount(post.id, 0);
      });

      it('should return 400 if content is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {};
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          content: 4,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          content: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          content: '  ',
        };
        invalidDataCases.push(data4);

        // too short
        const data5 = {
          content: 'a'.repeat(19),
        };
        invalidDataCases.push(data5);

        // too long
        const data6 = {
          content: 'a'.repeat(301),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await commentsTestManager.createPostComment(
            post.id,
            data,
            validAuth,
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
    });

    describe('authentication', () => {
      let post: PostViewDto;
      let userData: CreateUserDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const blog = await blogsCommonTestManager.createBlogWithGeneratedData();
        post = await postsCommonTestManager.createPostWithGeneratedData(
          blog.id,
        );

        userData = {
          login: 'user1',
          email: 'user1@example.com',
          password: 'qwerty',
        };
        await usersCommonTestManager.createUser(userData);
      });

      afterEach(async () => {
        await commentsTestManager.checkPostCommentsCount(post.id, 0);
      });

      // missing
      it('should return 401 if authorization is missing', async () => {
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          '',
          HttpStatus.UNAUTHORIZED,
        );
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // wrong format auth header
      it('should return 401 if auth header format is invalid', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // expired token
      it('should return 401 if access token is expired', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );

        await delay(accessTokenExpInMs);

        await commentsTestManager.createPostComment(
          post.id,
          validInputDto,
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });
  });
});
