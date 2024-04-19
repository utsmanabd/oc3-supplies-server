const db = require("../database/supplies.config");

const getAll = async () =>
  await db.select("*").from("mst_factory_line").where("is_removed", 0);
  
const getById = async (id) =>
  await db
    .select("*")
    .from("mst_factory_line")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) => await db("mst_factory_line").insert(data);

const update = async (id, data) =>
  await db("mst_factory_line").where("id", id).update(data);

const searchPagination = async (term, offset, pageSize) =>
  await db("mst_factory_line")
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where("name", "like", `%${term}%`)
        .orWhere("detail", "like", `%${term}%`)
    })
    .offset(offset)
    .limit(pageSize)

const getSearchLength = async (term) => {
  const length = await db("mst_factory_line")
    .count("id", { as: 'total_line' })
    .where("is_removed", 0)
    .andWhere(builder => {
      builder.where("name", "like", `%${term}%`)
        .orWhere("detail", "like", `%${term}%`)
    })
  return +length[0].total_line
}

module.exports = {
  getAll,
  getById,
  insert,
  update,
  searchPagination,
  getSearchLength
};
