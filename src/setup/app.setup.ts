import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { validationConstraintSetup } from './validation-constraint.setup';
import { filtersSetup } from './filters.setup';
import { CoreConfig } from '../core/core.config';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
  pipesSetup(app);
  filtersSetup(app);
  validationConstraintSetup(app);

  const coreConfig = app.get(CoreConfig);
  if (coreConfig.isSwaggerEnabled) {
    swaggerSetup(app);
  }
}
