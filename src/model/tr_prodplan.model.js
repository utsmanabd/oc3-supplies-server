const db = require("../database/supplies.config");

const getAll = async () =>
  await db.select("*").from("tr_prodplan").where("is_removed", 0);

const getById = async (id) =>
  await db
    .select("*")
    .from("tr_prodplan")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) => await db("tr_prodplan").insert(data);

const update = async (id, data) =>
  await db("tr_prodplan").where("id", id).update(data);

const getGroupYears = async () => await db.select("*").from("v_prodplan_year");

const getByYear = async (year) =>
  await db
    .select("*")
    .from("tr_prodplan")
    .where("year", year)
    .where("is_removed", 0)
    .orderByRaw("length(`month`), `month`");

const getByYearAndLine = async (year, lineId) =>
  await db
    .select("*")
    .from("tr_prodplan")
    .where("year", year)
    .where("line_id", lineId)
    .where("is_removed", 0)
    .orderByRaw("length(`month`), `month`");

const getByDate = async (month, year) =>
  await db
    .select("*")
    .from("tr_prodplan")
    .where("month", month)
    .where("year", year)
    .where("is_removed", 0);

const getByDateAndLine = async (month, year, lineId) =>
  await db
    .select("*")
    .from("tr_prodplan")
    .where("year", year)
    .where("month", month)
    .where("line_id", lineId)
    .where("is_removed", 0);

const insertActual = async (data) => await db("tr_actual_prodplan").insert(data)
const updateActual = async (id, data) => await db("tr_actual_prodplan").where("id", id).update(data)

module.exports = {
  getAll,
  getById,
  insert,
  update,
  getGroupYears,
  getByYear,
  getByDate,
  getByYearAndLine,
  getByDateAndLine,
  insertActual,
  updateActual
};
