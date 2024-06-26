const model = require('../../model/calculation.model');
const api = require('../../tools/common')

const getAllCalculation = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getCalculationById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertCalculation = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const updateCalculation = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

module.exports = {
    getAllCalculation,
    getCalculationById,
    insertCalculation,
    updateCalculation
}