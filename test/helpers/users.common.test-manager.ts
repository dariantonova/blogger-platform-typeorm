import { HttpStatus, INestApplication } from '@nestjs/common';
import { QueryType, USERS_SA_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import request, { Response } from 'supertest';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/user.view-dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { LoginInputDto } from '../../src/features/user-accounts/api/input-dto/login.input-dto';

export class UsersCommonTestManager {
  constructor(private app: INestApplication) {}

  async createUser(createDto: any): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(USERS_SA_PATH)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as UserViewDto;
  }

  async createUsers(inputData: CreateUserDto[]): Promise<UserViewDto[]> {
    const users: UserViewDto[] = [];
    for (const createDto of inputData) {
      const user = await this.createUser(createDto);
      users.push(user);
    }
    return users;
  }

  async deleteUser(id: string): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(USERS_SA_PATH + '/' + id)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }

  async getUsers(query: QueryType = {}): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_SA_PATH)
      .query(query)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.OK);
  }

  async createDeletedUserWithGeneratedData(): Promise<CreateUserDto> {
    const userToDeleteData: CreateUserDto = {
      login: 'deleted',
      email: 'deleted@example.com',
      password: 'qwerty',
    };
    const userToDelete = await this.createUser(userToDeleteData);
    await this.deleteUser(userToDelete.id);

    return userToDeleteData;
  }

  // async findUserById(id: string): Promise<UserDocument> {
  //   const user = await this.UserModel.findOne({
  //     _id: new ObjectId(id),
  //   });
  //   expect(user).not.toBeNull();
  //
  //   return user as UserDocument;
  // }

  // async getConfirmationCodeOfLastCreatedUser(): Promise<string> {
  //   const getUsersResponse = await this.getUsers();
  //   const lastCreatedUser = getUsersResponse.body.items[0] as UserViewDto;
  //
  //   const dbUnconfirmedUser = await this.findUserById(lastCreatedUser.id);
  //   return dbUnconfirmedUser.confirmationInfo.confirmationCode;
  // }

  async checkUsersCount(count: number): Promise<void> {
    const getUsersResponse = await this.getUsers();
    expect(getUsersResponse.body.totalCount).toBe(count);
  }

  // async setUserPasswordRecoveryCodeHash(
  //   userId: string,
  //   recoveryCodeHash: string,
  // ): Promise<void> {
  //   await this.UserModel.updateOne(
  //     {
  //       _id: new ObjectId(userId),
  //     },
  //     {
  //       passwordRecoveryInfo: {
  //         recoveryCodeHash,
  //         expirationDate: add(new Date(), { hours: 2 }),
  //       },
  //     },
  //   );
  // }

  // async setUserPasswordRecoveryExpirationDate(
  //   userId: string,
  //   expirationDate: Date,
  // ): Promise<void> {
  //   await this.UserModel.updateOne(
  //     {
  //       _id: new ObjectId(userId),
  //     },
  //     {
  //       'passwordRecoveryInfo.expirationDate': expirationDate,
  //     },
  //   );
  // }

  async getLoginInputOfGeneratedUsers(
    numberOfUsers: number,
  ): Promise<LoginInputDto[]> {
    const usersData: CreateUserDto[] = [];
    for (let i = 1; i <= numberOfUsers; i++) {
      usersData.push({
        login: 'user' + i,
        email: 'user' + i + '@example.com',
        password: 'qwerty',
      });
    }
    await this.createUsers(usersData);

    const usersLoginInput: LoginInputDto[] = [];
    for (const userData of usersData) {
      const loginInput: LoginInputDto = {
        loginOrEmail: userData.login,
        password: userData.password,
      };
      usersLoginInput.push(loginInput);
    }

    return usersLoginInput;
  }
}
