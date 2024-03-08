const model = require('../../model/tr_prodplan.model');
const api = require('../../tools/common')

const getAllProdplan = async (req, res) => {
    try {
        let data = await model.getAll();
        data.forEach(item => item.prodplan = +item.prodplan)
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getProdplanById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        data.forEach(item => item.prodplan = +item.prodplan)
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getProdplanByYear = async (req, res) => {
    if (!isNaN(req.params.year)) {
        let data = await model.getByYear(req.params.year);
        data.forEach(item => item.prodplan = +item.prodplan)
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getProdplanByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getByYearAndLine(req.params.year, req.params.line);
        data.forEach(item => item.prodplan = +item.prodplan)
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

const isProdplanExists = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getByYearAndLine(req.params.year, req.params.line);
        if (data.length > 0) {
            return res.status(200).json({
                is_available: false,
                message: `Prodplan already exists!`
            })
        } 
        return res.status(200).json({
            is_available: true,
            message: `Prodplan available!`
        });
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

module.exports = {
    getAllProdplan,
    getProdplanById,
    insertProdplan,
    updateProdplan,
    getProdplanGroupYears,
    getProdplanByYear,
    getProdplanByYearAndLine,
    isProdplanExists
}