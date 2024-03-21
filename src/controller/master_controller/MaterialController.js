const model = require('../../model/material.model');
const api = require('../../tools/common')

const getAllMaterial = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getMaterialById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertMaterial = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateMaterial = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getMaterialWithPriceAvailable = async (req, res) => {
    try {
        let data = await model.getAllWithPriceAvailable()
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const searchMaterial = async (req, res) => {
    try {
        let query = req.body.search
        let data = await model.search(query)
        return api.ok(res, data)
    } catch (err) {
        console.error(err)
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const searchMaterialByPagination = async (req, res) => {
    try {
        const totalMaterial = await model.getMaterialLength()
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 25;
        const offset = (page - 1) * pageSize;
        let term = req.body.search

        let data = await model.search(term, offset, pageSize)

        const getAvgPrice = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    let avgPrice = await model.getAvgPriceByCode(item.material_code)
                    item.detail_price = []
                    avgPrice.forEach((price) => {
                        item.detail_price.push({
                            year: price.year || null,
                            avg_price_id: price.avg_price_id || null,
                            average_price: +price.average_price || null
                        })
                    })
                    delete item['average_price']
                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        } 

        getAvgPrice().then(() => {
            return res.json({
                status: true,
                total_material: totalMaterial[0].total_material,
                data: data
            })
        })
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
        
        const getAvgPrice = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    let avgPrice = await model.getAvgPriceByCode(item.material_code)
                    item.detail_price = []
                    avgPrice.forEach((price) => {
                        item.detail_price.push({
                            year: price.year || null,
                            avg_price_id: price.avg_price_id || null,
                            average_price: +price.average_price || null
                        })
                    })
                    delete item['average_price']
                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        } 

        const totalMaterial = await model.getMaterialLength()

        getAvgPrice().then(() => {
            return res.json({
                status: true,
                total_material: totalMaterial[0].total_material,
                data: data
            })
        })
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

// test commit

module.exports = {
    getAllMaterial,
    getMaterialById,
    insertMaterial,
    updateMaterial,
    getMaterialWithPriceAvailable,
    searchMaterial,
    getMaterialByPagination,
    searchMaterialByPagination
}