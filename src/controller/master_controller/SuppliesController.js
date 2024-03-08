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
            transformedData.forEach(item => {
                item.average_price = +item.average_price
                item.bom = +item.bom
                item.budgeting_data.forEach(data => {
                    data.prodplan = +data.prodplan
                    data.quantity = +data.quantity
                    data.price = +data.price
                })
            })
            return api.ok(res, transformedData);
        } else {
            return api.ok(res, data);
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
            return api.ok(res, data);
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
        let data = await model.updateByBudgetId(req.params.budgetid, req.body.form_data);
        return api.ok(res, data)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const isBudgetIdExist = async (req, res) => {
    let budgetId = req.params.budgetid
    try {
        let data = await model.getByBudgetId(budgetId)
        if (data.length == 0) {
            return res.json({
                is_available: true,
                message: 'Budget ID available'
            })
        }
        return res.json({
            is_available: false,
            length: data.length,
            message: 'Budget ID already exists!'
        })
        
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateWithBudgetAndProdplanId = async (req, res) => {
    try {
        let budgetId = req.params.budgetid
        let requestData = req.body.form_data
        if (Array.isArray(requestData) && requestData.length == 12) {
            requestData.forEach(data => {
                model.updateByBudgetAndProdplanId(budgetId, data.prodplan_id, data)
            })
            return api.ok(res, requestData)
        } else return api.error(res, `Data length is less than 12`, 400)
    } catch (err) {
        console.error(err);
        return api.error(res, `${err.name}: ${err.message}`, 500)
    }
}

const updateMultipleSupplies = async (req, res) => {
    try {
        let requestData = req.body.form_data
        const update = async (data) => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    await model.updateByBudgetId(item.budget_id, item.data)
                    if (index === data.length - 1) {
                        resolve(true)
                    }
                })
            })
        }
        update(requestData).then(() => {
            return api.ok(res, requestData)
        })
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
                    supplies_id: originalObj.supplies_id,
                    month: originalObj.month,
                    prodplan: originalObj.prodplan,
                    total_week: originalObj.total_week,
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
                            supplies_id: originalObj.supplies_id,
                            month: originalObj.month,
                            prodplan: originalObj.prodplan,
                            total_week: originalObj.total_week,
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
    getSuppliesByYearAndCostCenter,
    isBudgetIdExist,
    updateMultipleSupplies,
    updateWithBudgetAndProdplanId,
    transformSuppliesViewData
}