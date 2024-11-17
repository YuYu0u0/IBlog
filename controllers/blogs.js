const Blog = require("../models/blog");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const blogs = await Blog.find({});
  res.render("blogs/index", { blogs });
};

module.exports.renderNewForm = (req, res) => {
  res.render("blogs/new");
};

module.exports.createBlog = async (req, res, next) => {
  const blog = new Blog(req.body.blog);
  blog.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  blog.author = req.user._id;
  blog.time = Date.now();
  await blog.save();
  console.log(blog);
  req.flash("success", "Successfully made a new blog!");
  res.redirect(`/blogs/${blog._id}`);
};

module.exports.showBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!blog) {
    req.flash("error", "Cannot find that blog!");
    return res.redirect("/blogs");
  }
  res.render("blogs/show", { blog });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    req.flash("error", "Cannot find that blog!");
    return res.redirect("/blogs");
  }
  res.render("blogs/edit", { blog });
};

module.exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  blog.images.push(...imgs);
  await blog.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await blog.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated blog!");
  res.redirect(`/blogs/${blog._id}`);
};

module.exports.deleteBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    req.flash("error", "Blog not found!");
    return res.redirect("/blogs");
  }
  for (let image of blog.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  await Blog.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted blog");
  res.redirect("/blogs");
};
