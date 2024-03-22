const db = require("../database/supplies.config");

const getAll = async () =>
  await db.select("*").from("mst_material_supplies").where("is_removed", 0);
  
const getById = async (id) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) => await db("mst_material_supplies").insert(data);

const update = async (id, data) =>
  await db("mst_material_supplies").where("id", id).update(data);

const getInjectAvg = async () => await db.select("*").from("inject_avg_price");

const getByCode = async (materialCode) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("material_code", materialCode)
    .where("is_removed", 0);

const getAvgPriceByCode = async (materialCode) =>
  await db("v_material_supplies")
    .select("*")
    .where("material_code", `${materialCode}`)

const updateByCode = async (code, data) =>
  await db("mst_material_supplies").where("material_code", code).update(data);

const getAllWithPriceAvailable = async () =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("is_removed", 0)
    .whereRaw("average_price IS NOT NULL")

const search = async (term) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`)
    })
  
const searchPagination = async (term, offset, pageSize) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`)
    })
    .orderBy("material_code")
    .offset(offset)
    .limit(pageSize)
    
const searchWithPriceAvailable = async (term) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("is_removed", 0)
    .whereNotNull("average_price")
    .andWhere(builder => {
      builder.where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`)
    })

const getAllByPagination = async (offset, pageSize) =>
  await db
    .select("*")
    .from("mst_material_supplies")
    .where("is_removed", 0)
    .offset(offset)
    .limit(pageSize)

const getMaterialLength = async () =>
  await db('mst_material_supplies')
    .count("id", {as: 'total_material'})
    .where("is_removed", 0)

const getMaterialSearchLength = async (term) =>
  await db('mst_material_supplies')
    .count("id", {as: 'total_material'})
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(material_code AS CHAR)`), "like", `%${term}%`)
        .orWhere("material_desc", "like", `%${term}%`)
        .orWhere("uom", "like", `%${term}%`)
    })

module.exports = {
  getAll,
  getById,
  insert,
  update,
  getInjectAvg,
  getByCode,
  updateByCode,
  getAllWithPriceAvailable,
  search,
  searchWithPriceAvailable,
  getAllByPagination,
  getAvgPriceByCode,
  getMaterialLength,
  searchPagination,
  getMaterialSearchLength
};
