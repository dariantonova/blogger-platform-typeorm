import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/domain/base.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Entity({ name: 'blogs' })
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
