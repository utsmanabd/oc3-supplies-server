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

// const inject = async () => {
//     let injectionData = await model.getInjectAvg()
//     let totalMaterial = 0
//     injectionData.forEach( async data => {
//         let material = await model.getByCode(data.material_code)
//         if (material.length > 0) {
//             let avgPriceData = { average_price: data.average_price }
//             await model.updateByCode(data.material_code, avgPriceData)
//             totalMaterial++
//             console.log(`Data-${totalMaterial} added`);
//         }
//     })
// }

module.exports = {
    getAllMaterial,
    getMaterialById,
    insertMaterial,
    updateMaterial,
}