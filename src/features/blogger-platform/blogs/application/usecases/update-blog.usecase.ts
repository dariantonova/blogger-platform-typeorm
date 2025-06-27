import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogsRepo } from '../../infrastructure/blogs.repo';

export class UpdateBlogCommand {
  constructor(
    public blogId: number,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepo) {}

  async execute({ blogId, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
