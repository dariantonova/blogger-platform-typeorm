import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../dto/user-context.dto';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-code';
import { DomainException } from '../../../../../../core/exceptions/domain-exception';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDto => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'There is no user in request object',
      });
    }

    return user;
  },
);
