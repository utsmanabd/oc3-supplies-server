const db = require("../database/supplies.config");

const getAll = async () => await db.select("*").from("users");

const getByNik = async (nik) =>
  await db.select("*").from("users").where("nik", nik);

const getById = async (id) =>
  await db.select("*").from("users").where("user_id", id);

const insert = async (data) => await db("mst_user").insert(data);

const update = async (id, data) =>
  await db("mst_user").where("user_id", id).update(data);

const deleteData = async (id) => await db("mst_user").where("user_id", id).delete()

const getRole = async () => await db.select("*").from("mst_user_role");

const searchPagination = async (term, offset, pageSize) =>
  await db("users")
    .select("*")
    .where(builder => {
      builder.where("nik", "like", `%${term}%`)
      .orWhere("name", "like", `%${term}%`)
      .orWhere("email", "like", `%${term}%`)
      .orWhere("role_name", "like", `%${term}%`)
    })
    .orderBy("role_name")
    .orderBy("created_at")
    .offset(offset)
    .limit(pageSize);

const getSearchLength = async (term) => {
  const result = await db("users")
  .count("user_id", { as: 'total_user' })
  .where(builder => {
    builder.where("nik", "like", `%${term}%`)
    .orWhere("name", "like", `%${term}%`)
    .orWhere("email", "like", `%${term}%`)
    .orWhere("role_name", "like", `%${term}%`)
  })
  return +result[0].total_user
}

module.exports = {
  getAll,
  getByNik,
  getById,
  insert,
  update,
  deleteData,
  getRole,
  searchPagination,
  getSearchLength,
};
