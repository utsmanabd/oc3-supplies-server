const model = require('../../model/cost_ctr.model');
const api = require('../../tools/common')
const fs = require('fs')
const path = require("path");

const getAllCostCenter = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const searchByPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        const term = req.body.search
        const data = await model.searchPagination(term, offset, pageSize)
        const total = await model.getSearchLength(term)

        return res.json({ status: true, total_cost_ctr: total[0].total_cost_ctr, data: data })
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getCostCenterById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertCostCenter = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateCostCenter = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const searchCostCenter = async (req, res) => {
    try {
        let query = req.body.search
        let data = await model.search(query)
        return api.ok(res, data)
    } catch (err) {
        console.error(err)
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getCountriesCode = async (req, res) => {
    const filePath = path.join(__dirname, '../../../json', 'language.json')
    fs.readFile(filePath, 'utf8', (err, val) => {
        try {
            const data = JSON.parse(val)
            return api.ok(res, data)
        } catch (err) {
            return api.catchError(res, err)
        }
    })
}

module.exports = {
    getAllCostCenter,
    getCostCenterById,
    insertCostCenter,
    updateCostCenter,
    searchCostCenter,
    searchByPagination,
    getCountriesCode
}