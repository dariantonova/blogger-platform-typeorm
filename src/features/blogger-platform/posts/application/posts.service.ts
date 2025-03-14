import { CreatePostDto } from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';
import { Injectable } from '@nestjs/common';
import { CommentsService } from '../../comments/application/comments.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private commentsService: CommentsService,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(dto.blogId);

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
    const post = await this.postsRepository.findByIdOrNotFoundFail(id);

    const blog = await this.blogsRepository.findByIdOrInternalFail(dto.blogId);

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
    const post = await this.postsRepository.findByIdOrNotFoundFail(id);

    post.makeDeleted();

    await this.postsRepository.save(post);

    await this.commentsService.deletePostComments(post._id.toString());
  }

  async getBlogPosts(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PostDocument[]> {
    await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    return this.postsRepository.findBlogPosts(blogId, query);
  }

  async deleteBlogPosts(blogId: string): Promise<void> {
    const posts = await this.postsRepository.findAllBlogPosts(blogId);

    for (const post of posts) {
      post.makeDeleted();
    }

    const savePromises = posts.map((post) => this.postsRepository.save(post));
    await Promise.all(savePromises);
  }

  async updateBlogPostsBlogNames(
    blogId: string,
    blogName: string,
  ): Promise<void> {
    const posts = await this.postsRepository.findAllBlogPosts(blogId);

    for (const post of posts) {
      post.updateBlogName(blogName);
    }

    const savePromises = posts.map((post) => this.postsRepository.save(post));
    await Promise.all(savePromises);
  }
}
