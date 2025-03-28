import { HttpStatus, INestApplication } from '@nestjs/common';
import { delay, deleteAllData, initApp } from '../helpers/helper';
import { AuthTestManager } from './helpers/auth.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';
import {
  MeViewDto,
  UserViewDto,
} from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { TestingModuleBuilder } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'access-token-secret',
          signOptions: {
            expiresIn: '2s',
          },
        }),
      );
    });

    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    const userData: CreateUserDto = {
      login: 'user1',
      email: 'user1@example.com',
      password: 'qwerty',
    };

    beforeAll(async () => {
      await deleteAllData(app);

      await usersCommonTestManager.createUser(userData);
    });

    // username or password missing (401)
    it('should return 401 if required fields are missing', async () => {
      const invalidDataCases: any[] = [];

      // loginOrEmail
      const data1 = {
        password: userData.password,
      };
      invalidDataCases.push(data1);

      const data2 = {
        loginOrEmail: '',
        password: userData.password,
      };
      invalidDataCases.push(data2);

      // password
      const data3 = {
        loginOrEmail: userData.login,
      };
      invalidDataCases.push(data3);

      const data4 = {
        loginOrEmail: userData.login,
        password: '',
      };
      invalidDataCases.push(data4);

      const data5 = {};
      invalidDataCases.push(data5);

      for (const data of invalidDataCases) {
        await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
      }
    });

    // username or password invalid
    it('should return 400 if login or email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // not string
      const data1 = {
        loginOrEmail: 4,
        password: userData.password,
      };
      invalidDataCases.push(data1);

      // empty string with spaces
      const data2 = {
        loginOrEmail: '  ',
        password: userData.password,
      };
      invalidDataCases.push(data2);

      for (const data of invalidDataCases) {
        const response = await authTestManager.login(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'loginOrEmail',
              message: expect.any(String),
            },
          ],
        });
      }
    });

    it('should return 400 if password is invalid', async () => {
      const invalidDataCases: any[] = [];

      // not string
      const data1 = {
        loginOrEmail: userData.login,
        password: 4,
      };
      invalidDataCases.push(data1);

      // empty string with spaces
      const data2 = {
        loginOrEmail: userData.login,
        password: '  ',
      };
      invalidDataCases.push(data2);

      for (const data of invalidDataCases) {
        const response = await authTestManager.login(
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

    // both username and password invalid (400 with multiple errors)
    it('should return multiple errors if multiple fields are invalid', async () => {
      const data = {
        loginOrEmail: 4,
        password: '  ',
      };

      const response = await authTestManager.login(
        data,
        HttpStatus.BAD_REQUEST,
      );
      expect(response.body).toEqual({
        errorsMessages: expect.arrayContaining([
          {
            field: 'loginOrEmail',
            message: expect.any(String),
          },
          {
            field: 'password',
            message: expect.any(String),
          },
        ]),
      });
    });

    // username doesn't exist
    it(`should return 401 if user with given login or email doesn't exist`, async () => {
      const data: LoginInputDto = {
        loginOrEmail: 'non-existing',
        password: 'somePassword',
      };

      await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
    });

    // wrong password
    it('should return 401 if password is wrong', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.login,
        password: 'wrong',
      };

      await authTestManager.login(data, HttpStatus.UNAUTHORIZED);
    });

    // log in by login
    it('should successfully log in user by login', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.login,
        password: userData.password,
      };

      const response = await authTestManager.login(data, HttpStatus.OK);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
    });

    // log in by email
    it('should successfully log in user by email', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.email,
        password: userData.password,
      };

      const response = await authTestManager.login(data, HttpStatus.OK);
      expect(response.body).toEqual({ accessToken: expect.any(String) });
    });
  });

  describe('me', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should return info about current user', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      const user = await usersCommonTestManager.createUser(userData);

      const accessToken = await authTestManager.getNewAccessToken(
        userData.login,
        userData.password,
      );

      const response = await authTestManager.me(
        'Bearer ' + accessToken,
        HttpStatus.OK,
      );
      const userInfo: MeViewDto = response.body;

      expect(userInfo.login).toBe(userData.login);
      expect(userInfo.email).toBe(userData.email);
      expect(userInfo.userId).toBe(user.id);
    });

    describe('authorization', () => {
      const userData: CreateUserDto = {
        login: 'auth',
        email: 'auth@example.com',
        password: 'qwerty',
      };
      let user: UserViewDto;

      beforeAll(async () => {
        await deleteAllData(app);

        user = await usersCommonTestManager.createUser(userData);
      });

      // non-existing token
      it('should return 401 if access token is invalid', async () => {
        const accessToken = 'random';
        await authTestManager.me(
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
        await authTestManager.me(accessToken, HttpStatus.UNAUTHORIZED);
      });

      // expired token
      it('should return 401 if access token is expired', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );

        await delay(2000);

        await authTestManager.me(accessToken, HttpStatus.UNAUTHORIZED);
      });

      // user was deleted
      it('should return 401 if user was deleted', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await usersCommonTestManager.deleteUser(user.id);
        await authTestManager.me(accessToken, HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
