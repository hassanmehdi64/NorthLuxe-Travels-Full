/**
 * Field policy: the ONE place that lists which fields each kind of caller may write.
 * Handlers copy only these keys from req.body (anything else is ignored), so a client
 * can never set server-owned fields such as passwordHash, role, paymentVerified,
 * paidAmount, rating or timestamps.
 *
 * Operator keys ($set, $inc…) are rejected earlier by middleware/rejectOperatorKeys.js.
 */

export const WRITABLE_FIELDS = Object.freeze({
  user: {
    // Any signed-in user editing their own profile.
    self: ["name", "email", "avatar", "password"],
    // An Admin editing someone else (role/status changes are further checked in the route).
    admin: ["name", "email", "avatar", "password", "role", "status"],
  },

  booking: {
    // Admin edits through PATCH /bookings/:id. Payment fields are deliberately absent:
    // payments are recorded only via POST /payments/confirm (audited) or verified providers.
    // status is NOT here: use POST /bookings/:id/transition (validated + logged + seats).
    admin: [
      "adminNote",
      "notes",
      "customItinerary",
      "designedTour",
      "travelDate",
      "travelTime",
      "endDate",
      "flexibleDates",
      "customerName",
      "email",
      "phone",
      "specialRequirements",
      "customRequirements",
    ],
  },

  tour: {
    // rating/reviewsCount are derived from reviewItems; slug handled by the route.
    editor: [
      "title",
      "slug",
      "location",
      "durationDays",
      "durationLabel",
      "price",
      "discountPercent",
      "currency",
      "image",
      "coverImage",
      "gallery",
      "shortDescription",
      "description",
      "capacity",
      "availableSeats",
      "featured",
      "status",
      "reviewItems",
      "tags",
      "itinerary",
      "places",
      "availableOptions",
    ],
  },

  blog: {
    editor: ["title", "slug", "category", "excerpt", "content", "image", "coverImage", "gallery", "authorName", "status", "featured", "publishedAt"],
  },

  testimonial: {
    editor: ["name", "role", "city", "country", "avatar", "photo", "message", "rating", "featured", "reviewDate", "date", "status"],
  },

  galleryItem: {
    editor: ["title", "category", "url", "alt", "status", "sortOrder"],
  },

  contactMessage: {
    // Public contact form.
    public: ["sender", "email", "phone", "subject", "message"],
    // Admin triage. Replies are appended only through POST /contacts/:id/reply.
    admin: ["status", "urgency"],
  },

  notification: {
    admin: ["isRead"],
  },
});

/** Copy only the allowed own keys of `source` into a fresh plain object. */
export const pickWritable = (source, allowed) => {
  const result = {};
  if (!source || typeof source !== "object") return result;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
};
