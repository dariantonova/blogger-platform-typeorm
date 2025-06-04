import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import request, { Response } from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import * as process from 'node:process';
import { EmailService } from '../../src/features/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { NestFactory } from '@nestjs/core';
import { CoreConfig } from '../../src/core/core.config';
import { setRootModule } from '../../src/app-root';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerGuardMock } from '../mock/throttler-guard.mock';

export const BLOGS_PATH = `/${GLOBAL_PREFIX}/blogs`;
export const BLOGS_SA_PATH = `/${GLOBAL_PREFIX}/sa/blogs`;
export const POSTS_PATH = `/${GLOBAL_PREFIX}/posts`;
export const COMMENTS_PATH = `/${GLOBAL_PREFIX}/comments`;
export const USERS_SA_PATH = `/${GLOBAL_PREFIX}/sa/users`;
export const AUTH_PATH = `/${GLOBAL_PREFIX}/auth`;
export const SECURITY_DEVICES_PATH = `/${GLOBAL_PREFIX}/security/devices`;
export const buildBlogPostsPath = (
  sa: boolean,
  blogId: string,
  postId?: string,
): string => {
  return `${sa ? BLOGS_SA_PATH : BLOGS_PATH}/${blogId}/posts${postId ? '/' + postId : ''}`;
};

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

export class InitAppOptions {
  customBuilderSetup?: (builder: TestingModuleBuilder) => void;
  overrideThrottlerGuard?: boolean;
}

export const initApp = async (
  options: InitAppOptions = {},
): Promise<NestExpressApplication> => {
  const {
    customBuilderSetup = (builder: TestingModuleBuilder) => {},
    overrideThrottlerGuard = true,
  } = options;

  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  setRootModule(DynamicAppModule);
  await appContext.close();

  const testingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (overrideThrottlerGuard) {
    testingModuleBuilder
      .overrideGuard(ThrottlerGuard)
      .useClass(ThrottlerGuardMock);
  }

  customBuilderSetup(testingModuleBuilder);

  const moduleFixture: TestingModule = await testingModuleBuilder.compile();

  const app: NestExpressApplication = moduleFixture.createNestApplication();

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

// export const generateNonExistingId = (): string => {
//   return new ObjectId().toString();
// };

export const generateNonExistingId = (): string => '-1';

export const generateIdOfWrongType = (): string => 'string';

export const getPageOfArray = <T>(
  arr: T[],
  pageNumber: number,
  pageSize: number,
): T[] => {
  return arr.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const ENSURE_TOKEN_ROTATION_DELAY_MS = 1000;

export async function waitForTokenRotation() {
  await delay(ENSURE_TOKEN_ROTATION_DELAY_MS);
}
