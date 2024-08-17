const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bidRoutes = require("./routes/bid.route");
const usersRoutes = require("./routes/usersRoute");
const saleRoutes = require("./routes/saleRoutes");
const userStatisticsRouter = require("./routes/statisticsRoute");

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors({ origin: "*" }));

// Serve static files from the "public" directory
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(`${process.cwd()}/uploads`));
// app.use(express.static(`${process.cwd()}/output`));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/all-users", usersRoutes);
app.use("/api/sale", saleRoutes);
app.use("/api/user-statistics", userStatisticsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
