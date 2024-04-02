const model = require("../../model/tr_avgprice.model")
const api = require("../../tools/common")

const getAllAveragePrice = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(err)
    }
}

const getAveragePriceById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertAveragePrice = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(err)
    }
}

const updateAveragePrice = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(err)
    }
}

const updateMultipleAvgPrice = async (req, res) => {
    try {
        let data = req.body.form_data
        const beginUpdate = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    await model.update(item.id, item.data)
                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }
        await beginUpdate().then(() => {
            return api.ok(res, data)
        })
    } catch (err) {
        return api.catchError(err)
    }
}

const getAveragePriceByMaterialCode = async (req, res) => {
    try {
        let data = await model.getByCode(req.params.code)
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(err)
    }
}

const searchMaterialByYear = async (req, res) => {
    try {
        let query = req.body.search
        let data = await model.searchByYear(query, req.params.year)
        return api.ok(res, data)
    } catch (err) {
        console.error(err)
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getAveragePriceByCodeAndYear = async (req, res) => {
    try {
        let materialCode = parseInt(req.query.code) || 0
        let year = parseInt(req.query.year) || 0
        let data = await model.getByCodeAndYear(materialCode, year)
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

module.exports = {
    getAllAveragePrice,
    getAveragePriceById,
    getAveragePriceByCodeAndYear,
    insertAveragePrice,
    updateAveragePrice,
    updateMultipleAvgPrice
}