import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { CreateBlogDto } from '../../../blogger-platform/blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../../blogger-platform/blogs/dto/update-blog.dto';

@Entity()
export class Blog extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column()
  isMembership: boolean;

  static createInstance(dto: CreateBlogDto): Blog {
    const blog = new Blog();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date();
    blog.updatedAt = new Date();
    blog.deletedAt = null;

    return blog;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Blog is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
