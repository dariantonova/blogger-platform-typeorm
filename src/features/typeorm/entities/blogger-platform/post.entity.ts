import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Blog } from './blog.entity';

@Entity()
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

  // static createInstance(dto: CreatePostDto): Post {
  //   const post = new Post();
  //
  //   post.title = dto.title;
  //   post.shortDescription = dto.shortDescription;
  //   post.content = dto.content;
  //   post.blogId = dto.blogId;
  //   post.createdAt = new Date();
  //   post.updatedAt = new Date();
  //   post.deletedAt = null;
  //
  //   return post;
  // }
  //
  // static reconstitute(row: PostRow): Post {
  //   const post = new Post();
  //
  //   post.id = row.id;
  //   post.title = row.title;
  //   post.shortDescription = row.short_description;
  //   post.content = row.content;
  //   post.blogId = row.blog_id;
  //   post.createdAt = row.created_at;
  //   post.updatedAt = row.updated_at;
  //   post.deletedAt = row.deleted_at;
  //
  //   return post;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Post is already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // update(dto: UpdatePostDomainDto) {
  //   this.title = dto.title;
  //   this.shortDescription = dto.shortDescription;
  //   this.content = dto.content;
  //   this.updatedAt = new Date();
  // }
}
