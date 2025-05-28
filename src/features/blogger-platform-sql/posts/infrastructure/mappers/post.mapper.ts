import { PostDtoSql } from '../../dto/post.dto.sql';

export class PostRow {
  id: number;
  title: string;
  short_description: string;
  content: string;
  blog_id: number;
  blog_name: string;
  created_at: Date;
  updated_at: Date;
  likes_count: number;
  dislikes_count: number;
  like_user_id: number | null;
  like_user_login: string | null;
  like_added_at: Date | null;
}

export const mapPostRowsToDtos = (rows: PostRow[]): PostDtoSql[] => {
  const postsObj: Record<number, PostDtoSql> = {};
  const orderedPostIds: number[] = [];

  rows.forEach((row) => {
    if (!postsObj[row.id]) {
      postsObj[row.id] = {
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        content: row.content,
        blogId: row.blog_id,
        blogName: row.blog_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        extendedLikesInfo: {
          likesCount: row.likes_count,
          dislikesCount: row.dislikes_count,
          newestLikes: [],
        },
      };

      orderedPostIds.push(row.id);
    }
    if (row.like_user_id && row.like_user_login && row.like_added_at) {
      postsObj[row.id].extendedLikesInfo.newestLikes.push({
        addedAt: row.like_added_at,
        userId: row.like_user_id,
        login: row.like_user_login,
      });
    }
  });

  return orderedPostIds.map((id) => postsObj[id]);
};
