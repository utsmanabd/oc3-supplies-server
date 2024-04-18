const db = require("../database/supplies.config");

const getAll = async () =>
  await db
    .select("*")
    .from("mst_factory_line_cost_center")
    .where("is_removed", 0);

const getById = async (id) =>
  await db
    .select("*")
    .from("mst_factory_line_cost_center")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) =>
  await db("mst_factory_line_cost_center").insert(data);
  
const update = async (id, data) =>
  await db("mst_factory_line_cost_center").where("id", id).update(data);

const search = async (term) =>
  await db
    .select("*")
    .from("mst_factory_line_cost_center")
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(cost_ctr AS CHAR)`), "like", `%${term}%`)
        .orWhere("section", "like", `%${term}%`)
    })

const searchPagination = async (term, offset, pageSize) =>
  await db
    .select("*")
    .from("v_cost_center")
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(cost_ctr AS CHAR)`), "like", `%${term}%`)
        .orWhere("section", "like", `%${term}%`)
        .orWhere("line", "like", `%${term}%`)
        .orWhere("cctc", "like", `%${term}%`)
        .orWhere("cocd", "like", `%${term}%`)
        .orWhere("coar", "like", `%${term}%`)
        .orWhere("language", "like", `%${term}%`)
    })
    .orderBy("line", 'desc')
    .orderBy("cost_ctr")
    .offset(offset)
    .limit(pageSize)

const getSearchLength = async (term) =>
  await db('v_cost_center')
    .count("id", {as: 'total_cost_ctr'})
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where(db.raw(`CAST(cost_ctr AS CHAR)`), "like", `%${term}%`)
        .orWhere("section", "like", `%${term}%`)
        .orWhere("line", "like", `%${term}%`)
        .orWhere("cctc", "like", `%${term}%`)
        .orWhere("cocd", "like", `%${term}%`)
        .orWhere("coar", "like", `%${term}%`)
        .orWhere("language", "like", `%${term}%`)
    })
  
module.exports = {
  getAll,
  getById,
  insert,
  update,
  search,
  searchPagination,
  getSearchLength
};
