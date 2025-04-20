import { INestApplication } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { getRootModule } from '../app-root';

export const validationConstraintSetup = (app: INestApplication) => {
  useContainer(app.select(getRootModule()), { fallbackOnErrors: true });
};
