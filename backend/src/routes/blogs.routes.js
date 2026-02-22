import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { Blog } from "../models/Blog.js";
import { slugify } from "../utils/slugify.js";

const router = express.Router();

const toBlogResponse = (blog) => ({
  id: blog._id,
  title: blog.title,
  slug: blog.slug,
  category: blog.category,
  excerpt: blog.excerpt,
  content: blog.content,
  image: blog.coverImage,
  gallery: blog.gallery,
  author: blog.authorName,
  status: blog.status,
  featured: blog.featured,
  views: blog.views,
  date: (blog.publishedAt || blog.createdAt).toISOString(),
  publishedAt: blog.publishedAt,
  createdAt: blog.createdAt,
  updatedAt: blog.updatedAt,
});

router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const { category, q } = req.query;
    const query = { status: "published" };
    if (category && category !== "All") query.category = category;
    if (q) query.$text = { $search: q };
    const blogs = await Blog.find(query).sort({ publishedAt: -1, createdAt: -1 });
    res.json({ items: blogs.map(toBlogResponse) });
  }),
);

router.get(
  "/:slug/public",
  asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    blog.views += 1;
    await blog.save();
    res.json({ item: toBlogResponse(blog) });
  }),
);

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ items: blogs.map(toBlogResponse) });
  }),
);

router.get(
  "/id/:id",
  asyncHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ item: toBlogResponse(blog) });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const title = payload.title?.trim();
    if (!title) return res.status(400).json({ message: "Title is required" });

    const baseSlug = slugify(payload.slug || title);
    let slug = baseSlug;
    let n = 1;
    while (await Blog.exists({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const status = payload.status || "draft";
    const blog = await Blog.create({
      title,
      slug,
      category: payload.category || "Guides",
      excerpt: payload.excerpt || "",
      content: payload.content || "",
      coverImage: payload.image || payload.coverImage || "",
      gallery: payload.gallery || [],
      status,
      featured: Boolean(payload.featured),
      authorName: payload.author || "Admin",
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json({ item: toBlogResponse(blog) });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const update = {
      ...payload,
      coverImage: payload.image || payload.coverImage,
    };
    delete update.image;
    if (payload.title && !payload.slug) update.slug = slugify(payload.title);
    if (payload.status === "published") update.publishedAt = new Date();

    const blog = await Blog.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ item: toBlogResponse(blog) });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.status(204).send();
  }),
);

export default router;
