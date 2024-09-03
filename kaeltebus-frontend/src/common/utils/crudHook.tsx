import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBaseDelete,
  getBaseUpdate as getBasePatch,
  getBasePost,
  getBasePut,
  getBaseQuery,
} from "./http";

type Transformer<T> = {
  [K in keyof T]?: (value: T[K]) => T[K];
};

export const useCrudHook = <T, TWriteModel>(
  key: string,
  transformer?: Transformer<T>
) => {
  const httpGet = getBaseQuery<T>(`/${key}`);
  const httpPost = getBasePost<TWriteModel>(`/${key}`);
  const httpPUT = getBasePut<TWriteModel>(`/${key}`);
  const httpPatch = getBasePatch<TWriteModel>(`/${key}`);
  const httpDelete = getBaseDelete(`/${key}`);

  const queryClient = useQueryClient();

  const objs = useQuery({
    queryKey: [key],
    queryFn: async ({ signal }) => {
      const response = await httpGet(signal);
      if (!transformer) return response;

      return response.map((receivedItem) => {
        const transformedKeys = Object.keys(transformer) as Array<keyof T>;
        const transformedObject = transformedKeys.reduce(
          (acc, transformedKey) => {
            const keyTransformer = transformer[transformedKey];
            if (!keyTransformer) return receivedItem;

            return {
              ...acc,
              [transformedKey]: keyTransformer(receivedItem[transformedKey]),
            };
          },
          receivedItem
        );

        return transformedObject;
      });
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [key],
    });

  const post = useMutation({
    mutationFn: httpPost,
    onSettled: invalidate,
  });

  const update = useMutation<
    void,
    unknown,
    { id: number; update: Partial<TWriteModel> },
    unknown
  >({
    mutationFn: ({ id, update }) => httpPatch(id, update),
    onSettled: invalidate,
  });

  const put = useMutation<
    void,
    unknown,
    { id: number; update: Partial<TWriteModel> },
    unknown
  >({
    mutationFn: ({ id, update }) => httpPUT(id, update),
    onSettled: invalidate,
  });

  const remove = useMutation({
    mutationFn: httpDelete,
    onSettled: invalidate,
  });

  return {
    post,
    update,
    put,
    remove,
    objs,
  };
};
