import ApiRoutes from '@common/defs/api-routes';
import { Post } from '@modules/posts/defs/types';
import useItems, { UseItems, UseItemsOptions, defaultOptions } from '@common/hooks/useItems';
import { Id } from '@common/defs/types';

export interface CreateOneInput {
  title: string;
  content: string;
  userId: Id;
}

export interface UpdateOneInput {
  title?: string;
  content?: string;
  // No postId here, because we don't want to allow changing the author of a post
}

export type UpsertOneInput = CreateOneInput | UpdateOneInput;

const usePosts: UseItems<Post, CreateOneInput, UpdateOneInput> = (
  opts: UseItemsOptions = defaultOptions
) => {
  const apiRoutes = ApiRoutes.Posts;
  const useItemsHook = useItems<Post, CreateOneInput, UpdateOneInput>(apiRoutes, opts);
  return useItemsHook;
};

export default usePosts;
