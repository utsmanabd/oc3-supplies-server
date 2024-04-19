const model = require('../../model/plant.model');
const api = require('../../tools/common')

const getAllFactoryPlant = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getFactoryPlantById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertFactoryPlant = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const updateFactoryPlant = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

module.exports = {
    getAllFactoryPlant,
    getFactoryPlantById,
    insertFactoryPlant,
    updateFactoryPlant
}