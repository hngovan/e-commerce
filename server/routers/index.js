const userRouter = require("./user.route");
const productRouter = require("./product.route");
const categoryRouter = require("./category.route");
const { notFound, errHandler } = require("../middlewares/errHandler");

const initRouter = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/category", categoryRouter);

  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRouter;
