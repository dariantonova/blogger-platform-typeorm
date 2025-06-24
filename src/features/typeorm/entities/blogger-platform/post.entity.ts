import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Blog } from './blog.entity';
import { CreatePostDto } from '../../../blogger-platform/posts/dto/create-post.dto';
import { UpdatePostDomainDto } from '../../../blogger-platform/posts/domain/dto/update-post.domain.dto';

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @ManyToOne(() => Blog)
  blog: Blog;

  @Column()
  blogId: number;

  static createInstance(dto: CreatePostDto): Post {
    const post = new Post();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.createdAt = new Date();
    post.updatedAt = new Date();
    post.deletedAt = null;

    return post;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
