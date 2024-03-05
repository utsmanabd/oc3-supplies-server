const model = require('../../model/tr_actual.model');
const api = require('../../tools/common')

const insertActualBudget = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerLineByYear = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        let data = await model.getActualPerLineByYear(year);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerSectionByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getActualPerSectionByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerSectionMonthByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getActualPerSectionMonthByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

module.exports = {
    insertActualBudget,
    getActualPerLineByYear,
    getActualPerSectionByLine,
    getActualPerSectionMonthByLine
}