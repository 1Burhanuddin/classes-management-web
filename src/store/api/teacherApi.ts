import { baseApi } from "./baseApi";
import type { CreateTeacherInput, PaginatedTeachers, TeacherListItem, UpdateTeacherInput } from "@/features/teachers";

type ListTeachersArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
};

type TeacherResponse = {
  teacher: TeacherListItem;
};

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listTeachers: builder.query<PaginatedTeachers, ListTeachersArgs | void>({
      query: (args) => ({
        url: "/teachers",
        params: args ?? undefined,
      }),
      providesTags: ["Teacher"],
    }),
    getTeacher: builder.query<TeacherResponse, string>({
      query: (id) => `/teachers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Teacher", id }],
    }),
    createTeacher: builder.mutation<TeacherResponse, CreateTeacherInput>({
      query: (body) => ({
        url: "/teachers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Teacher"],
    }),
    updateTeacher: builder.mutation<TeacherResponse, { id: string; body: UpdateTeacherInput }>({
      query: ({ id, body }) => ({
        url: `/teachers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Teacher", { type: "Teacher", id }],
    }),
    deleteTeacher: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teacher"],
    }),
  }),
});

export const {
  useCreateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherQuery,
  useListTeachersQuery,
  useUpdateTeacherMutation,
} = teacherApi;
