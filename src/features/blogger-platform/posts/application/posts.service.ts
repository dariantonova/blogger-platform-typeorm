import { CreatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';

export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findBlogByIdOrInternalFail(
      dto.blogId,
    );

    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const post = await this.postsRepository.findPostByIdOrNotFoundFail(id);

    const blog = await this.blogsRepository.findBlogByIdOrInternalFail(
      dto.blogId,
    );

    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.findPostByIdOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);
  }

  async getBlogPosts(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PostDocument[]> {
    await this.blogsRepository.findBlogByIdOrNotFoundFail(blogId);

    return this.postsRepository.findBlogPosts(blogId, query);
  }
}
