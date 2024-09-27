import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBaseDelete,
  getBasePost,
  getBasePut,
  getBaseQuery,
  getBaseUpdate,
} from "./http";

type Transformer<T> = {
  [K in keyof T]?: (value: T[K]) => T[K];
};

type UseCrudHookParams<T, TParams extends Record<string, unknown>> = {
  key: string;
  params?: TParams;
  transformer?: Transformer<T>;
  additionalInvalidation?: Array<string>;
  enabled?: () => boolean;
};

export const useCrudHook = <
  T,
  TParams extends Record<string, unknown>,
  TWriteModel extends Record<string, unknown>,
  TUpdateModel = Partial<TWriteModel>
>({
  key,
  additionalInvalidation,
  params,
  transformer,
  enabled,
}: UseCrudHookParams<T, TParams>) => {
  const httpGet = getBaseQuery<T>(`/${key}`);
  const httpPost = getBasePost<TWriteModel>(`/${key}`);
  const httpPUT = getBasePut<TWriteModel>(`/${key}`);
  const httpPatch = getBaseUpdate<TUpdateModel>(`/${key}`);
  const httpDelete = getBaseDelete(`/${key}`);

  const queryClient = useQueryClient();

  // const [lastSetValues, setLastSetValues] = React.useState<TParams>();
  // const stringifiedParams = JSON.stringify(params);

  // React.useEffect(() => {
  //   setLastSetValues((old) => {
  //     const newKeys = Object.keys(params || {});
  //     const oldKeys = Object.keys(old || {});
  //     const keys = Array.from(new Set([...newKeys, ...oldKeys]));

  //     const newObj = keys.reduce((sum, currKey) => {
  //       const newValue = params?.[currKey];
  //       const oldValue = old?.[currKey];
  //       return {
  //         ...sum,
  //         [currKey]:
  //           newValue !== null && newValue !== undefined ? newValue : oldValue,
  //       };
  //     }, {} as TParams);

  //     return newObj;
  //   });
  // }, [stringifiedParams]);

  // const paramValues = Object.values(lastSetValues || {}) || [];
  const paramValues = Object.values(params || {});
  // console.log("paramValues", paramValues);

  // const objs = useQuery<T[], Error, TParams, any>({
  const objs = useQuery<Array<T>>({
    queryKey: [key, ...paramValues],
    enabled: enabled ?? true,
    placeholderData: (previousData) => previousData,
    queryFn: async ({ signal }): Promise<Array<T>> => {
      // const response = await httpGet(signal, lastSetValues);
      const response = await httpGet(signal, params);
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
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [key, ...paramValues],
    });
    additionalInvalidation?.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] })
    );
  };

  const post = useMutation({
    mutationFn: httpPost,
    onSettled: invalidate,
  });

  const update = useMutation<
    void,
    unknown,
    { id: number; update: TUpdateModel },
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
