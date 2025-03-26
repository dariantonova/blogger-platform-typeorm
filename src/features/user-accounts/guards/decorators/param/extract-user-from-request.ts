import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDto => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new Error('There is no user in request object');
    }

    return user;
  },
);
