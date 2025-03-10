import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './features/user-accounts/user-accounts.module';
import { BloggerPlatformModule } from './features/blogger-platform/blogger-platform.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://0.0.0.0:27017', {
      dbName: 'nest-blogger-platform-dev',
    }),
    UserAccountModule,
    BloggerPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
