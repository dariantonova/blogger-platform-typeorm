import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { BlogRow } from '../infrastructure/dto/blog.row';

export class Blog {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

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

  static reconstitute(row: BlogRow): Blog {
    const blog = new Blog();

    blog.id = row.id;
    blog.name = row.name;
    blog.description = row.description;
    blog.websiteUrl = row.website_url;
    blog.isMembership = row.is_membership;
    blog.createdAt = row.created_at;
    blog.updatedAt = row.updated_at;
    blog.deletedAt = row.deleted_at;

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
    this.updatedAt = new Date();
  }
}
