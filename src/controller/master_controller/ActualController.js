const model = require('../../model/tr_actual.model');
const api = require('../../tools/common')
const SuppliesController = require('./SuppliesController')

const insertActualBudget = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualSuppliesByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getActualSuppliesByYearAndLine(req.params.year, req.params.line);
        if (data.length > 0) {
            let transformedData = SuppliesController.transformSuppliesViewData(data)
            transformedData.forEach(item => {
                item.average_price = +item.average_price
                item.budgeting_data.forEach(data => {
                    data.quantity = +data.quantity
                    data.price = +data.price
                })
            })
            return api.ok(res, transformedData);
        } else {
            return api.ok(res, data);
        }
    } else {
        return api.error(res, "Bad Request", 400);
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

const getProdplanByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getProdplanByYearAndLine(req.params.year, req.params.line);
        data.forEach(item => item.prodplan = +item.prodplan)
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

module.exports = {
    insertActualBudget,
    getActualSuppliesByYearAndLine,
    getActualPerLineByYear,
    getActualPerSectionByLine,
    getActualPerSectionMonthByLine,
    getProdplanByYearAndLine
}