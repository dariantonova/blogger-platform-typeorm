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
import { EmailService } from '../../src/features/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { CreateUserInputDto } from '../../src/features/user-accounts/api/input-dto/create-user.input-dto';
import { UsersTestManager } from '../users/helpers/users.test-manager';
import { UserModelType } from '../../src/features/user-accounts/domain/user.entity';
import { getModelToken } from '@nestjs/mongoose';
import { RegistrationConfirmationCodeInputDto } from '../../src/features/user-accounts/api/input-dto/registration-confirmation-code.input-dto';
import { RegistrationEmailResendingInputDto } from '../../src/features/user-accounts/api/input-dto/registration-email-resending.input-dto';
import { PasswordRecoveryInputDto } from '../../src/features/user-accounts/api/input-dto/password-recovery.input-dto';
import { CryptoService } from '../../src/features/user-accounts/application/crypto.service';
import { NewPasswordRecoveryInputDto } from '../../src/features/user-accounts/api/input-dto/new-password-recovery.input-dto';
import { CoreConfig } from '../../src/core/core.config';
import { ConfigService } from '@nestjs/config';
import { UserAccountsConfig } from '../../src/features/user-accounts/user-accounts.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/features/user-accounts/constants/auth-tokens.inject-constants';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersCommonTestManager: UsersCommonTestManager;
  let usersTestManager: UsersTestManager;
  let UserModel: UserModelType;

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          inject: [CoreConfig],
          factory: (coreConfig: CoreConfig) => {
            return new JwtService({
              secret: coreConfig.accessJwtSecret,
              signOptions: {
                expiresIn: '2s',
              },
            });
          },
        })
        .overrideProvider(EmailService)
        .useClass(EmailServiceMock)
        .overrideProvider(UserAccountsConfig)
        .useFactory({
          inject: [ConfigService],
          factory: (configService: ConfigService) => {
            return {
              ...new UserAccountsConfig(configService),
              emailConfirmationCodeLifetimeInSeconds: 2,
            };
          },
        });
    });

    UserModel = app.get<UserModelType>(getModelToken('User'));

    authTestManager = new AuthTestManager(app);
    usersCommonTestManager = new UsersCommonTestManager(app, UserModel);
    usersTestManager = new UsersTestManager(app, UserModel);
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
      authTestManager.checkLoginResponse(response);
    });

    // log in by email
    it('should successfully log in user by email', async () => {
      const data: LoginInputDto = {
        loginOrEmail: userData.email,
        password: userData.password,
      };

      const response = await authTestManager.login(data, HttpStatus.OK);
      authTestManager.checkLoginResponse(response);
    });

    it('should return 401 when trying to log in deleted user', async () => {
      const deletedUserData =
        await usersCommonTestManager.createDeletedUserWithGeneratedData();

      const loginData: LoginInputDto = {
        loginOrEmail: deletedUserData.login,
        password: deletedUserData.password,
      };
      await authTestManager.login(loginData, HttpStatus.UNAUTHORIZED);
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

    describe('authentication', () => {
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

        await authTestManager.me(
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });

      // user was deleted
      it('should return 401 if user was deleted', async () => {
        const accessToken = await authTestManager.getNewAccessToken(
          userData.login,
          userData.password,
        );
        await usersCommonTestManager.deleteUser(user.id);
        await authTestManager.me(
          'Bearer ' + accessToken,
          HttpStatus.UNAUTHORIZED,
        );
      });
    });
  });

  describe('registration', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendConfirmationEmail as jest.Mock).mockClear();
    });

    it('should register user', async () => {
      const inputDto: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };

      await authTestManager.register(inputDto, HttpStatus.NO_CONTENT);

      const getUsersResponse = await usersCommonTestManager.getUsers();
      const createdUser: UserViewDto = getUsersResponse.body.items[0];

      usersTestManager.checkCreatedUserViewFields(createdUser, inputDto);

      const dbCreatedUser = await usersCommonTestManager.findUserById(
        createdUser.id,
      );
      expect(dbCreatedUser.confirmationInfo.isConfirmed).toBe(false);
      expect(
        dbCreatedUser.confirmationInfo.confirmationCode.length,
      ).toBeGreaterThan(0);

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
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

        existingUser = await usersCommonTestManager.createUser({
          login: 'taken',
          email: 'taken@example.com',
          password: 'qwerty',
        });
      });

      afterEach(async () => {
        await usersCommonTestManager.checkUsersCount(1);

        expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
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
          const response = await authTestManager.register(
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
          const response = await authTestManager.register(
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
          const response = await authTestManager.register(
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

        const response = await authTestManager.register(
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

  describe('registration confirmation', () => {
    beforeAll(async () => {
      await deleteAllData(app);
    });

    it('should confirm registration', async () => {
      const userData: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const getUsersResponse = await usersCommonTestManager.getUsers();
      const createdUser = getUsersResponse.body.items[0] as UserViewDto;

      const dbUnconfirmedUser = await usersCommonTestManager.findUserById(
        createdUser.id,
      );
      const confirmationCode =
        dbUnconfirmedUser.confirmationInfo.confirmationCode;

      const inputDto: RegistrationConfirmationCodeInputDto = {
        code: confirmationCode,
      };
      await authTestManager.confirmRegistration(
        inputDto,
        HttpStatus.NO_CONTENT,
      );

      const dbConfirmedUser = await usersCommonTestManager.findUserById(
        createdUser.id,
      );
      expect(dbConfirmedUser.confirmationInfo.isConfirmed).toBe(true);
    });

    describe('validation', () => {
      beforeAll(async () => {
        await deleteAllData(app);
      });

      // invalid code (wrong format)
      it('should return 400 if format of confirmation code is wrong', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {};
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          code: 4,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          code: '',
        };
        invalidDataCases.push(data3);

        // empty with spaces
        const data4 = {
          code: '  ',
        };
        invalidDataCases.push(data4);

        for (const data of invalidDataCases) {
          const response = await authTestManager.confirmRegistration(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'code',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      // incorrect (non-existing) code
      it('should return 400 if confirmation code matches no user', async () => {
        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: 'non-existing',
        };

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // code of deleted user
      it('should return 400 if confirmation code matches deleted user', async () => {
        const userToDelete = await usersCommonTestManager.createUser({
          login: 'deleted',
          email: 'deleted@example.com',
          password: 'qwerty',
        });
        await usersCommonTestManager.deleteUser(userToDelete.id);

        const dbDeletedUser = await usersCommonTestManager.findUserById(
          userToDelete.id,
        );
        const code = dbDeletedUser.confirmationInfo.confirmationCode;

        const response = await authTestManager.confirmRegistration(
          { code },
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // already confirmed user
      it('should return 400 when trying to confirm already confirmed user', async () => {
        const userData: CreateUserDto = {
          login: 'confirmed',
          email: 'confirmed@example.com',
          password: 'qwerty',
        };
        await authTestManager.register(userData, HttpStatus.NO_CONTENT);

        const confirmationCode =
          await usersCommonTestManager.getConfirmationCodeOfLastCreatedUser();

        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: confirmationCode,
        };
        await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.NO_CONTENT,
        );

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });

      // expired code
      it('should return 400 if confirmation code is expired', async () => {
        const userData: CreateUserDto = {
          login: 'expired',
          email: 'expired@example.com',
          password: 'qwerty',
        };
        await authTestManager.register(userData, HttpStatus.NO_CONTENT);

        const confirmationCode =
          await usersCommonTestManager.getConfirmationCodeOfLastCreatedUser();

        const inputDto: RegistrationConfirmationCodeInputDto = {
          code: confirmationCode,
        };

        await delay(2000);

        const response = await authTestManager.confirmRegistration(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'code',
              message: expect.any(String),
            },
          ],
        });
      });
    });
  });

  describe('registration email resending', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendConfirmationEmail as jest.Mock).mockClear();
    });

    // invalid email
    it('should return 400 if email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // missing
      const data1 = {};
      invalidDataCases.push(data1);

      // not string
      const data2 = {
        email: 4,
      };
      invalidDataCases.push(data2);

      // empty string
      const data3 = {
        email: '',
      };
      invalidDataCases.push(data3);

      // empty string with spaces
      const data4 = {
        email: '  ',
      };
      invalidDataCases.push(data4);

      // does not match pattern
      const data7 = {
        email: 'without domain',
      };
      invalidDataCases.push(data7);

      for (const data of invalidDataCases) {
        const response = await authTestManager.resendRegistrationEmail(
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

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
    });

    // email matches no user
    it('should return 400 if email matches no user', async () => {
      const inputDto: RegistrationEmailResendingInputDto = {
        email: 'nonExisting@example.com',
      };

      const response = await authTestManager.resendRegistrationEmail(
        inputDto,
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

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(0);
    });

    // already confirmed user
    it('should return 204 if user is already confirmed', async () => {
      const userData: CreateUserDto = {
        login: 'confirmed',
        email: 'confirmed@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const confirmationCode =
        await usersCommonTestManager.getConfirmationCodeOfLastCreatedUser();

      await authTestManager.confirmRegistration(
        { code: confirmationCode },
        HttpStatus.NO_CONTENT,
      );

      const inputDto: RegistrationEmailResendingInputDto = {
        email: userData.email,
      };
      const response = await authTestManager.resendRegistrationEmail(
        inputDto,
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

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    });

    // success
    it('should resend registration email without actually sending it', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const inputDto: RegistrationEmailResendingInputDto = {
        email: userData.email,
      };
      await authTestManager.resendRegistrationEmail(
        inputDto,
        HttpStatus.NO_CONTENT,
      );

      expect(emailService.sendConfirmationEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('password recovery', () => {
    let emailService: EmailService;

    beforeAll(async () => {
      await deleteAllData(app);

      emailService = app.get(EmailService);
    });

    beforeEach(async () => {
      (emailService.sendPasswordRecoveryEmail as jest.Mock).mockClear();
    });

    // invalid email
    it('should return 400 if email is invalid', async () => {
      const invalidDataCases: any[] = [];

      // missing
      const data1 = {};
      invalidDataCases.push(data1);

      // not string
      const data2 = {
        email: 4,
      };
      invalidDataCases.push(data2);

      // empty string
      const data3 = {
        email: '',
      };
      invalidDataCases.push(data3);

      // empty string with spaces
      const data4 = {
        email: '  ',
      };
      invalidDataCases.push(data4);

      // does not match pattern
      const data7 = {
        email: 'without domain',
      };
      invalidDataCases.push(data7);

      for (const data of invalidDataCases) {
        const response = await authTestManager.recoverPassword(
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

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(0);
    });

    // email matches no user
    it('should return 204 if email matches no user', async () => {
      const inputDto: PasswordRecoveryInputDto = {
        email: 'nonExisting@example.com',
      };

      await authTestManager.recoverPassword(inputDto, HttpStatus.NO_CONTENT);

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(0);
    });

    // success
    it('should request password recovery without actually sending email', async () => {
      const userData: CreateUserDto = {
        login: 'success',
        email: 'success@example.com',
        password: 'qwerty',
      };
      await authTestManager.register(userData, HttpStatus.NO_CONTENT);

      const inputDto: PasswordRecoveryInputDto = {
        email: userData.email,
      };
      await authTestManager.recoverPassword(inputDto, HttpStatus.NO_CONTENT);

      expect(emailService.sendPasswordRecoveryEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('new password', () => {
    let cryptoService: CryptoService;

    beforeAll(async () => {
      await deleteAllData(app);

      cryptoService = app.get(CryptoService);
    });

    // success
    it('should set new password', async () => {
      const userData: CreateUserDto = {
        login: 'user1',
        email: 'user1@example.com',
        password: 'qwerty',
      };

      const user = await usersCommonTestManager.createUser(userData);

      const recoveryCode = 'code';
      const recoveryCodeHash =
        cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

      await usersCommonTestManager.setUserPasswordRecoveryCodeHash(
        user.id,
        recoveryCodeHash,
      );

      const inputDto: NewPasswordRecoveryInputDto = {
        recoveryCode,
        newPassword: 'newPassword',
      };

      await authTestManager.setNewPassword(inputDto, HttpStatus.NO_CONTENT);

      await authTestManager.login(
        {
          loginOrEmail: userData.login,
          password: inputDto.newPassword,
        },
        HttpStatus.OK,
      );
    });

    describe('validation', () => {
      let usersData: CreateUserDto[];
      let users: UserViewDto[];
      let recoveryCodes: string[];
      let validInputDto: NewPasswordRecoveryInputDto;

      beforeAll(async () => {
        await deleteAllData(app);

        usersData = [
          {
            login: 'user1',
            email: 'user1@example.com',
            password: 'qwerty',
          },
          {
            login: 'user2',
            email: 'user2@example.com',
            password: 'qwerty',
          },
          {
            login: 'user3',
            email: 'user3@example.com',
            password: 'qwerty',
          },
          {
            login: 'user4',
            email: 'user4@example.com',
            password: 'qwerty',
          },
        ];

        users = await usersCommonTestManager.createUsers(usersData);

        recoveryCodes = ['code1', 'code2', 'code3', 'code4'];
        const recoveryCodesHashes = recoveryCodes.map(
          cryptoService.createPasswordRecoveryCodeHash,
        );

        for (let i = 0; i < usersData.length; i++) {
          await usersCommonTestManager.setUserPasswordRecoveryCodeHash(
            users[i].id,
            recoveryCodesHashes[i],
          );
        }

        validInputDto = {
          newPassword: 'newPassword',
          recoveryCode: recoveryCodes[0],
        };
      });

      // invalid password
      it('should return 400 if password is invalid', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          recoveryCode: validInputDto.recoveryCode,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 4,
        };
        invalidDataCases.push(data2);

        // empty string
        const data3 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: '',
        };
        invalidDataCases.push(data3);

        // empty string with spaces
        const data4 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: '  ',
        };
        invalidDataCases.push(data4);

        // too long
        const data5 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 'a'.repeat(21),
        };
        invalidDataCases.push(data5);

        // too short
        const data6 = {
          recoveryCode: validInputDto.recoveryCode,
          newPassword: 'a'.repeat(5),
        };
        invalidDataCases.push(data6);

        for (const data of invalidDataCases) {
          const response = await authTestManager.setNewPassword(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'newPassword',
                message: expect.any(String),
              },
            ],
          });
        }

        await authTestManager.login(
          {
            loginOrEmail: usersData[0].login,
            password: usersData[0].password,
          },
          HttpStatus.OK,
        );
      });

      // invalid recovery code
      it('should return 400 if format of recovery code is wrong', async () => {
        const invalidDataCases: any[] = [];

        // missing
        const data1 = {
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data1);

        // not string
        const data2 = {
          code: 4,
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data2);

        // empty
        const data3 = {
          code: '',
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data3);

        // empty with spaces
        const data4 = {
          code: '  ',
          newPassword: validInputDto.newPassword,
        };
        invalidDataCases.push(data4);

        for (const data of invalidDataCases) {
          const response = await authTestManager.setNewPassword(
            data,
            HttpStatus.BAD_REQUEST,
          );
          expect(response.body).toEqual({
            errorsMessages: [
              {
                field: 'recoveryCode',
                message: expect.any(String),
              },
            ],
          });
        }
      });

      // multiple errors
      it('should return multiple errors if multiple fields are invalid', async () => {
        const data = {
          recoveryCode: '',
          newPassword: 4,
        };

        const response = await authTestManager.setNewPassword(
          data,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: expect.arrayContaining([
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
            {
              field: 'newPassword',
              message: expect.any(String),
            },
          ]),
        });
      });

      // non-existing code
      it('should return 400 if recovery code matches no user', async () => {
        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: 'non-existing',
          newPassword: validInputDto.newPassword,
        };

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });
      });

      // code of deleted user
      it('should return 400 if recovery code matches deleted user', async () => {
        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[1],
          newPassword: validInputDto.newPassword,
        };

        await usersCommonTestManager.deleteUser(users[1].id);

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });
      });

      // expired code
      it('should return 400 if recovery code is expired', async () => {
        await usersCommonTestManager.setUserPasswordRecoveryExpirationDate(
          users[2].id,
          new Date(),
        );

        const inputDto: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[2],
          newPassword: validInputDto.newPassword,
        };

        const response = await authTestManager.setNewPassword(
          inputDto,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });

        await authTestManager.login(
          {
            loginOrEmail: usersData[2].login,
            password: usersData[2].password,
          },
          HttpStatus.OK,
        );
      });

      // already used code
      it('should return 400 is recovery code has already been applied', async () => {
        const inputDto1: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[3],
          newPassword: 'newPassword1',
        };
        const inputDto2: NewPasswordRecoveryInputDto = {
          recoveryCode: recoveryCodes[3],
          newPassword: 'newPassword2',
        };

        await authTestManager.setNewPassword(inputDto1, HttpStatus.NO_CONTENT);

        const response = await authTestManager.setNewPassword(
          inputDto2,
          HttpStatus.BAD_REQUEST,
        );
        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: 'recoveryCode',
              message: expect.any(String),
            },
          ],
        });

        await authTestManager.login(
          {
            loginOrEmail: usersData[3].login,
            password: inputDto1.newPassword,
          },
          HttpStatus.OK,
        );
      });
    });
  });
});
