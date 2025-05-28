import { BlogDtoSql } from '../../dto/blog.dto.sql';

export class BlogRow {
  id: number;
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
  created_at: Date;
  updated_at: Date;
}

export const mapBlogRowToDto = (row: BlogRow): BlogDtoSql => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    websiteUrl: row.website_url,
    isMembership: row.is_membership,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
