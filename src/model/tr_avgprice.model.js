const db = require("../database/supplies.config");

const getAll = async () => await db.select("*").from("v_material_supplies");
const getById = async (id) =>
  await db.select("*").from("v_material_supplies").where("avg_price_id", id);
const insert = async (data) => await db("tr_average_price").insert(data);
const update = async (id, data) =>
  await db("tr_average_price").where("id", id).update(data);

const getByCode = async (materialCode) =>
  await db("v_material_supplies")
    .select("*")
    .where("material_code", `${materialCode}`)

const getAllByYear = async (year) =>
  await db("v_material_supplies").select("*").where("year", year);

const getWithPriceAvailableByYear = async (year) =>
  await db("v_material_supplies")
    .select("*")
    .where("year", year)
    .whereNotNull("average_price");

const searchByYear = async (term, year) =>
  await db("v_material_supplies")
    .select("*")
    .where("year", year)
    .andWhere((builder) => {
      builder
        .where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`);
    });

const searchWithPriceAvailableByYear = async (term, year) =>
  await db("v_material_supplies")
    .select("*")
    .where("year", year)
    .whereNotNull("average_price")
    .andWhere((builder) => {
      builder
        .where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`);
    });

const getAllByPagination = async (offset, pageSize) =>
  await db("v_material_supplies")
    .select("*")
    .offset(offset)
    .limit(pageSize)

const getByCodeAndYear = async (materialCode, year) =>
  await db("v_material_supplies")
    .select("*")
    .where("material_code", `${materialCode}`)
    .andWhere("year", `${year}`);

module.exports = {
  getAll,
  getById,
  insert,
  update,
  getByCode,
  getAllByYear,
  getWithPriceAvailableByYear,
  searchByYear,
  searchWithPriceAvailableByYear,
  getAllByPagination,
  getByCodeAndYear
};
