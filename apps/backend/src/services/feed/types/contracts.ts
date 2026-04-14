import { FeedComment, FeedLike, FeedPost } from "./models";

export interface ListFeedPostsResponse {
  posts: FeedPost[];
}

export interface GetFeedPostResponse {
  post: FeedPost;
}

export interface GetFeedCommentResponse {
  comment: FeedComment;
}

export interface GetFeedLikeResponse {
  like: FeedLike;
}
