import { CreateBlogDto } from '../../../blogger-platform/blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../../blogger-platform/blogs/dto/update-blog.dto';
import { BlogRowWrap } from '../infrastructure/dto/blog.row.wrap';

export class BlogWrap {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreateBlogDto): BlogWrap {
    const blog = new BlogWrap();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date();
    blog.updatedAt = new Date();
    blog.deletedAt = null;

    return blog;
  }

  static reconstitute(row: BlogRowWrap): BlogWrap {
    const blog = new BlogWrap();

    blog.id = row.id.toString();
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
