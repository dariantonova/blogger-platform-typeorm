import { UpdatePostDomainDtoWrap } from './dto/update-post.domain.dto.wrap';
import { PostRowWrap } from '../infrastructure/dto/post.row.wrap';
import { CreatePostDtoSql } from '../../../blogger-platform-sql/posts/dto/create-post.dto.sql';

export class PostWrap {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreatePostDtoSql): PostWrap {
    const post = new PostWrap();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.createdAt = new Date();
    post.updatedAt = new Date();
    post.deletedAt = null;

    return post;
  }

  static reconstitute(row: PostRowWrap): PostWrap {
    const post = new PostWrap();

    post.id = row.id;
    post.title = row.title;
    post.shortDescription = row.short_description;
    post.content = row.content;
    post.blogId = row.blog_id;
    post.createdAt = row.created_at;
    post.updatedAt = row.updated_at;
    post.deletedAt = row.deleted_at;

    return post;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDtoWrap) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.updatedAt = new Date();
  }
}
