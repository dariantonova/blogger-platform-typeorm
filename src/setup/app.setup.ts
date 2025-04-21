import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { validationConstraintSetup } from './validation-constraint.setup';
import { filtersSetup } from './filters.setup';
import { CoreConfig } from '../core/core.config';
import { NestExpressApplication } from '@nestjs/platform-express';

export function appSetup(app: NestExpressApplication) {
  app.enableCors();
  app.set('trust proxy', true);
  globalPrefixSetup(app);
  pipesSetup(app);
  filtersSetup(app);
  validationConstraintSetup(app);

  const coreConfig = app.get(CoreConfig);
  if (coreConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }
}
