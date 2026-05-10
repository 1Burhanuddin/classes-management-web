import { baseApi } from "./baseApi";

type CurrentUserResponse = {
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useGetCurrentUserQuery } = authApi;
