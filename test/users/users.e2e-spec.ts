import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  caseInsensitiveSearch,
  deleteAllData,
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
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { AuthTestManager } from '../auth/helpers/auth.test-manager';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';
import { UsersTestRepositorySql } from '../helpers/users.test-repository.sql';
import { DataSource } from 'typeorm';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let UserModel: UserModelType;
  let authTestManager: AuthTestManager;
  let usersTestRepository: UsersTestRepositorySql;

  beforeAll(async () => {
    app = await initApp();

    UserModel = app.get<UserModelType>(getModelToken('User'));

    usersTestManager = new UsersTestManager(app, UserModel);
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
    authTestManager = new AuthTestManager(app);

    const dataSource = app.get(DataSource);
    usersTestRepository = new UsersTestRepositorySql(dataSource);
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

      // const dbCreatedUser = await usersTestManager.findUserById(createdUser.id);
      // expect(dbCreatedUser.confirmationInfo.isConfirmed).toBe(false);
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
        // const nonExistingId = generateNonExistingId();
        const nonExistingId = '-1';
        await usersTestManager.deleteUser(nonExistingId, HttpStatus.NOT_FOUND);
      });

      // it('should return 404 when user id is not valid ObjectId', async () => {
      //   const invalidId = 'not ObjectId';
      //   await usersTestManager.deleteUser(invalidId, HttpStatus.NOT_FOUND);
      // });

      it('should return 404 when user id is not a number', async () => {
        const invalidId = 'string';
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

      // it(`should return users in order of creation if sort field doesn't exist`, async () => {
      //   const expectedItems = users;
      //
      //   const response = await usersTestManager.getUsers(HttpStatus.OK, {
      //     sortBy: 'nonExisting',
      //   });
      //   expect(response.body.items).toEqual(expectedItems);
      // });
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
