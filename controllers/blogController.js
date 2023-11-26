const controller = {};
const models = require("../models");

const limit = 4;

controller.showList = async (req, res) => {
  const searchQuery = req.query?.q ?? "";

  const page = req.query.page ? parseInt(req.query.page) : 1;
  res.locals.currentPage = page;

  const query = {
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [{ model: models.Comment }],
  };

  if (searchQuery) {
    query["where"] = {
      title: { [models.Sequelize.Op.like]: `%${searchQuery}%` },
    };
  }

  query.limit = limit;
  query.offset = (page - 1) * limit;

  res.locals.blogs = await models.Blog.findAll(query);

  const countQuery = {
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [],
  };

  if (searchQuery) {
    countQuery["where"] = {
      title: { [models.Sequelize.Op.like]: `%${searchQuery}%` },
    };
  }

  const { count, rows } = await models.Blog.findAndCountAll(countQuery);
  const totalPages = Math.ceil(count / limit);

  if (res.locals.currentPage > 1) {
    res.locals.hasPrevPage = true;
    res.locals.prevPage = page - 1;
  }

  if (res.locals.currentPage < totalPages) {
    res.locals.hasNextPage = true;
    res.locals.nextPage = page + 1;
  }

  res.locals.totalPages = Array.from({ length: totalPages }, (_, index) => ({
    value: index + 1,
    active: page === index + 1,
    hasQuery: searchQuery !== "",
    q: searchQuery,
  }));

  res.render("index");
};

controller.showDetails = async (req, res) => {
  let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  res.locals.blog = await models.Blog.findOne({
    attributes: ["id", "title", "description", "createdAt"],
    where: { id: id },
    include: [
      { model: models.Category },
      { model: models.User },
      { model: models.Tag },
      { model: models.Comment },
    ],
  });
  res.render("details");
};

controller.showListByCategory = async (req, res) => {
  const category = req.params?.category ?? "";

  const page = req.query.page ? parseInt(req.query.page) : 1;
  res.locals.currentPage = page;

  if (!category) return res.redirect("/blogs");

  res.locals.blogs = await models.Blog.findAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [
      {
        model: models.Comment,
      },
      {
        model: models.Category,
        where: { name: category },
      },
    ],
    limit: limit,
    offset: (page - 1) * limit,
  });

  const { count, rows } = await models.Blog.findAndCountAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [
      {
        model: models.Category,
        where: { name: category },
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  if (res.locals.currentPage > 1) {
    res.locals.hasPrevPage = true;
    res.locals.prevPage = page - 1;
  }

  if (res.locals.currentPage < totalPages) {
    res.locals.hasNextPage = true;
    res.locals.nextPage = page + 1;
  }

  res.locals.totalPages = Array.from({ length: totalPages }, (_, index) => ({
    value: index + 1,
    active: page === index + 1,
  }));

  res.render("index");
};

controller.showListByTag = async (req, res) => {
  const tag = req.params?.tag ?? "";

  const page = req.query.page ? parseInt(req.query.page) : 1;
  res.locals.currentPage = page;

  if (!tag) return res.redirect("/blogs");

  res.locals.blogs = await models.Blog.findAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [
      { model: models.Comment },
      {
        model: models.Tag,
        where: { name: tag },
      },
    ],
    limit: limit,
    offset: (page - 1) * limit,
  });

  const { count, rows } = await models.Blog.findAndCountAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [
      {
        model: models.Tag,
        where: { name: tag },
      },
    ],
  });

  const totalPages = Math.ceil(count / limit);

  if (res.locals.currentPage > 1) {
    res.locals.hasPrevPage = true;
    res.locals.prevPage = page - 1;
  }

  if (res.locals.currentPage < totalPages) {
    res.locals.hasNextPage = true;
    res.locals.nextPage = page + 1;
  }

  res.locals.totalPages = Array.from({ length: totalPages }, (_, index) => ({
    value: index + 1,
    active: page === index + 1,
  }));

  res.render("index");
};

controller.countCategories = async (req, res, next) => {
  const query = {
    model: models.Blog,
    attributes: [],
  };

  // const searchQuery = req.query?.q ?? '';

  // if (searchQuery) {
  //   query['where'] = {
  //     title: { [models.Sequelize.Op.like]: `%${searchQuery}%` },
  //   };
  // }

  const categories = await models.Category.findAll({
    attributes: [
      "id",
      "name",
      [models.Sequelize.fn("COUNT", "blogs.id"), "count"],
    ],
    include: [query],
    group: ["Category.id"],
    order: [[models.sequelize.literal("name"), "ASC"]],
  });

  res.locals.categories = categories.map((c) => ({
    name: c.name,
    count: c.getDataValue("count"),
  }));

  next();
};

controller.getTags = async (req, res, next) => {
  res.locals.tags = await models.Tag.findAll({
    attributes: ["id", "name"],
    order: [[models.sequelize.literal("name"), "ASC"]],
  });

  next();
};

module.exports = controller;
