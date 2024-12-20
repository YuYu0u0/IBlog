const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  validateComment,
  isLoggedIn,
  isCommentAuthor,
} = require("../middleware");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const comments = require("../controllers/comments");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");

router.post(
  "/",
  isLoggedIn,
  validateComment,
  catchAsync(comments.createComment)
);

router.delete(
  "/:commentId",
  isLoggedIn,
  isCommentAuthor,
  catchAsync(comments.deleteComment)
);

module.exports = router;
