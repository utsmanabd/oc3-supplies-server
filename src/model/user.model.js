const db = require("../database/supplies.config");

const getAll = async () => await db.select("*").from("users");

const getByNik = async (nik) =>
  await db.select("*").from("users").where("nik", nik);

const insert = async (data) => await db("mst_user").insert(data);

const update = async (id, data) =>
  await db("mst_user").where("user_id", id).update(data);

const getRole = async () => await db.select("*").from("mst_user_role");

module.exports = {
  getAll,
  getByNik,
  insert,
  update,
  getRole,
};
