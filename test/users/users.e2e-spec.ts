import { HttpStatus, INestApplication } from '@nestjs/common';
import { deleteAllData, initApp } from '../helpers/helper';
import { UsersTestManager } from './helpers/users.test-manager';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    app = await initApp();

    usersTestManager = new UsersTestManager(app);
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

      expect(createdUser.id).toEqual(expect.any(String));
      expect(createdUser.login).toBe(inputDto.login);
      expect(createdUser.email).toBe(inputDto.email);
      expect(createdUser.createdAt).toEqual(expect.any(String));
      expect(Date.parse(createdUser.createdAt)).not.toBeNaN();

      // todo: check db record

      const getUsersResponse = await usersTestManager.getUsers(HttpStatus.OK);
      const paginatedUsers: PaginatedViewDto<UserViewDto[]> =
        getUsersResponse.body;
      expect(paginatedUsers.items).toEqual([createdUser]);
    });
  });
});
