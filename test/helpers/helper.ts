import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import request, { Response } from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { ObjectId } from 'mongodb';
import * as process from 'node:process';

export const BLOGS_PATH = `/${GLOBAL_PREFIX}/blogs`;
export const POSTS_PATH = `/${GLOBAL_PREFIX}/posts`;
export const COMMENTS_PATH = `/${GLOBAL_PREFIX}/comments`;
export const USERS_PATH = `/${GLOBAL_PREFIX}/users`;
export const AUTH_PATH = `/${GLOBAL_PREFIX}/auth`;

const basicAuthCredentials = `${process.env.HTTP_BASIC_USER}:${process.env.HTTP_BASIC_PASS}`;
const encodedBasicAuthCredentials =
  Buffer.from(basicAuthCredentials).toString('base64');

export const VALID_BASIC_AUTH_VALUE = `Basic ${encodedBasicAuthCredentials}`;

export const invalidBasicAuthTestValues: string[] = [
  '',
  'Basic somethingWeird',
  'Basic ',
  `Bearer ${encodedBasicAuthCredentials}`,
  encodedBasicAuthCredentials,
];

export type QueryType = Record<string, any>;
export const DEFAULT_PAGE_SIZE = 10;

export const initApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  appSetup(app);

  await app.init();

  await clearDB(moduleFixture);

  return app;
};

export const clearDB = async (moduleFixture: TestingModule): Promise<void> => {
  const connection = moduleFixture.get<Connection>(getConnectionToken());

  const collections = await connection.listCollections();
  for (const collection of collections) {
    await connection.collection(collection.name).deleteMany({});
  }
};

export const deleteAllData = async (
  app: INestApplication,
): Promise<Response> => {
  return request(app.getHttpServer()).delete(
    `/${GLOBAL_PREFIX}/testing/all-data`,
  );
};

export const sortArrByStrField = <T>(
  arr: T[],
  fieldName: keyof T,
  direction: 'asc' | 'desc' = 'asc',
): T[] => {
  return arr.toSorted((a, b) => {
    const strA = a[fieldName];
    const strB = b[fieldName];
    return direction === 'asc' ? (strA < strB ? -1 : 1) : strA > strB ? -1 : 1;
  });
};

export const sortArrByDateStrField = <T>(
  arr: T[],
  fieldName: keyof T,
  direction: 'asc' | 'desc' = 'asc',
): T[] => {
  return arr.toSorted((a, b) => {
    const dtA = new Date(a[fieldName] as string);
    const dtB = new Date(b[fieldName] as string);
    return direction === 'asc' ? +dtA - +dtB : +dtB - +dtA;
  });
};

export const caseInsensitiveSearch = (
  str: string,
  searchStr: string,
): boolean => {
  return new RegExp(searchStr, 'i').test(str);
};

export const generateNonExistingId = (): string => {
  return new ObjectId().toString();
};

export const getPageOfArray = <T>(
  arr: T[],
  pageNumber: number,
  pageSize: number,
): T[] => {
  return arr.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};
