import { baseApi } from "./baseApi";
import type {
  AttendanceListItem,
  CreateAttendanceInput,
  ListAttendanceQueryInput,
  PaginatedAttendance,
  UpdateAttendanceInput,
} from "@/features/attendance";

type AttendanceResponse = {
  attendance: AttendanceListItem;
};

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAttendance: builder.query<PaginatedAttendance, ListAttendanceQueryInput | undefined>({
      query: (args) => ({
        url: "/attendance",
        params: args,
      }),
      providesTags: ["Attendance"],
    }),
    getAttendance: builder.query<AttendanceResponse, string>({
      query: (id) => `/attendance/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Attendance", id }],
    }),
    createAttendance: builder.mutation<AttendanceResponse, CreateAttendanceInput>({
      query: (body) => ({
        url: "/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),
    updateAttendance: builder.mutation<AttendanceResponse, { id: string; body: UpdateAttendanceInput }>({
      query: ({ id, body }) => ({
        url: `/attendance/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Attendance", { type: "Attendance", id }],
    }),
    deleteAttendance: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const {
  useCreateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAttendanceQuery,
  useListAttendanceQuery,
  useUpdateAttendanceMutation,
} = attendanceApi;
