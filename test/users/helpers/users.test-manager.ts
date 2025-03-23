import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../../src/features/user-accounts/dto/create-user.dto';
import request, { Response } from 'supertest';
import { DEFAULT_PAGE_SIZE, QueryType, USERS_PATH } from '../../helpers/helper';
import { UserViewDto } from '../../../src/features/user-accounts/api/view-dto/users.view-dto';

export const DEFAULT_USERS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createDto: CreateUserDto,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(USERS_PATH)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async getUsers(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_PATH)
      .query(query)
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

  async deleteUser(
    id: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .delete(USERS_PATH + '/' + id)
      .expect(expectedStatusCode);
  }
}
