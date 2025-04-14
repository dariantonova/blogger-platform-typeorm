import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';

export const ExtractUserIfExistsFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDto | null => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      return null;
    }

    return user;
  },
);
