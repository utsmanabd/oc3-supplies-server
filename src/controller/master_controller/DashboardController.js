const model = require('../../model/dashboard.model');
const api = require('../../tools/common')

const getBudgetPerLineByYear = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        let data = await model.getBudgetPerLineByYear(year);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getBudgetPerSectionByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getBudgetPerSectionByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getBudgetPerMonthByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getBudgetPerMonthByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getBudgetPerSupplyByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getBudgetPerSupplyByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getTop5SuppliesByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getTop5SuppliesByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getBudgetPerSectionMonthByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getBudgetPerSectionMonthByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getBudgetPerMonthBySection = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        const costCenterId = parseInt(req.query.costCenterId) || 0;
        let data = await model.getBudgetPerMonthBySection(year, lineId, costCenterId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

module.exports = {
    getBudgetPerLineByYear,
    getBudgetPerSectionByLine,
    getBudgetPerMonthByLine,
    getBudgetPerSupplyByLine,
    getTop5SuppliesByLine,
    getBudgetPerSectionMonthByLine,
    getBudgetPerMonthBySection
}