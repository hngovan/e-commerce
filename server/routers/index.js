const userRouter = require("./user.route");
const productRouter = require("./product.route");
const categoryRouter = require("./category.route");
const blogCategoryRouter = require("./blogCategory.route");
const { notFound, errHandler } = require("../middlewares/errHandler");

const initRouter = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/blog-category", blogCategoryRouter);

  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRouter;
