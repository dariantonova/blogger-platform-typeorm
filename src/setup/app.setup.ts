import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { validationConstraintSetup } from './validation-constraint.setup';
import { filtersSetup } from './filters.setup';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
  pipesSetup(app);
  filtersSetup(app);
  swaggerSetup(app);
  validationConstraintSetup(app);
}
