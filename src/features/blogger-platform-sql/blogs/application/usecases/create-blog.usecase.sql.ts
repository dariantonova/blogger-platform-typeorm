import { CreateBlogDto } from '../../../../blogger-platform/blogs/dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositorySql } from '../../infrastructure/blogs.repository.sql';
import { CreateBlogRepoDto } from '../../infrastructure/dto/create-blog.repo-dto';

export class CreateBlogCommandSql {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommandSql)
export class CreateBlogUseCaseSql
  implements ICommandHandler<CreateBlogCommandSql, number>
{
  constructor(private blogsRepository: BlogsRepositorySql) {}

  async execute({ dto }: CreateBlogCommandSql): Promise<number> {
    const repoDto: CreateBlogRepoDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    };

    return this.blogsRepository.createBlog(repoDto);
  }
}
