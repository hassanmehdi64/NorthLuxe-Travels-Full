import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrap } from "../lib/apiClient";

const keys = {
  toursPublic: ["tours", "public"],
  toursAdmin: ["tours", "admin"],
  blogsPublic: ["blogs", "public"],
  blogPublic: (slug) => ["blogs", "public", slug],
  blogsAdmin: ["blogs", "admin"],
  blogAdmin: (id) => ["blogs", "admin", id],
  tourPublic: (slug) => ["tours", "public", slug],
  testimonialsPublic: ["testimonials", "public"],
  testimonialsAdmin: ["testimonials", "admin"],
  bookings: ["bookings"],
  booking: (id) => ["bookings", id],
  users: ["users"],
  contacts: ["contacts"],
  galleryPublic: ["gallery", "public"],
  galleryAdmin: ["gallery", "admin"],
  settingsPublic: ["settings", "public"],
  settingsAdmin: ["settings", "admin"],
  notifications: ["notifications"],
  dashboard: ["dashboard", "overview"],
};

export const usePublicTours = () =>
  useQuery({
    queryKey: keys.toursPublic,
    queryFn: () => apiClient.get("/tours/public").then(unwrap).then((d) => d.items),
  });

export const usePublicTour = (slug) =>
  useQuery({
    queryKey: keys.tourPublic(slug),
    queryFn: () => apiClient.get(`/tours/${slug}/public`).then(unwrap).then((d) => d.item),
    enabled: Boolean(slug),
  });

export const usePublicTestimonials = () =>
  useQuery({
    queryKey: keys.testimonialsPublic,
    queryFn: () => apiClient.get("/testimonials/public").then(unwrap).then((d) => d.items),
  });

export const useAdminTestimonials = () =>
  useQuery({
    queryKey: keys.testimonialsAdmin,
    queryFn: () => apiClient.get("/testimonials").then(unwrap).then((d) => d.items),
  });

export const useCreateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient.post("/testimonials", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.testimonialsAdmin });
      qc.invalidateQueries({ queryKey: keys.testimonialsPublic });
    },
  });
};

export const useUpdateTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/testimonials/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.testimonialsAdmin });
      qc.invalidateQueries({ queryKey: keys.testimonialsPublic });
    },
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/testimonials/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.testimonialsAdmin });
      qc.invalidateQueries({ queryKey: keys.testimonialsPublic });
    },
  });
};

export const useAdminTours = () =>
  useQuery({
    queryKey: keys.toursAdmin,
    queryFn: () => apiClient.get("/tours").then(unwrap).then((d) => d.items),
  });

export const useCreateTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post("/tours", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.toursAdmin });
      qc.invalidateQueries({ queryKey: keys.toursPublic });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
};

export const useUpdateTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/tours/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.toursAdmin });
      qc.invalidateQueries({ queryKey: keys.toursPublic });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
};

export const useDeleteTour = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/tours/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.toursAdmin });
      qc.invalidateQueries({ queryKey: keys.toursPublic });
      qc.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
};

export const usePublicBlogs = () =>
  useQuery({
    queryKey: keys.blogsPublic,
    queryFn: () => apiClient.get("/blogs/public").then(unwrap).then((d) => d.items),
  });

export const usePublicBlog = (slug) =>
  useQuery({
    queryKey: keys.blogPublic(slug),
    queryFn: () => apiClient.get(`/blogs/${slug}/public`).then(unwrap).then((d) => d.item),
    enabled: Boolean(slug),
  });

export const useAdminBlogs = () =>
  useQuery({
    queryKey: keys.blogsAdmin,
    queryFn: () => apiClient.get("/blogs").then(unwrap).then((d) => d.items),
  });

export const useAdminBlog = (id) =>
  useQuery({
    queryKey: keys.blogAdmin(id),
    queryFn: () => apiClient.get(`/blogs/id/${id}`).then(unwrap).then((d) => d.item),
    enabled: Boolean(id),
  });

export const useCreateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post("/blogs", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.blogsAdmin });
      qc.invalidateQueries({ queryKey: keys.blogsPublic });
    },
  });
};

export const useUpdateBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/blogs/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.blogsAdmin });
      qc.invalidateQueries({ queryKey: keys.blogsPublic });
    },
  });
};

export const useDeleteBlog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/blogs/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.blogsAdmin });
      qc.invalidateQueries({ queryKey: keys.blogsPublic });
    },
  });
};

