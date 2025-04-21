import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import { setRootModule } from './app-root';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  setRootModule(DynamicAppModule);

  const app =
    await NestFactory.create<NestExpressApplication>(DynamicAppModule);
  await appContext.close();

  appSetup(app);

  await app.listen(coreConfig.port);
}
bootstrap();
