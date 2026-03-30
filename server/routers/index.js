const userRouter = require("./user.route");
const { notFound, errHandler } = require("../middlewares/errHandler");

const initRouter = (app) => {
  app.use("/api/user", userRouter);

  // QUAN TRỌNG: Hai cái hứng lỗi này PHẢI nằm ở cuối cùng, sau khi đã khai báo hết các routes hợp lệ
  app.use(notFound); // Nếu chạy qua hết các route trên mà không khớp, sẽ rơi vào đây
  app.use(errHandler); // Hứng mọi lỗi được throw ra từ toàn bộ hệ thống
};

module.exports = initRouter;