export const useBookings = () =>
  useQuery({
    queryKey: keys.bookings,
    queryFn: () => apiClient.get("/bookings").then(unwrap).then((d) => d.items),
  });

export const useBooking = (id) =>
  useQuery({
    queryKey: keys.booking(id),
    queryFn: () => apiClient.get(`/bookings/${id}`).then(unwrap).then((d) => d.item),
    enabled: Boolean(id),
  });

export const useCreatePublicBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient.post("/bookings/public", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.bookings });
      qc.invalidateQueries({ queryKey: keys.dashboard });
      qc.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

export const usePublicBookingQuote = () =>
  useMutation({
    mutationFn: (payload) => apiClient.post("/bookings/quote/public", payload).then(unwrap),
  });

export const useCreatePaymentIntent = () =>
  useMutation({
    mutationFn: (payload) => apiClient.post("/payments/intent", payload).then(unwrap),
  });

export const useVerifyPaymentIntent = () =>
  useMutation({
    mutationFn: (payload) => apiClient.post("/payments/verify-intent", payload).then(unwrap),
  });

export const useConfirmBookingPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post("/payments/confirm", payload).then(unwrap),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: keys.bookings });
      qc.invalidateQueries({ queryKey: keys.booking(result?.bookingId) });
      qc.invalidateQueries({ queryKey: keys.dashboard });
      qc.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

export const useUpdateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/bookings/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: keys.bookings });
      qc.invalidateQueries({ queryKey: keys.booking(item.id) });
      qc.invalidateQueries({ queryKey: keys.dashboard });
      qc.invalidateQueries({ queryKey: keys.notifications });
    },
  });
};

export const useGallery = (isPublic = false) =>
  useQuery({
    queryKey: isPublic ? keys.galleryPublic : keys.galleryAdmin,
    queryFn: () =>
      apiClient.get(isPublic ? "/gallery/public" : "/gallery").then(unwrap).then((d) => d.items),
  });

export const useCreateGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post("/gallery", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.galleryAdmin });
      qc.invalidateQueries({ queryKey: keys.galleryPublic });
    },
  });
};

export const useUpdateGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/gallery/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.galleryAdmin });
      qc.invalidateQueries({ queryKey: keys.galleryPublic });
    },
  });
};

export const useDeleteGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/gallery/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.galleryAdmin });
      qc.invalidateQueries({ queryKey: keys.galleryPublic });
    },
  });
};

export const useUsers = () =>
  useQuery({
    queryKey: keys.users,
    queryFn: () => apiClient.get("/users").then(unwrap).then((d) => d.items),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.post("/users", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/users/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users }),
  });
};

export const useContacts = () =>
  useQuery({
    queryKey: keys.contacts,
    queryFn: () => apiClient.get("/contacts").then(unwrap).then((d) => d.items),
  });

export const useCreateContact = () =>
  useMutation({
    mutationFn: (payload) => apiClient.post("/contacts/public", payload).then(unwrap).then((d) => d.item),
  });

export const useUpdateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/contacts/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.contacts }),
  });
};

export const useReplyContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }) =>
      apiClient.post(`/contacts/${id}/reply`, { message }).then(unwrap).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.contacts }),
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.contacts }),
  });
};

export const useSettings = (isPublic = false) =>
  useQuery({
    queryKey: isPublic ? keys.settingsPublic : keys.settingsAdmin,
    queryFn: () =>
      apiClient.get(isPublic ? "/settings/public" : "/settings").then(unwrap).then((d) => d.item),
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => apiClient.patch("/settings", payload).then(unwrap).then((d) => d.item),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.settingsAdmin });
      qc.invalidateQueries({ queryKey: keys.settingsPublic });
    },
  });
};

export const useNotifications = () =>
  useQuery({
    queryKey: keys.notifications,
    queryFn: () => apiClient.get("/notifications").then(unwrap).then((d) => d.items),
  });

export const useUpdateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiClient.patch(`/notifications/${id}`, payload).then(unwrap).then((d) => d.item),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch("/notifications", { markAllRead: true }).then(unwrap),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
};

export const useDashboardOverview = () =>
  useQuery({
    queryKey: keys.dashboard,
    queryFn: () => apiClient.get("/dashboard/overview").then(unwrap),
  });
