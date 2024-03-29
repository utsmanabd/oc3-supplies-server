const db = require("../database/supplies.config");

const getAll = async () =>
  await db.select("*").from("mst_calculation_budget").where("is_removed", 0);

const getById = async (id) =>
  await db
    .select("*")
    .from("mst_calculation_budget")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) => await db("mst_calculation_budget").insert(data);

const update = async (id, data) =>
  await db("mst_calculation_budget").where("id", id).update(data);

module.exports = {
  getAll,
  getById,
  insert,
  update,
};
