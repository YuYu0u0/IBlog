const express = require("express");
const router = express.Router();
const blogs = require("../controllers/blogs.js");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateBlog } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Blogs = require("../models/blog.js");

router
  .route("/")
  .get(catchAsync(blogs.index))
  .post(isLoggedIn, upload.array("image"), catchAsync(blogs.createBlog));

router.get("/new", isLoggedIn, blogs.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(blogs.showBlog))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateBlog,
    catchAsync(blogs.updateBlog)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(blogs.deleteBlog));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(blogs.renderEditForm));

module.exports = router;
