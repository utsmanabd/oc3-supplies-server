const db = require("../database/supplies.config");

const getBudgetPerLineByYear = async (year) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.line_id', 'vsb.line')
        .sum('vsb.price as price')
        .where('vsb.year', year)
        .groupBy('vsb.line_id');

const getBudgetPerSectionByLine = async (year, lineId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.cost_ctr_id', 'vsb.section')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}%`)
        .groupBy('vsb.cost_ctr_id');

const getBudgetPerMonthByLine = async (year, lineId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.month')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}%`)
        .groupBy('vsb.month')
        .orderBy('vsb.month')

const getBudgetPerSupplyByLine = async (year, lineId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.material_desc', 'vsb.section')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}%`)
        .groupBy('vsb.budget_id');

const getTop5SuppliesByLine = async (year, lineId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.material_desc', 'vsb.section')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}%`)
        .groupBy('vsb.budget_id')
        .orderBy('price', 'desc')
        .limit(5);

const getBudgetPerSectionMonthByLine = async (year, lineId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.month', 'vsb.section')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}%`)
        .groupBy('vsb.section', 'vsb.month');

const getBudgetPerMonthBySection = async (year, lineId, costCtrId) =>
    await db('v_supplies_budgeting as vsb')
        .select('vsb.month')
        .sum('vsb.price as price')
        .where('vsb.budget_id', 'like', `%${year}-${lineId}-${costCtrId}%`)
        .groupBy('vsb.month')
        .orderBy('vsb.month')

module.exports = {
    getBudgetPerLineByYear,
    getBudgetPerSectionByLine,
    getBudgetPerMonthByLine,
    getBudgetPerSupplyByLine,
    getTop5SuppliesByLine,
    getBudgetPerSectionMonthByLine,
    getBudgetPerMonthBySection
}
