import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDtoSql } from '../../dto/user-context.dto.sql';

export const ExtractUserFromRequestSql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDtoSql => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new Error('There is no user in request object');
    }

    return user;
  },
);
