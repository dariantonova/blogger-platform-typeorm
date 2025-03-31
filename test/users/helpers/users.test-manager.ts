import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../../src/features/user-accounts/dto/create-user.dto';
import request, { Response } from 'supertest';
import {
  DEFAULT_PAGE_SIZE,
  QueryType,
  USERS_PATH,
  VALID_BASIC_AUTH_VALUE,
} from '../../helpers/helper';
import { UserViewDto } from '../../../src/features/user-accounts/api/view-dto/users.view-dto';
import {
  UserDocument,
  UserModelType,
} from '../../../src/features/user-accounts/domain/user.entity';
import { ObjectId } from 'mongodb';

export const DEFAULT_USERS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class UsersTestManager {
  constructor(
    private app: INestApplication,
    private UserModel: UserModelType,
  ) {}

  async createUser(
    createDto: any,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(USERS_PATH)
      .set('Authorization', auth)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async getUsers(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_PATH)
      .query(query)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async deleteUser(
    id: string,
    expectedStatusCode: HttpStatus,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(USERS_PATH + '/' + id)
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  generateUserData(userNumber: number = 1): CreateUserDto {
    return {
      login: 'user' + userNumber,
      email: 'user' + userNumber + '@example.com',
      password: 'qwerty',
    };
  }

  async createUsers(inputData: CreateUserDto[]): Promise<UserViewDto[]> {
    const responses: Response[] = [];
    for (const createDto of inputData) {
      const response = await this.createUser(createDto, HttpStatus.CREATED);
      responses.push(response);
    }
    return responses.map((res) => res.body as UserViewDto);
  }

  async createUsersWithGeneratedData(
    numberOfUsers: number,
  ): Promise<UserViewDto[]> {
    const usersData: CreateUserDto[] = [];
    for (let i = 1; i <= numberOfUsers; i++) {
      usersData.push(this.generateUserData(i));
    }
    return this.createUsers(usersData);
  }

  checkCreatedUserViewFields(
    createdUser: UserViewDto,
    inputDto: CreateUserDto,
  ) {
    expect(createdUser.id).toEqual(expect.any(String));
    expect(createdUser.login).toBe(inputDto.login);
    expect(createdUser.email).toBe(inputDto.email);
    expect(createdUser.createdAt).toEqual(expect.any(String));
    expect(Date.parse(createdUser.createdAt)).not.toBeNaN();
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      _id: new ObjectId(id),
    });
    expect(user).not.toBeNull();

    return user as UserDocument;
  }
}
