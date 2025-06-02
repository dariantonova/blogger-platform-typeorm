import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDtoSql } from '../../dto/user-context.dto.sql';

export const ExtractUserIfExistsFromRequestSql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDtoSql | null => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      return null;
    }

    return user;
  },
);
