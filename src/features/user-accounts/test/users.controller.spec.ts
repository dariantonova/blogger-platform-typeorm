import { UsersController } from '../api/users.controller';
import { Test } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { GetUsersQuery } from '../application/queries/get-users.query';

describe('UsersController', () => {
  let controller: UsersController;
  const queryBusMock = {
    execute: jest.fn(),
  };
  const commandBusMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: QueryBus,
          useValue: queryBusMock,
        },
        {
          provide: CommandBus,
          useValue: {
            execute: commandBusMock,
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<UsersController>(UsersController);
  });

  describe('getUsers', () => {
    it('should call QueryBus with GetUsersQuery and the passed query params', async () => {
      const queryParams = new GetUsersQueryParams();
      // different from default to make sure query is called with passed params
      queryParams.pageNumber = 2;

      const resultMock: PaginatedViewDto<UserViewDto[]> = {
        page: 2,
        pageSize: 10,
        totalCount: 0,
        pagesCount: 0,
        items: [],
      };
      queryBusMock.execute.mockResolvedValueOnce(resultMock);

      const result = await controller.getUsers(queryParams);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        expect.any(GetUsersQuery),
      );
      const calledQuery = queryBusMock.execute.mock
        .calls[0][0] as GetUsersQuery;
      expect(calledQuery.queryParams).toEqual(queryParams);

      expect(result).toEqual(resultMock);
    });
  });
});
