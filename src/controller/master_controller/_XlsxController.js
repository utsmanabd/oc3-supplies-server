const api = require('../../tools/common')
const XLSX = require('xlsx')
const path = require('path')
const suppliesActualModel = require('../../model/tr_actual.model');
const suppliesPlanModel = require('../../model/tr_supplies.model');
const costCenterModel = require('../../model/cost_ctr.model')
const materialModel = require('../../model/material.model')
const prodplanModel = require('../../model/tr_prodplan.model')
const lineModel = require('../../model/line.model')

const uploadActualBudget = async (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false })

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
                        notProductionLine.push({ cost_ctr: item.cost_ctr, section: costCenter[0].section })
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
                        not_included_section: api.getUniqueData(notProductionLine, 'cost_ctr')
                    }
                })
            })
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const checkUploadedActual = async (req, res, next) => {
    try {
        const expectedColumns = [
            'cost_ctr', 'purchase_order', 'material_code', 'material_desc', 'vendor',
            'movement_type', 'reference', 'posting_date', 'quantity', 'uom', 'batch', 'document_date',
            'material_document', 'user_name', 'entry_date', 'time_of_entry', 'document_header_text', 'price'
        ]

        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

        const notFoundCostCtr = []
        const notFoundMaterial = []

        const checkNotIncludedData = async () => {
            return new Promise((resolve, reject) => {
                data.forEach(async (item, index) => {
                    const costCenter = await costCenterModel.search(item.cost_ctr)
                    const material = await materialModel.search(item.material_code)
                    if (costCenter.length < 1) {
                        notFoundCostCtr.push(item.cost_ctr)
                    }

                    if (material.length < 1) {
                        notFoundMaterial.push({ material_code: item.material_code, material_desc: item.material_desc })
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        const columns = Object.keys(data[0])
        const missingColumns = expectedColumns.filter(col => !columns.includes(col))

        if (missingColumns.length > 0) {
            return res.status(200).json({
                status: false,
                data: {
                    message: "The XLSX file is not valid (missing columns). Please using the template instead!",
                    missing_columns: missingColumns
                }
            })
        } else {
            await checkNotIncludedData().then(() => {
                if (notFoundCostCtr.length > 0 || notFoundMaterial.length > 0) {
                    return res.status(200).json({
                        status: false,
                        data: {
                            message: 'There were several cost centers or materials that were not listed in the master data.',
                            not_included_cost_ctr: [... new Set(notFoundCostCtr)],
                            not_included_material: api.getUniqueData(notFoundMaterial, 'material_code')
                        }
                    })
                } else next()
                data.splice(0)
            })
        }

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

const checkUploadedPlan = async (req, res, next) => {
    try {
        const expectedColumns = ['year', 'cost_ctr', 'material_code', 'calculation_by', 'bom']
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: 0 })

        const notFoundProdplan = []
        const notFoundCostCtr = []
        const notFoundMaterial = []
        const notFoundCalculation = []
        const duplicatesSupply = []

        const checkNotIncludedData = async () => {
            return new Promise((resolve, reject) => {
                let supplies = new Set()
                data.forEach(async (item, index) => {

                    const costCenter = await costCenterModel.search(item.cost_ctr)
                    const material = await materialModel.search(item.material_code)

                    let supplyId = `${item.year}-${item.cost_ctr}-${item.material_code}`
                    if (supplies.has(supplyId)) {
                        duplicatesSupply.push(JSON.stringify({ year: item.year, cost_ctr: item.cost_ctr, material_code: item.material_code, material_desc: material[0].material_desc }))
                    }
                    supplies.add(supplyId)

                    if (costCenter.length < 1) {
                        notFoundCostCtr.push(item.cost_ctr)
                    } else {
                        if (costCenter[0].line_id !== null) {
                            const prodplan = await prodplanModel.getByYearAndLine(item.year, costCenter[0].line_id)
                            const line = await lineModel.getById(costCenter[0].line_id)
                            if (prodplan.length < 12) {
                                notFoundProdplan.push(JSON.stringify({ year: item.year, line: line[0].name, line_id: line[0].id }))
                            }
                        }
                    }

                    if (material.length < 1) {
                        notFoundMaterial.push(item.material_code)
                    }

                    if (
                        item.calculation_by !== 'Daily' &&
                        item.calculation_by !== 'Weekly' &&
                        item.calculation_by !== 'Monthly' &&
                        item.calculation_by !== 'Prodplan'
                    ) {
                        notFoundCalculation.push(`${item.calculation_by}`)
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        const columns = Object.keys(data[0])
        const missingColumns = expectedColumns.filter(col => !columns.includes(col))

        if (missingColumns.length > 0) {
            return res.status(200).json({
                status: false,
                data: {
                    message: "The XLSX file is not valid (missing columns). Please using the template instead!",
                    missing_columns: missingColumns
                }
            })
        }

        await checkNotIncludedData().then(() => {
            if (notFoundCostCtr.length > 0 || notFoundMaterial.length > 0 || notFoundProdplan.length > 0 || notFoundCalculation.length > 0 || duplicatesSupply.length > 0) {
                return res.status(200).json({
                    status: false,
                    data: {
                        message: 'There were several data in the file that were not listed in the master data.',
                        duplicates_supply: [... new Set(duplicatesSupply)].map((obj) => (JSON.parse(obj))),
                        not_included_prodplan: [... new Set(notFoundProdplan)].map((obj) => (JSON.parse(obj))),
                        not_included_calculation: [... new Set(notFoundCalculation)],
                        not_included_cost_ctr: [... new Set(notFoundCostCtr)],
                        not_included_material: [... new Set(notFoundMaterial)]
                    }
                })
            } else next()
            data.splice(0)
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const getActualXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_supplies_actual.xlsx")
    res.sendFile(filePath)
}

const getPlanXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_supplies_plan.xlsx")
    res.sendFile(filePath)
}

module.exports = {
    getPlanXlsxTemplate,
    getActualXlsxTemplate,
    uploadPlanBudget,
    uploadActualBudget,
    checkUploadedActual,
    checkUploadedPlan
}