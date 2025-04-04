import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreModule } from './core/core.module';

const MONGO_URI = process.env.MONGO_URI || '';
const DB_NAME = process.env.DB_NAME || '';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URI, {
      dbName: DB_NAME,
    }),
    UserAccountModule,
    BloggerPlatformModule,
    TestingModule,
    CoreModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
