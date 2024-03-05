const db = require("../database/supplies.config");

const insert = async (data) => await db("tr_actual_budget").insert(data)

const getActualPerLineByYear = async (year) =>
    await db('v_actual_budget as vab')
        .select('vab.line_id', 'vab.line')
        .sum('vab.price as price')
        .where('vab.year', year)
        .groupBy('vab.line_id');

const getActualPerSectionByLine = async (year, lineId) =>
    await db('v_actual_budget as vab')
        .select('vab.cost_ctr_id', 'vab.section')
        .sum('vab.price as price')
        .where('vab.year', `${year}`)
        .andWhere('vab.line_id', lineId)
        .groupBy('vab.cost_ctr_id');

const getActualPerSectionMonthByLine = async (year, lineId) =>
    await db('v_actual_budget as vab')
        .select('vab.month', 'vab.section', 'vab.cost_ctr_id')
        .sum('vab.price as price')
        .where('vab.year', `${year}`)
        .andWhere('vab.line_id', lineId)
        .groupBy('vab.section', 'vab.month');

module.exports = {
    insert,
    getActualPerLineByYear,
    getActualPerSectionByLine,
    getActualPerSectionMonthByLine
}