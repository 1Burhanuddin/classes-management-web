import { baseApi } from "./baseApi";
import type { CreateFeeBody, FeeListItem, ListFeesQueryInput, PaginatedFees, UpdateFeeBody } from "@/features/fees";

type FeeResponse = {
  fee: FeeListItem;
};

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listFees: builder.query<PaginatedFees, ListFeesQueryInput | undefined>({
      query: (args) => ({
        url: "/fees",
        params: args,
      }),
      providesTags: ["Fee"],
    }),
    getFee: builder.query<FeeResponse, string>({
      query: (id) => `/fees/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Fee", id }],
    }),
    createFee: builder.mutation<FeeResponse, CreateFeeBody>({
      query: (body) => ({
        url: "/fees",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Fee"],
    }),
    updateFee: builder.mutation<FeeResponse, { id: string; body: UpdateFeeBody }>({
      query: ({ id, body }) => ({
        url: `/fees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Fee", { type: "Fee", id }],
    }),
    deleteFee: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Fee"],
    }),
  }),
});

export const { useCreateFeeMutation, useDeleteFeeMutation, useGetFeeQuery, useListFeesQuery, useUpdateFeeMutation } = feeApi;
