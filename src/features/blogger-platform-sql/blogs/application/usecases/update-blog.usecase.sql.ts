import { UpdateBlogDto } from '../../../../blogger-platform/blogs/dto/update-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositorySql } from '../../infrastructure/blogs.repository.sql';

export class UpdateBlogCommandSql {
  constructor(
    public blogId: number,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommandSql)
export class UpdateBlogUseCaseSql
  implements ICommandHandler<UpdateBlogCommandSql>
{
  constructor(private blogsRepository: BlogsRepositorySql) {}

  async execute({ blogId, dto }: UpdateBlogCommandSql): Promise<void> {
    await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    await this.blogsRepository.updateBlog(blogId, dto);
  }
}
