const model = require('../../model/line.model');
const api = require('../../tools/common')

const getAllLine = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getLineById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertLine = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const updateLine = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
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

        return res.json({ status: true, total_line: total, data: data })
    } catch (err) {
        return api.catchError(res, err)
    }
}

module.exports = {
    getAllLine,
    getLineById,
    insertLine,
    updateLine,
    searchByPagination
}