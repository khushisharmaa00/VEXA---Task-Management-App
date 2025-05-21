import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiUrl = import.meta.env.VITE_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: apiUrl,
  prepareHeaders: (headers, { endpoint }) => {
    // Only add JSON content-type for non-multipart endpoints
    if (endpoint !== "createTask") {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
  credentials: "include", // Only if using cookies
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Task", "User", "Notification"],
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => ({
        url: "/api/task?isTrashed=false",
        ...(params?.stage && { stage: params.stage }),
      }),
      providesTags: ["Task"],
    }),
    getTrashedTasks: builder.query({
      query: () => ({
        url: "/api/task?isTrashed=true",
      }),
      providesTags: ["Task"],
    }),
    searchTasks: builder.query({
      query: (query) => `/api/task/search?q=${query}`,
      // Keep fresh data
      keepUnusedDataFor: 0,
    }),

    createTask: builder.mutation({
      query: (formData) => ({
        url: "/api/task/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Task"],
    }),
    trashTask: builder.mutation({
      query: (id) => ({
        url: `/api/task/${id}/trash`,
        method: "PUT",
      }),
      invalidatesTags: ["Task"],
    }),
    restoreTask: builder.mutation({
      query: (id) => ({
        url: `/api/task/${id}/restore`,
        method: "PUT",
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...taskData }) => ({
        url: `/api/task/update/${id}`,
        method: "PUT",
        body: taskData,
      }),
      invalidatesTags: ["Task"],
    }),
    getTask: builder.query({
      query: (id) => `/api/task/${id}`,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),
    duplicateTask: builder.mutation({
      query: (id) => ({
        url: `/api/task/duplicate/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Task"],
    }),
    createSubTask: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/task/create-subtask/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Task", id }],
    }),
    postTaskActivity: builder.mutation({
      query: ({ id, ...activityData }) => ({
        url: `/api/task/activity/${id}`,
        method: "POST",
        body: activityData,
      }),
      invalidatesTags: ["Task"],
    }),
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: "/api/users/change-password",
        method: "PUT",
        body: passwordData,
      }),
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/api/users/update-profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),

    activateUserProfile: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    createUser: builder.mutation({
      query: (userData) => {
        console.log("Data being sent to API:", userData);
        return {
          url: "/api/users/add-user",
          method: "POST",
          body: userData,
        };
      },
      invalidatesTags: ["User"],
    }),
    getTeamList: builder.query({
      query: () => "/api/users/get-team",
      providesTags: ["User"],
    }),
    getNotifications: builder.query({
      query: () => "/api/users/notifications",
      providesTags: ["Notification"],
    }),
    markNotificationRead: builder.mutation({
      query: ({ id, type }) => ({
        url: "/api/users/read-noti",
        method: "PUT",
        params: { isReadType: type, id },
      }),
      invalidatesTags: ["Notification"],
    }),
    getCalendarTasks: builder.query({
      query: ({ start, end }) => ({
        url: "/api/task/calendar",
        method: "GET",
        params: { start, end },
      }),
      providesTags: ["Task"],
    }),

    updateTaskDates: builder.mutation({
      query: ({ id, ...dates }) => ({
        url: `/api/task/calendar/${id}`,
        method: "PATCH",
        body: dates,
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useSearchTasksQuery,
  useGetCalendarTasksQuery,
  useUpdateTaskDatesMutation,
  useGetTasksQuery,
  useGetTrashedTasksQuery,
  useGetTaskQuery,
  useRestoreTaskMutation,
  useTrashTaskMutation,
  useUpdateTaskMutation,
  useDuplicateTaskMutation,
  useUpdateProfileMutation,
  useCreateSubTaskMutation,
  useChangePasswordMutation,
  useActivateUserProfileMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useGetTeamListQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  usePostTaskActivityMutation,
} = apiSlice;
