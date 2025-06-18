import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';

export class UpdateBlogCommand {
  constructor(
    public blogId: number,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ blogId, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
