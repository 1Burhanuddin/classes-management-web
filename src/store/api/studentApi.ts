import { baseApi } from "./baseApi";
import type { CreateStudentInput, PaginatedStudents, StudentListItem, UpdateStudentInput } from "@/features/students";

type ListStudentsArgs = {
  page?: number;
  pageSize?: number;
  search?: string;
  batchId?: string;
};

type StudentResponse = {
  student: StudentListItem;
};

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listStudents: builder.query<PaginatedStudents, ListStudentsArgs | void>({
      query: (args) => ({
        url: "/students",
        params: args ?? undefined,
      }),
      providesTags: ["Student"],
    }),
    getStudent: builder.query<StudentResponse, string>({
      query: (id) => `/students/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Student", id }],
    }),
    createStudent: builder.mutation<StudentResponse, CreateStudentInput>({
      query: (body) => ({
        url: "/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Student"],
    }),
    updateStudent: builder.mutation<StudentResponse, { id: string; body: UpdateStudentInput }>({
      query: ({ id, body }) => ({
        url: `/students/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Student", { type: "Student", id }],
    }),
    deleteStudent: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Student"],
    }),
  }),
});

export const {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentQuery,
  useListStudentsQuery,
  useUpdateStudentMutation,
} = studentApi;
