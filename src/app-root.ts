import { DynamicModule } from '@nestjs/common';

let currentRootModule: DynamicModule;

export const setRootModule = (module: DynamicModule) => {
  currentRootModule = module;
};

export const getRootModule = (): DynamicModule => currentRootModule;
