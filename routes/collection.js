const router = require("express").Router();
const { Collections } = require("../models");
const { validateToken } = require("../middlewares/auth.middleware.js");
const { sequelize } = require("../models/index");

router.get("/", async (req, res) => {
  const collections = await Collections.findAll();
  return res.json(collections);
});

router.get("/byitemCount/largest", async (req, res) => {
  const collections = await Collections.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM Items
                  WHERE
                    Items.CollectionId = Collections.id
              )`),
          "itemCount",
        ],
      ],
    },
    limit: 5,
    order: [["itemCount", "DESC"]],
  });
  return res.json(collections);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const colection = await Collections.findByPk(id);
  return res.json(colection);
});

router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id;
  const userColections = await Collections.findAll({
    where: { UserId: id },
    attributes: {
      include: [
        [
          sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM Items
                  WHERE
                    Items.CollectionId = Collections.id
              )`),
          "itemCount",
        ],
      ],
    },
  });
  return res.json(userColections);
});

router.put("/:id/edit", validateToken, async (req, res) => {
  const collection = req.body;
  const id = req.params.id;
  await Collections.update(collection, { where: { id: id } });
  res.json(collection);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Collections.destroy({ where: { id: id } });
  res.json("Collection deleted");
});

module.exports = router;
