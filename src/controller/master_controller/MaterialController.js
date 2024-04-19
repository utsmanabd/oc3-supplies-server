const model = require('../../model/material.model');
const api = require('../../tools/common')

const getAllMaterial = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getAllUOM = async (req, res) => {
    try {
        await model.getAll().then(data => {
            let uomData = api.getUniqueData(data, 'uom').map(i => i.uom)
            return api.ok(res, uomData)
        })
    } catch (err) {
        return api.catchError(res, err)
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
        return api.catchError(res, err)
    }
}

const updateMaterial = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getMaterialWithPriceAvailable = async (req, res) => {
    try {
        let data = await model.getAllWithPriceAvailable()
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const searchMaterial = async (req, res) => {
    try {
        let query = req.body.search
        let data = await model.search(query)
        return api.ok(res, data)
    } catch (err) {
        return api.catchError(res, err)
    }
}

const searchMaterialByPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const term = req.body.search
        const data = await model.searchPagination(term, offset, pageSize)
        const mergedData = await mergeAvgPrice(data)
        const total = await model.getMaterialSearchLength(term)

        return res.json({ status: true, total_material: total, data: mergedData })
    } catch (err) {
        return api.catchError(res, err)
    }    
}

const getMaterialByPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const data = await model.getAllByPagination(offset, pageSize)
        const mergedData = await mergeAvgPrice(data)
        const total = await model.getMaterialLength()

        return res.json({ status: true, total_material: total[0].total_material, data: mergedData })
    } catch (err) {
        return api.catchError(res, err)
    }
}

const getMaterialByCode = async (req, res) => {
    try {
        let data = await model.getByCode(req.params.code)
        const finalData = await mergeAvgPrice(data)
        return api.ok(res, finalData)
    } catch (err) {
        return api.catchError(res, err)
    }
}

async function mergeAvgPrice(dataSource) {
    return new Promise((resolve, reject) => {
        if (dataSource.length > 0) {
            dataSource.forEach(async (item, index) => {
                let avgPrice = await model.getAvgPriceByCode(item.material_code)
                item.detail_price = []
                if (avgPrice.length > 0) {
                    avgPrice.forEach((price) => {
                        item.detail_price.push({
                            year: price.year || null,
                            avg_price_id: price.avg_price_id || null,
                            average_price: +price.average_price || null,
                            updated_at: price.updated_at ? price.updated_at : price.created_at
                        })
                    })
                }
                delete item['average_price']
                if (index === dataSource.length - 1) {
                    setTimeout(() => resolve(dataSource), 50)
                }
            })
        } else resolve([])
    })
}

module.exports = {
    getAllMaterial,
    getMaterialById,
    insertMaterial,
    updateMaterial,
    getMaterialWithPriceAvailable,
    searchMaterial,
    getMaterialByPagination,
    searchMaterialByPagination,
    getMaterialByCode,
    getAllUOM
}