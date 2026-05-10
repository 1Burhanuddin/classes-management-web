import { baseApi } from "./baseApi";
import type { BatchListItem, CreateBatchInput, PaginatedBatches, UpdateBatchInput } from "@/features/batches";

type ListBatchesArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  classId?: string;
  teacherId?: string;
};

type BatchResponse = {
  batch: BatchListItem;
};

export const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listBatches: builder.query<PaginatedBatches, ListBatchesArgs | void>({
      query: (args) => ({
        url: "/batches",
        params: args ?? undefined,
      }),
      providesTags: ["Batch"],
    }),
    getBatch: builder.query<BatchResponse, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Batch", id }],
    }),
    createBatch: builder.mutation<BatchResponse, CreateBatchInput>({
      query: (body) => ({
        url: "/batches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Batch"],
    }),
    updateBatch: builder.mutation<BatchResponse, { id: string; body: UpdateBatchInput }>({
      query: ({ id, body }) => ({
        url: `/batches/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Batch", { type: "Batch", id }],
    }),
    deleteBatch: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Batch"],
    }),
  }),
});

export const {
  useCreateBatchMutation,
  useDeleteBatchMutation,
  useGetBatchQuery,
  useListBatchesQuery,
  useUpdateBatchMutation,
} = batchApi;
