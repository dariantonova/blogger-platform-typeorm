import { PostDocument } from '../domain/post.entity';

export class PostsRepository {
  async save(post: PostDocument): Promise<void> {
    await post.save();
  }
}
