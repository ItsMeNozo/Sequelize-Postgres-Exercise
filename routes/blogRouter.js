const express = require("express");
const router = express.Router();
const controller = require("../controllers/blogController");

router.get("/", controller.countCategories, controller.getTags, controller.showList);
router.get("/category/:category?", controller.countCategories, controller.getTags, controller.showListByCategory);
router.get("/tag/:tag?", controller.countCategories, controller.getTags, controller.showListByTag);
router.get("/:id", controller.countCategories, controller.getTags, controller.showDetails);

module.exports = router;
