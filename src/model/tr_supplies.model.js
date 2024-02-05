const db = require("../database/supplies.config");

const getAll = async () =>
  await db.select("*").from("tr_supplies_budget").where("is_removed", 0);

const getById = async (id) =>
  await db
    .select("*")
    .from("tr_supplies_budget")
    .where("id", id)
    .where("is_removed", 0);

const insert = async (data) => await db("tr_supplies_budget").insert(data);

const update = async (id, data) =>
  await db("tr_supplies_budget").where("budget_id", id).update(data);

const getByYearAndLine = async (year, lineId) =>
  await db.select("*").from("v_supplies_budgeting").where("year", year).where("line_id", lineId)

const getByYearAndCostCenter = async (year, costCtrId) => 
  await db.select("*").from("v_supplies_budgeting").where("year", year).where("cost_ctr_id", costCtrId)

const getByBudgetId = async (budgetId) =>
  await db.select("*").from("v_supplies_budgeting").where("budget_id", budgetId)

module.exports = {
  getAll,
  getById,
  insert,
  update,
  getByYearAndLine,
  getByYearAndCostCenter,
  getByBudgetId
};
