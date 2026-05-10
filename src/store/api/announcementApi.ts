import { baseApi } from "./baseApi";
import type {
  AnnouncementListItem,
  CreateAnnouncementBody,
  ListAnnouncementsQueryInput,
  PaginatedAnnouncements,
  UpdateAnnouncementBody,
} from "@/features/announcements";

type AnnouncementResponse = {
  announcement: AnnouncementListItem;
};

export const announcementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAnnouncements: builder.query<PaginatedAnnouncements, ListAnnouncementsQueryInput | undefined>({
      query: (args) => ({
        url: "/announcements",
        params: args,
      }),
      providesTags: ["Announcement"],
    }),
    getAnnouncement: builder.query<AnnouncementResponse, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Announcement", id }],
    }),
    createAnnouncement: builder.mutation<AnnouncementResponse, CreateAnnouncementBody>({
      query: (body) => ({
        url: "/announcements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Announcement"],
    }),
    updateAnnouncement: builder.mutation<AnnouncementResponse, { id: string; body: UpdateAnnouncementBody }>({
      query: ({ id, body }) => ({
        url: `/announcements/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Announcement", { type: "Announcement", id }],
    }),
    deleteAnnouncement: builder.mutation<{ deleted: { id: string } }, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcement"],
    }),
  }),
});

export const {
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementQuery,
  useListAnnouncementsQuery,
  useUpdateAnnouncementMutation,
} = announcementApi;
