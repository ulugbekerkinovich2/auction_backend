const express = require("express");
const salesController = require("../controllers/saleController");
const isAuth = require("../middleware/is-auth.middleware");
const router = express.Router();

router.post("/", isAuth, salesController.createSale);
router.get("/", salesController.getAllSales);
// router.get("/user", isAuth, salesController.getUserAllSales);
router.get("/:id", isAuth, salesController.getSaleById);
router.put("/:id", isAuth, salesController.updateSale);
router.delete("/:id", isAuth, salesController.deleteSale);

module.exports = router;
