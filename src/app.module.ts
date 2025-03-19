import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';
import { TestingModule } from './features/testing/testing.module';
import { CoreModule } from './core/core.module';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';
const DN_NAME = process.env.DN_NAME || 'test';

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_URL, {
      dbName: DN_NAME,
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
