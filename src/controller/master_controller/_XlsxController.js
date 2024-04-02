const api = require('../../tools/common')
const XLSX = require('xlsx')
const path = require('path')
const suppliesActualModel = require('../../model/tr_actual.model');
const suppliesPlanModel = require('../../model/tr_supplies.model');
const costCenterModel = require('../../model/cost_ctr.model')
const materialModel = require('../../model/material.model')
const avgPriceModel = require('../../model/tr_avgprice.model')
const prodplanModel = require('../../model/tr_prodplan.model')

const uploadActualBudget = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false })

        const injectionData = []
        const notProductionLine = []
        const invalidMaterials = []

        const filterData = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    const costCenter = await costCenterModel.search(+item.cost_ctr)
                    const material = await materialModel.search(+item.material_code)
                    
                    const materialCode = `${item.material_code}`
                    if (materialCode.length !== 9) {
                        invalidMaterials.push(JSON.stringify({ material_code: item.material_code, material_desc: item.material_desc }))
                    }
                    
                    if (costCenter.length == 1 && material.length == 1 && costCenter[0].line_id != null) {
                        item.cost_ctr_id = costCenter[0].id
                        item.material_id = material[0].id
                        item.quantity = Math.abs(+item.quantity)
                        item.price = Math.abs(+item.price)
                        item.entry_datetime = `${item.entry_date} ${item.time_of_entry}`

                        const keysToDelete = ['uom', 'cost_ctr', 'material_code', 'material_desc', 'entry_date', 'time_of_entry']
                        keysToDelete.forEach(key => delete item[key])

                        injectionData.push(item)
                    }

                    if (costCenter[0].line_id == null) {
                        notProductionLine.push({ materialCode: item.material_code, cost_ctr: item.cost_ctr, section: costCenter[0].section })
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        await filterData().then(async () => {
            await suppliesActualModel.insert(injectionData).then(() => {
                data.splice(0)
                return res.status(200).json({
                    status: true,
                    data: {
                        message: "Data inserted successfully",
                        inserted_rows: injectionData.length,
                        not_included_section: api.getUniqueData(notProductionLine, 'cost_ctr'),
                        invalid_materials: [...new Set(invalidMaterials)].map(obj => JSON.parse(obj))
                    }
                })
            })
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const uploadPlanBudget = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

        const injectionData = []
        const notProductionLine = []

        const filterData = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    const costCenter = await costCenterModel.search(+item.cost_ctr)
                    const material = await materialModel.search(+item.material_code)
                    const prodplan = await prodplanModel.getByYearAndLine(item.year, costCenter[0].line_id)
                    const calculation =
                        item.calculation_by === "Prodplan" ? 1
                            : item.calculation_by === "Daily" ? 2
                                : item.calculation_by === "Weekly" ? 3
                                    : item.calculation_by === "Monthly" ? 4
                                        : 0

                    if (costCenter[0].line_id !== null) {
                        prodplan.forEach((prod, index) => {
                            let quantity = 0
                            let price = 0
                            if (calculation == 1) {
                                quantity = prod.prodplan / 1000 * +item.bom
                            } else if (calculation == 2) {
                                quantity = prod.daily_count * +item.bom
                            } else if (calculation == 3) {
                                quantity = prod.weekly_count * +item.bom
                            } else if (calculation == 4) {
                                quantity = 1 * +item.bom
                            }
                            price = quantity * material[0].average_price

                            injectionData.push({
                                budget_id: `${item.year}-${costCenter[0].line_id}-${costCenter[0].id}-${material[0].id}`,
                                material_id: material[0].id,
                                cost_ctr_id: costCenter[0].id,
                                calc_budget_id: calculation,
                                prodplan_id: prod.id,
                                bom: +item.bom,
                                quantity: quantity,
                                price: price
                            })
                        })
                    } else {
                        notProductionLine.push({ cost_ctr: item.cost_ctr, section: costCenter[0].section })
                    }

                    if (index == data.length - 1) {
                        setTimeout(() => {
                            resolve()
                        }, 50)
                    }

                })
            })
        }

        await filterData().then(async () => {
            await suppliesPlanModel.insert(injectionData).then(() => {
                return res.status(200).json({
                    status: true,
                    data: {
                        message: "Data inserted successfully",
                        inserted_rows: injectionData.length,
                        not_included_section: api.getUniqueData(notProductionLine, 'budget_id')
                    }
                })
            })
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const uploadMaterial = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

        const year = parseInt(req.query.year)

        const materials = [...data].map(item => {
            let data = {...item}
            delete data['average_price']
            return data
        })

        await materialModel.insert(materials).then(async () => {
            const filterAvgPriceData = async () => {
                return new Promise((resolve, reject) => {
                    data.forEach(async (item, index, arr) => {
                        let material = await materialModel.getByCode(item.material_code)
                        if (material.length == 1) {
                            item.material_id = material[0].id
                            item.year = year
                            delete item['material_desc'], delete item['uom'], delete item['material_code']
                        }
                        if (index === data.length - 1) {
                            setTimeout(() => resolve(arr), 50)
                        }
                    })
                })
            }
            
            let avgPriceData = await filterAvgPriceData()
            await avgPriceModel.insert(avgPriceData).then(() => {
                return api.ok(res, { message: "Material data inserted successfully." })
            })    
        })

        

    } catch(err) {
        api.catchError(res, err)
    }
}

const uploadAvgPriceUpdate = async (req, res) => {
    const workbook = XLSX.read(req.file.buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

    const year = parseInt(req.query.year) || 0
    
    const beginUpdate = async () => {
        return new Promise((resolve, reject) => {
            data.forEach(async (item, index) => {
                let avgPriceInSelectedYear = await avgPriceModel.getByCodeAndYear(item.material_code, year)
                
                if (avgPriceInSelectedYear.length == 1) {
                    await avgPriceModel.update(avgPriceInSelectedYear[0].avg_price_id, { average_price: item.average_price })
                } else {
                    let material = await materialModel.getByCode(item.material_code)
                    await avgPriceModel.insert({
                        material_id: material[0].id,
                        year: year,
                        average_price: item.average_price
                    })
                }
    
                if (index === data.length - 1) {
                    setTimeout(() => resolve(), 50)
                }
            })
        })
    }

    await beginUpdate().then(() => api.ok(res, { message: "Average price updated successfully." }))
}

const getActualXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_supplies_actual.xlsx")
    res.sendFile(filePath)
}

const getPlanXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_supplies_plan.xlsx")
    res.sendFile(filePath)
}

const getMaterialXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_material_insert.xlsx")
    res.sendFile(filePath)
}

const getAvgPriceUpdateXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_avgprice_update.xlsx")
    res.sendFile(filePath)
}

module.exports = {
    getPlanXlsxTemplate,
    getActualXlsxTemplate,
    uploadPlanBudget,
    uploadActualBudget,
    uploadMaterial,
    uploadAvgPriceUpdate,
    getMaterialXlsxTemplate,
    getAvgPriceUpdateXlsxTemplate
}