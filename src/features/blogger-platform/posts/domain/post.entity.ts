import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/domain/base.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';

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
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Post is already deleted',
      });
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
