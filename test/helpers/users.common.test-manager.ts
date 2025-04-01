import { HttpStatus, INestApplication } from '@nestjs/common';
import { QueryType, USERS_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import request, { Response } from 'supertest';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';
import { CreateUserDto } from '../../src/features/user-accounts/dto/create-user.dto';
import { ObjectId } from 'mongodb';
import {
  UserDocument,
  UserModelType,
} from '../../src/features/user-accounts/domain/user.entity';
import { RegistrationConfirmationCodeInputDto } from '../../src/features/user-accounts/api/input-dto/registration-confirmation-code.input-dto';

export class UsersCommonTestManager {
  constructor(
    private app: INestApplication,
    private UserModel: UserModelType,
  ) {}

  async createUser(createDto: any): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(USERS_PATH)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as UserViewDto;
  }

  async deleteUser(id: string): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(USERS_PATH + '/' + id)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }

  async getUsers(query: QueryType = {}): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_PATH)
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

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: new ObjectId(id),
    });
    expect(user).not.toBeNull();

    return user as UserDocument;
  }

  async getConfirmationCodeOfLastCreatedUser(): Promise<string> {
    const getUsersResponse = await this.getUsers();
    const lastCreatedUser = getUsersResponse.body.items[0] as UserViewDto;

    const dbUnconfirmedUser = await this.findUserById(lastCreatedUser.id);
    return dbUnconfirmedUser.confirmationInfo.confirmationCode;
  }

  async checkUsersCount(count: number): Promise<void> {
    const getUsersResponse = await this.getUsers();
    expect(getUsersResponse.body.totalCount).toBe(count);
  }
}
