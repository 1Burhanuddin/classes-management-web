import { baseApi } from "./baseApi";
import type { ClassListItem, CreateClassInput, PaginatedClasses, UpdateClassInput } from "@/features/classes";

type ListClassesArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
};

type ClassResponse = {
  class: ClassListItem;
};

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listClasses: builder.query<PaginatedClasses, ListClassesArgs | void>({
      query: (args) => ({
        url: "/classes",
        params: args ?? undefined,
      }),
      providesTags: ["Class"],
    }),
    getClass: builder.query<ClassResponse, string>({
      query: (id) => `/classes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Class", id }],
    }),
    createClass: builder.mutation<ClassResponse, CreateClassInput>({
      query: (body) => ({
        url: "/classes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Class"],
    }),
    updateClass: builder.mutation<ClassResponse, { id: string; body: UpdateClassInput }>({
      query: ({ id, body }) => ({
        url: `/classes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Class", { type: "Class", id }],
    }),
    deleteClass: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Class"],
    }),
  }),
});

export const {
  useCreateClassMutation,
  useDeleteClassMutation,
  useGetClassQuery,
  useListClassesQuery,
  useUpdateClassMutation,
} = classApi;
