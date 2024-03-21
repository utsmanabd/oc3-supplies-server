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

const getMaterialByPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        const data = await model.getAllByPagination(offset, pageSize)
        const transformedData = Object.values(data.reduce((acc, curr) => {
            const key = `${curr.material_id}-${curr.material_code}`;
            if (!acc[key]) {
                acc[key] = { ...curr, detail_price: [] };
                delete acc[key]['year'], delete acc[key]['average_price'], delete acc[key]['avg_price_id']
            }
            acc[key].detail_price.push({
                avg_price_id: curr.avg_price_id,
                year: curr.year,
                average_price: curr.average_price
            });
            return acc;
        }, {}));
        return api.ok(res, transformedData);
    } catch (err) {
        return api.catchError(err)
    }
}




module.exports = {
    getAllAveragePrice,
    getAveragePriceById,
    insertAveragePrice,
    updateAveragePrice
}