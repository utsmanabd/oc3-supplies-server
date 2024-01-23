const model = require('../../model/tr_prodplan.model');
const api = require('../../tools/common')

const getAllProdplan = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getProdplanById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getProdplanByYear = async (req, res) => {
    if (!isNaN(req.params.year)) {
        let data = await model.getByYear(req.params.year);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getProdplanGroupYears = async (req, res) => {
    try {
        let data = await model.getGroupYears();
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const insertProdplan = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateProdplan = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

module.exports = {
    getAllProdplan,
    getProdplanById,
    insertProdplan,
    updateProdplan,
    getProdplanGroupYears,
    getProdplanByYear
}