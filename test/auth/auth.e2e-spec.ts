import { HttpStatus, INestApplication } from '@nestjs/common';
import { deleteAllData, initApp } from '../helpers/helper';
import { AuthTestManager } from './helpers/auth.test-manager';
import { UsersCommonTestManager } from '../helpers/users.common.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;

  beforeAll(async () => {
    app = await initApp();

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
});
