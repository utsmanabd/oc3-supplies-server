const model = require('../../model/tr_actual.model');
const api = require('../../tools/common')
const XLSX = require('xlsx')
const costCenterModel = require('../../model/cost_ctr.model')
const materialModel = require('../../model/material.model')
const SuppliesController = require('./SuppliesController')

const insertActualBudget = async (req, res) => {
    try {
        let data = await model.insert(req.body.form_data)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const uploadActualBudgetXLSX = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, {raw: false})

        const injectionData = []
        const notProductionLine = []

        const filterData = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    const costCenter = await costCenterModel.search(+item.cost_ctr)
                    const material = await materialModel.search(+item.material_code)
                    
                    if (costCenter.length == 1 && material.length == 1 && costCenter[0].line_id != null) {
                        item.cost_ctr_id = costCenter[0].id
                        item.material_id = material[0].id
                        item.quantity = Math.abs(+item.quantity)
                        item.price = Math.abs(+item.price)
                        item.entry_datetime = `${item.entry_date} ${item.time_of_entry}`

                        delete item['uom'], delete item['cost_ctr'], delete item['material_code'], 
                        delete item['material_desc'], delete item['entry_date'], delete item['time_of_entry']

                        injectionData.push(item)
                    }

                    if (costCenter[0].line_id == null) {
                        notProductionLine.push({cost_ctr: item.cost_ctr, section: costCenter[0].section})
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        // return api.ok(res, data)
        
        await filterData().then(async () => {
            await model.insert(injectionData).then(() => {
                return res.status(200).json({
                    status: true,
                    data: {
                        message: "Data inserted successfully",
                        inserted_rows: injectionData.length,
                        not_included_section: api.getUniqueData(notProductionLine, 'cost_ctr')
                    }
                })
            })
        })
        
    } catch (err) {
        api.catchError(res, err)
    }
}

const checkBeforeXLSXUpload = async (req, res, next) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, {raw: false})

        const notFoundCostCtr = []
        const notFoundMaterial = []
        const notProductionLine = []

        const checkAndFilter = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    const costCenter = await costCenterModel.search(item.cost_ctr)
                    const material = await materialModel.search(item.material_code)
                    if (costCenter.length < 1) {
                        notFoundCostCtr.push(item.cost_ctr)
                    } else {
                        if (costCenter[0].line_id == null) {
                            notProductionLine.push({cost_ctr: item.cost_ctr, section: costCenter[0].section})
                        }
                    }

                    if (material.length < 1) {
                        notFoundMaterial.push({material_code: item.material_code, material_desc: item.material_desc})
                    }
                    
                    if (index === data.length - 1) {
                        resolve()
                    }
                })
            })
        }

        await checkAndFilter().then(() => {
            if ((notFoundCostCtr && notFoundMaterial).length > 0) {
                return res.status(200).json({
                    status: false,
                    data: {
                        message: 'There were several cost centers or materials that were not listed in the master data.',
                        not_included_cost_ctr: [... new Set(notFoundCostCtr)],
                        not_included_material: api.getUniqueData(notFoundMaterial, 'material_code'),
                        not_included_section: api.getUniqueData(notProductionLine, 'cost_ctr')
                    }
                })
            } else next()
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualSuppliesByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getActualSuppliesByYearAndLine(req.params.year, req.params.line);
        if (data.length > 0) {
            let transformedData = SuppliesController.transformSuppliesViewData(data)
            transformedData.forEach(item => {
                item.average_price = +item.average_price
                item.budgeting_data.forEach(data => {
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

const getActualPerLineByYear = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        let data = await model.getActualPerLineByYear(year);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerSectionByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getActualPerSectionByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerSectionMonthByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getActualPerSectionMonthByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualPerSupplyByLine = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || 0;
        const lineId = parseInt(req.query.lineId) || 0;
        let data = await model.getActualPerSupplyByLine(year, lineId);
        data.forEach(item => item.price = +item.price)
        return api.ok(res, data)
    } catch (err) {
        api.catchError(res, err)
    } 
}

const getProdplanByYearAndLine = async (req, res) => {
    if (!isNaN(req.params.year) && !isNaN(req.params.line)) {
        let data = await model.getProdplanByYearAndLine(req.params.year, req.params.line);
        data.forEach(item => item.prodplan = +item.prodplan)
        return api.ok(res, data);
    } else {
        return api.error(res, "Bad Request", 400);
    }
}

module.exports = {
    insertActualBudget,
    uploadActualBudgetXLSX,
    checkBeforeXLSXUpload,
    getActualSuppliesByYearAndLine,
    getActualPerLineByYear,
    getActualPerSectionByLine,
    getActualPerSectionMonthByLine,
    getActualPerSupplyByLine,
    getProdplanByYearAndLine
}