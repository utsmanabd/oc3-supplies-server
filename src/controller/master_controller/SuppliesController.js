const model = require('../../model/tr_supplies.model');
const api = require('../../tools/common')

const getAllSuppliesBudget = async (req, res) => {
    try {
        let data = await model.getAll();
        return api.ok(res, data);
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const getSuppliesByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getByYearAndLine(req.params.year, req.params.line);
        if (data.length > 0) {
            let transformedData = transformSuppliesViewData(data)
            return api.ok(res, transformedData);
        } else {
            return api.error(res, `Data not found`, 400);
        }
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getSuppliesByYearAndCostCenter = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.costctr)) {
        let data = await model.getByYearAndCostCenter(req.params.year, req.params.costctr)
        if (data.length > 0) {
            let transformedData = transformSuppliesViewData(data)
            return api.ok(res, transformedData);
        } else {
            return api.error(res, `Data not found`, 400);
        }
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const getSuppliesBudgetById = async (req, res) => {
    if (!isNaN(req.params.id)) {
        let data = await model.getById(req.params.id);
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

const insertSuppliesBudget = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateSuppliesBudget = async (req, res) => {
    try {
        let data = await model.update(req.params.id, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const transformSuppliesViewData = (data) => {
    const transformedArray = []
    if (Array.isArray(data)) {
        data.forEach(originalObj => {
            const existingObject = transformedArray.find((transformedObj) => transformedObj.budget_id === originalObj.budget_id);
            if (existingObject) {
                existingObject.budgeting_data.push({
                    month: originalObj.month,
                    prodplan: originalObj.prodplan,
                    totak_week: originalObj.totak_week,
                    quantity: originalObj.quantity,
                    price: originalObj.price,
                    prodplan_id: originalObj.prodplan_id
                });
            } else {
                const newObj = {
                    budget_id: originalObj.budget_id,
                    line: originalObj.line,
                    year: originalObj.year,
                    section: originalObj.section,
                    cost_center: originalObj.cost_center,
                    material_code: originalObj.material_code,
                    material_desc: originalObj.material_desc,
                    calculation_by: originalObj.calculation_by,
                    uom: originalObj.uom,
                    average_price: originalObj.average_price,
                    bom: originalObj.bom,
                    calculation_id: originalObj.calculation_id,
                    cost_ctr_id: originalObj.cost_ctr_id,
                    line_id: originalObj.line_id,
                    material_id: originalObj.material_id,
                    budgeting_data: [
                        {
                            month: originalObj.month,
                            prodplan: originalObj.prodplan,
                            totak_week: originalObj.totak_week,
                            quantity: originalObj.quantity,
                            price: originalObj.price,
                            prodplan_id: originalObj.prodplan_id
                        },
                    ],
                };
    
                transformedArray.push(newObj);
            }
        })
    }
    
    return transformedArray
} 

module.exports = {
    getAllSuppliesBudget,
    getSuppliesBudgetById,
    insertSuppliesBudget,
    updateSuppliesBudget,
    getSuppliesByYearAndLine,
    getSuppliesByYearAndCostCenter
}