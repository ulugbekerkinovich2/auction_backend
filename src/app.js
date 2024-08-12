const express = require("express");
const fileUpload = require("express-fileupload");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bidRoutes = require("./routes/bid.route");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bids", bidRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
