import { baseApi } from "./baseApi";
import type {
  AssignmentListItem,
  CreateAssignmentInput,
  ListAssignmentsQueryInput,
  PaginatedAssignments,
  UpdateAssignmentInput,
} from "@/features/assignments";

type AssignmentResponse = {
  assignment: AssignmentListItem;
};

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAssignments: builder.query<PaginatedAssignments, ListAssignmentsQueryInput | undefined>({
      query: (args) => ({
        url: "/assignments",
        params: args,
      }),
      providesTags: ["Assignment"],
    }),
    getAssignment: builder.query<AssignmentResponse, string>({
      query: (id) => `/assignments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Assignment", id }],
    }),
    createAssignment: builder.mutation<AssignmentResponse, CreateAssignmentInput>({
      query: (body) => ({
        url: "/assignments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assignment"],
    }),
    updateAssignment: builder.mutation<AssignmentResponse, { id: string; body: UpdateAssignmentInput }>({
      query: ({ id, body }) => ({
        url: `/assignments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Assignment", { type: "Assignment", id }],
    }),
    deleteAssignment: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentQuery,
  useListAssignmentsQuery,
  useUpdateAssignmentMutation,
} = assignmentApi;
