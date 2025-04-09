import { PostsRepository } from '../infrastructure/posts.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

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
