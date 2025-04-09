import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsService } from '../../../posts/application/posts.service';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsService: PostsService,
  ) {}

  async execute({ blogId, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.update(dto);

    await this.blogsRepository.save(blog);

    await this.postsService.updateBlogPostsBlogNames(
      blog._id.toString(),
      blog.name,
    );
  }
}
