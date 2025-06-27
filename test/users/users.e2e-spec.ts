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
import {
  DEFAULT_USERS_PAGE_SIZE,
  UsersTestManager,
} from './helpers/users.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import { UsersSortBy } from '../../src/features/user-accounts/api/input-dto/users-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';
import { DataSource } from 'typeorm';
import { BlogViewDto } from '../../src/features/blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { PostsCommonTestManager } from '../helpers/posts.common.test-manager';
import { CommentsCommonTestManager } from '../helpers/comments.common.test-manager';
import { PostLikesTestManager } from '../likes/helpers/post-likes.test-manager';
import { CommentLikesTestManager } from '../likes/helpers/comment-likes.test-manager';
import { BlogsCommonTestManager } from '../helpers/blogs.common.test-manager';
import { LikeStatus } from '../../src/features/blogger-platform/likes/dto/like-status';
import { CommentLikesTestRepo } from '../helpers/repositories/typeorm/comment-likes.test-repo';
import { PostLikesTestRepo } from '../helpers/repositories/typeorm/post-likes.test-repo';
import { UsersTestRepo } from '../helpers/repositories/typeorm/users.test-repo';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let authTestManager: AuthTestManager;
  let usersTestRepository: UsersTestRepo;
  let blogsCommonTestManager: BlogsCommonTestManager;
  let postsCommonTestManager: PostsCommonTestManager;
  let commentsCommonTestManager: CommentsCommonTestManager;
  let postLikesTestManager: PostLikesTestManager;
  let postLikesTestRepository: PostLikesTestRepo;
  let commentLikesTestManager: CommentLikesTestManager;
  let commentLikesTestRepository: CommentLikesTestRepo;

  beforeAll(async () => {
    app = await initApp();

    usersTestManager = new UsersTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app);
    authTestManager = new AuthTestManager(app);
    blogsCommonTestManager = new BlogsCommonTestManager(app);
    postsCommonTestManager = new PostsCommonTestManager(app);
    commentsCommonTestManager = new CommentsCommonTestManager(app);
    postLikesTestManager = new PostLikesTestManager(app);
    commentLikesTestManager = new CommentLikesTestManager(app);

    const dataSource = app.get(DataSource);
    usersTestRepository = new UsersTestRepo(dataSource);
    postLikesTestRepository = new PostLikesTestRepo(dataSource);
    commentLikesTestRepository = new CommentLikesTestRepo(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should create user', async () => {
      const inputDto: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };

      const response = await usersTestManager.createUser(
        inputDto,
        HttpStatus.CREATED,
      );
      const createdUser: UserViewDto = response.body;

      usersTestManager.checkCreatedUserViewFields(createdUser, inputDto);

      const dbCreatedUserConfirmationInfo =
        await usersTestRepository.findUserConfirmationInfo(createdUser.id);
      expect(dbCreatedUserConfirmationInfo.isConfirmed).toBe(false);

      const getUsersResponse = await usersTestManager.getUsers(HttpStatus.OK);
      const paginatedUsers: PaginatedViewDto<UserViewDto[]> =
        getUsersResponse.body;
      expect(paginatedUsers.items).toEqual([createdUser]);
    });

    describe('authentication', () => {
      const validInputDto: CreateUserInputDto = {
        login: 'user',
        email: 'user@example.com',
        password: 'qwerty',
      };

      beforeAll(async () => {
        await deleteAllData(app);
      });

      afterEach(async () => {
        await usersCommonTestManager.checkUsersCount(0);
      });

      it('should forbid creating user for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await usersTestManager.createUser(
            validInputDto,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });

    describe('validation', () => {
      let existingUser: UserViewDto;
      const validInput: CreateUserInputDto = {
        login: 'free',
        email: 'free@example.com',
        password: 'qwerty',
      };

      beforeAll(async () => {
        await deleteAllData(app);

        const createUserResponse = await usersTestManager.createUser(
          {
            login: 'taken',
            email: 'taken@example.com',
            password: 'qwerty',
          },
          HttpStatus.CREATED,
        );
        existingUser = createUserResponse.body;
      });

      afterEach(async () => {
        await usersCommonTestManager.checkUsersCount(1);
      });

      it('should return 400 if login is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: 4,
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: '',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: '  ',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          login: 'a'.repeat(11),
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          login: 'a'.repeat(2),
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data6);

        // does not match pattern
        const data7 = {
          login: '//     //',
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data7);

        // already taken
        const data8 = {
          login: existingUser.login,
          email: validInput.email,
          password: validInput.password,
        };
        invalidDataCases.push(data8);

        for (const data of invalidDataCases) {
          const response = await usersTestManager.createUser(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'login',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if email is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          login: validInput.login,
          password: validInput.password,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: validInput.login,
          email: 4,
          password: validInput.password,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: validInput.login,
          email: '',
          password: validInput.password,
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: validInput.login,
          email: '  ',
          password: validInput.password,
        };
        invalidDataCases.push(data4);

        // does not match pattern
        const data7 = {
          login: validInput.login,
          email: 'without domain',
          password: validInput.password,
        };
        invalidDataCases.push(data7);

        // already taken
        const data8 = {
          login: validInput.login,
          email: existingUser.email,
          password: validInput.password,
        };
        invalidDataCases.push(data8);

        for (const data of invalidDataCases) {
          const response = await usersTestManager.createUser(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'email',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return 400 if password is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          login: validInput.login,
          email: validInput.email,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          login: validInput.login,
          email: validInput.email,
          password: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          login: validInput.login,
          email: validInput.email,
          password: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          login: validInput.login,
          email: validInput.email,
          password: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          login: validInput.login,
          email: validInput.email,
          password: 'a'.repeat(21),
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          login: validInput.login,
          email: validInput.email,
          password: 'a'.repeat(5),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await usersTestManager.createUser(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'password',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          login: '',
          email: 'without domain',
        };

        const response = await usersTestManager.createUser(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'login',
              message: expect.any(String),
            },
            {
              field: 'email',
              message: expect.any(String),
            },
            {
              field: 'password',
              message: expect.any(String),
            },
          ]),
        });
        expect(response.body.errorsMessages).toHaveLength(3);
      });
    });
  });

  describe('delete user', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    describe('success', () => {
      let usersData: CreateUserInputDto[];
      let users: UserViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        usersData = [];
        for (let i = 1; i <= 2; i++) {
          const userData: CreateUserInputDto = {
            login: 'user' + i,
            email: 'user' + i + '@example.com',
            password: 'qwerty',
          };
          usersData.push(userData);
        }
        users = await usersCommonTestManager.createUsers(usersData);
      });

      it('should delete user', async () => {
        await usersTestManager.deleteUser(users[0].id, HttpStatus.NO_CONTENT);

        const getUsersResponse = await usersTestManager.getUsers(HttpStatus.OK);
        const paginatedUsers: PaginatedViewDto<UserViewDto[]> =
          getUsersResponse.body;
        const expectedItems = users.slice(1).toReversed();
        expect(paginatedUsers.items).toEqual(expectedItems);
      });

      it('should make all user auth tokens invalid after successful deletion', async () => {
        const accessTokens: string[] = [];
        const refreshTokens: string[] = [];

        const loginData: LoginInputDto = {
          loginOrEmail: usersData[1].login,
          password: usersData[1].password,
        };
        for (let i = 0; i < 2; i++) {
          const loginResponse = await authTestManager.login(
            loginData,
            HttpStatus.OK,
          );
          const accessToken = loginResponse.body.accessToken;
          const refreshToken =
            authTestManager.extractRefreshTokenFromResponse(loginResponse);

          accessTokens.push(accessToken);
          refreshTokens.push(refreshToken);
        }

        await usersTestManager.deleteUser(users[1].id, HttpStatus.NO_CONTENT);

        for (const accessToken of accessTokens) {
          await authTestManager.assertAccessTokenIsInvalid(accessToken);
        }

        for (const refreshToken of refreshTokens) {
          await authTestManager.assertRefreshTokenIsInvalid(refreshToken);
        }
      });
    });

    describe('not found', () => {
      let users: UserViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        users = await usersTestManager.createUsersWithGeneratedData(1);
      });

      it('should return 404 when trying to delete non-existing user', async () => {
        const nonExistingId = generateNonExistingId();
        await usersTestManager.deleteUser(nonExistingId, HttpStatus.NOT_FOUND);
      });

      it('should return 404 when user id is not a number', async () => {
        const invalidId = generateIdOfWrongType();
        await usersTestManager.deleteUser(invalidId, HttpStatus.NOT_FOUND);
      });

      it('should return 404 when trying to delete already deleted user', async () => {
        await usersTestManager.deleteUser(users[0].id, HttpStatus.NO_CONTENT);

        await usersTestManager.deleteUser(users[0].id, HttpStatus.NOT_FOUND);
      });
    });

    describe('authentication', () => {
      let userToDelete: UserViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        const users = await usersTestManager.createUsersWithGeneratedData(1);
        userToDelete = users[0];
      });

      it('should forbid deleting user for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await usersTestManager.deleteUser(
            userToDelete.id,
            HttpStatus.UNAUTHORIZED,
            invalidAuthValue,
          );
        }
      });
    });

    describe('relations deletion', () => {
      let blog: BlogViewDto;
      let userToDelete: UserViewDto;
      let userToDeleteAuthString: string;
      let otherUsersAuthStrings: string[];

      beforeEach(async () => {
        await deleteAllData(app);

        blog = await blogsCommonTestManager.createBlogWithGeneratedData();

        const createdUsers: UserViewDto[] = [];
        const createdUsersAuthStrings: string[] = [];
        for (let i = 1; i <= 3; i++) {
          const userData = usersTestManager.generateUserData(i);
          const createdUser =
            await usersTestManager.createUserSuccess(userData);
          const createdUserAuthString =
            await authTestManager.getValidAuthOfExistingUser(
              userData.login,
              userData.password,
            );

          createdUsers.push(createdUser);
          createdUsersAuthStrings.push(createdUserAuthString);
        }

        userToDelete = createdUsers[0];
        userToDeleteAuthString = createdUsersAuthStrings[0];
        otherUsersAuthStrings = createdUsersAuthStrings.slice(1);
      });

      it('should delete all related post likes', async () => {
        const posts =
          await postsCommonTestManager.createBlogPostsWithGeneratedData(
            2,
            blog.id,
          );

        await postLikesTestManager.makePostLikeOperationSuccess(
          posts[0].id,
          LikeStatus.Like,
          userToDeleteAuthString,
        );
        await postLikesTestManager.makePostLikeOperationSuccess(
          posts[1].id,
          LikeStatus.Dislike,
          userToDeleteAuthString,
        );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await postLikesTestRepository.assertPostsHaveNoLikes(
          posts.map((p) => p.id),
        );
      });

      it('should delete only related post likes', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        await postLikesTestManager.makePostLikeOperationSuccess(
          post.id,
          LikeStatus.Like,
          otherUsersAuthStrings[0],
        );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await postLikesTestRepository.checkPostLikesCount(post.id, 1);
      });

      it('should delete all related comment likes', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const comments =
          await commentsCommonTestManager.createCommentsWithGeneratedData(
            2,
            post.id,
            otherUsersAuthStrings[0],
          );

        await commentLikesTestManager.makeCommentLikeOperationSuccess(
          comments[0].id,
          LikeStatus.Like,
          userToDeleteAuthString,
        );
        await commentLikesTestManager.makeCommentLikeOperationSuccess(
          comments[1].id,
          LikeStatus.Dislike,
          userToDeleteAuthString,
        );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentLikesTestRepository.assertCommentsHaveNoLikes(
          comments.map((c) => c.id),
        );
      });

      it('should delete only related comment likes', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const comment =
          await commentsCommonTestManager.createCommentWithGeneratedData(
            post.id,
            otherUsersAuthStrings[0],
          );

        await commentLikesTestManager.makeCommentLikeOperationSuccess(
          comment.id,
          LikeStatus.Like,
          otherUsersAuthStrings[1],
        );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentLikesTestRepository.checkCommentLikesCount(comment.id, 1);
      });

      it('should delete all related comments', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const relatedComments =
          await commentsCommonTestManager.createCommentsWithGeneratedData(
            2,
            post.id,
            userToDeleteAuthString,
          );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentsCommonTestManager.assertCommentsAreDeleted(
          relatedComments.map((c) => c.id),
        );
      });

      it('should delete only related comments', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const anotherUserComment =
          await commentsCommonTestManager.createCommentWithGeneratedData(
            post.id,
            otherUsersAuthStrings[0],
          );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentsCommonTestManager.getCommentSuccess(
          anotherUserComment.id,
        );
      });

      it('should delete all likes of related comments', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const relatedComments =
          await commentsCommonTestManager.createCommentsWithGeneratedData(
            2,
            post.id,
            userToDeleteAuthString,
          );

        for (const relatedComment of relatedComments) {
          await commentLikesTestManager.makeCommentLikeOperationSuccess(
            relatedComment.id,
            LikeStatus.Like,
            otherUsersAuthStrings[0],
          );
          await commentLikesTestManager.makeCommentLikeOperationSuccess(
            relatedComment.id,
            LikeStatus.Dislike,
            otherUsersAuthStrings[1],
          );
        }

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentLikesTestRepository.assertCommentsHaveNoLikes(
          relatedComments.map((c) => c.id),
        );
      });

      it('should delete only likes of related comments', async () => {
        const post =
          await postsCommonTestManager.createBlogPostWithGeneratedData(blog.id);

        const anotherUserComment =
          await commentsCommonTestManager.createCommentWithGeneratedData(
            post.id,
            otherUsersAuthStrings[0],
          );

        await commentLikesTestManager.makeCommentLikeOperationSuccess(
          anotherUserComment.id,
          LikeStatus.Like,
          otherUsersAuthStrings[1],
        );

        await usersTestManager.deleteUserSuccess(userToDelete.id);

        await commentLikesTestRepository.checkCommentLikesCount(
          anotherUserComment.id,
          1,
        );
      });
    });
  });

  describe('get users', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return empty array', async () => {
      const response = await usersTestManager.getUsers(HttpStatus.OK);

      const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    it('should return users with default pagination and sorting', async () => {
      const users = await usersTestManager.createUsersWithGeneratedData(2);

      const response = await usersTestManager.getUsers(HttpStatus.OK);
      const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;

      expect(responseBody.items).toEqual(users.toReversed());
      expect(responseBody.totalCount).toBe(users.length);
      expect(responseBody.pagesCount).toBe(1);
      expect(responseBody.page).toBe(1);
      expect(responseBody.pageSize).toBe(DEFAULT_USERS_PAGE_SIZE);
    });

    it(`shouldn't return deleted users`, async () => {
      await deleteAllData(app);

      const users = await usersTestManager.createUsersWithGeneratedData(1);
      await usersTestManager.deleteUser(users[0].id, HttpStatus.NO_CONTENT);

      const response = await usersTestManager.getUsers(HttpStatus.OK);
      const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;
      expect(responseBody.items).toEqual([]);
    });

    describe('authentication', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      it('should forbid creating user for non-admin users', async () => {
        for (const invalidAuthValue of invalidBasicAuthTestValues) {
          await usersTestManager.getUsers(
            HttpStatus.UNAUTHORIZED,
            {},
            invalidAuthValue,
          );
        }
      });
    });

    describe('pagination', () => {
      let users: UserViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        users = await usersTestManager.createUsersWithGeneratedData(12);
      });

      it('should return specified page of users array', async () => {
        const pageNumber = 2;
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;

        const expectedPageSize = DEFAULT_USERS_PAGE_SIZE;
        const expectedItems = getPageOfArray(
          users.toReversed(),
          pageNumber,
          expectedPageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(expectedPageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return specified number of users', async () => {
        const pageSize = 2;
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          pageSize,
        });
        const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;

        const expectedPageNumber = 1;
        const expectedItems = getPageOfArray(
          users.toReversed(),
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
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          pageNumber,
          pageSize,
        });
        const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;

        const expectedItems = getPageOfArray(
          users.toReversed(),
          pageNumber,
          pageSize,
        );

        expect(responseBody.page).toBe(pageNumber);
        expect(responseBody.pageSize).toBe(pageSize);
        expect(responseBody.items).toEqual(expectedItems);
      });

      it('should return empty array if page number exceeds total number of pages', async () => {
        const pageNumber = 20;
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          pageNumber,
        });
        const responseBody: PaginatedViewDto<UserViewDto[]> = response.body;
        expect(responseBody.items).toEqual([]);
      });
    });

    describe('sorting', () => {
      let users: UserViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const password = 'qwerty';
        const usersData: CreateUserInputDto[] = [
          {
            login: 'userA',
            email: 'user1@example.com',
            password,
          },
          {
            login: 'userB',
            email: 'user3@example.com',
            password,
          },
          {
            login: 'userD',
            email: 'user2@example.com',
            password,
          },
          {
            login: 'userC',
            email: 'user4@example.com',
            password,
          },
        ];
        users = await usersTestManager.createUsers(usersData);
      });

      it('should return users sorted by creation date in desc order', async () => {
        const expectedItems = sortArrByDateStrField(users, 'createdAt', 'desc');

        const response1 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.CreatedAt,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortDirection: SortDirection.Desc,
        });
        expect(response2.body.items).toEqual(expectedItems);

        const response3 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.CreatedAt,
        });
        expect(response3.body.items).toEqual(expectedItems);

        const response4 = await usersTestManager.getUsers(HttpStatus.OK);
        expect(response4.body.items).toEqual(expectedItems);
      });

      it('should return users sorted by creation date in asc order', async () => {
        const expectedItems = sortArrByDateStrField(users, 'createdAt', 'asc');

        const response1 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.CreatedAt,
          sortDirection: SortDirection.Asc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortDirection: SortDirection.Asc,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return users sorted by login in desc order', async () => {
        const expectedItems = sortArrByStrField(users, 'login', 'desc');

        const response1 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Login,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Login,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return users sorted by login in asc order', async () => {
        const expectedItems = sortArrByStrField(users, 'login', 'asc');

        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Login,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return users sorted by email in desc order', async () => {
        const expectedItems = sortArrByStrField(users, 'email', 'desc');

        const response1 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Email,
          sortDirection: SortDirection.Desc,
        });
        expect(response1.body.items).toEqual(expectedItems);

        const response2 = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Email,
        });
        expect(response2.body.items).toEqual(expectedItems);
      });

      it('should return users sorted by email in asc order', async () => {
        const expectedItems = sortArrByStrField(users, 'email', 'asc');

        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          sortBy: UsersSortBy.Email,
          sortDirection: SortDirection.Asc,
        });
        expect(response.body.items).toEqual(expectedItems);
      });
    });

    describe('filtering', () => {
      let users: UserViewDto[];

      beforeAll(async () => {
        await deleteAllData(app);

        const password = 'qwerty';
        const usersData: CreateUserInputDto[] = [
          {
            login: 'superHeal',
            email: 'user1@example.com',
            password,
          },
          {
            login: 'maxSuper',
            email: 'user3@example.com',
            password,
          },
          {
            login: 'witcher',
            email: 'superProfessional@example.com',
            password,
          },
          {
            login: 'user4',
            email: 'user4@example.com',
            password,
          },
        ];
        users = await usersTestManager.createUsers(usersData);
      });

      it('should return users with login containing search login term', async () => {
        const searchLoginTerm = 'super';
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          searchLoginTerm,
        });

        const expectedItems = users
          .filter((u) => caseInsensitiveSearch(u.login, searchLoginTerm))
          .toReversed();
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return users with email containing search email term', async () => {
        const searchEmailTerm = 'super';
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          searchEmailTerm,
        });

        const expectedItems = users
          .filter((u) => caseInsensitiveSearch(u.email, searchEmailTerm))
          .toReversed();
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return users with login containing search login term or email containing search email term', async () => {
        const searchLoginTerm = 'super';
        const searchEmailTerm = 'super';
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          searchLoginTerm,
          searchEmailTerm,
        });

        const expectedItems = users
          .filter(
            (u) =>
              caseInsensitiveSearch(u.login, searchLoginTerm) ||
              caseInsensitiveSearch(u.email, searchEmailTerm),
          )
          .toReversed();
        expect(response.body.items).toEqual(expectedItems);
      });

      it('should return empty array if no user matches search login term or search email term', async () => {
        const searchLoginTerm = 'non-existing';
        const searchEmailTerm = 'non-existing';
        const response = await usersTestManager.getUsers(HttpStatus.OK, {
          searchLoginTerm,
          searchEmailTerm,
        });
        expect(response.body.items).toEqual([]);
      });
    });
  });
});
