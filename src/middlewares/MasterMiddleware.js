const api = require('../tools/common')
const XLSX = require('xlsx')
const costCenterModel = require('../model/cost_ctr.model')
const materialModel = require('../model/material.model')
const avgPriceModel = require('../model/tr_avgprice.model')
const prodplanModel = require('../model/tr_prodplan.model')
const lineModel = require('../model/line.model')

// XLSX Middlewares

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
                        if (`${item.material_code}`.charAt(0) === '7') {
                            notFoundMaterial.push({ material_code: item.material_code, material_desc: item.material_desc })
                        }
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

const checkUploadedMaterial = async (req, res, next) => {
    try {
        const expectedColumns = ['material_code', 'material_desc', 'uom', 'average_price']
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

        const existsMaterial = []
        const duplicatesMaterial = []

        const year = parseInt(req.query.year) || 0

        const columns = Object.keys(data[0])
        const missingColumns = expectedColumns.filter(col => !columns.includes(col))

        // Checking for year
        if (year <= 0) {
            return res.status(400).json({ status: false, data: { message: "Invalid year" } })
        }

        // Checking for missing columns
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                status: false, 
                data: {
                    message: "The XLSX file is not valid (missing columns). Please using the template instead!",
                    missing_columns: missingColumns
                }
            })
        }

        const checkNotIncludedData = async () => {
            return new Promise((resolve, reject) => {
                let materials = new Set()
                data.forEach(async (item, index) => {
                    const material = await materialModel.getByCode(item.material_code)
                
                    // Checking duplicates material
                    if (materials.has(item.material_code)) {
                        duplicatesMaterial.push(JSON.stringify(item))
                    }
                    materials.add(item.material_code)

                    // Checking existing material
                    if (material.length > 0) {
                        let mergedMaterial = await mergeAvgPrice(material)
                        existsMaterial.push(JSON.stringify(mergedMaterial[0]))
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        // Checking for invalid data
        await checkNotIncludedData().then(() => {
            if (existsMaterial.length > 0 || duplicatesMaterial.length > 0) {
                return res.status(400).json({
                    status: false,
                    data: {
                        message: 'There were existings or duplicates material data in the file',
                        duplicates_material: [... new Set(duplicatesMaterial)].map(obj => (JSON.parse(obj))),
                        exists_material: [... new Set(existsMaterial)].map(obj => (JSON.parse(obj))),
                    }
                })
            } else next()
            data.splice(0)
        })

    } catch (err) {
        api.catchError(res, err)
    }
}

const checkUploadedAvgPriceUpdate = async (req, res, next) => {
    try {
        const expectedColumns = ['material_code', 'average_price']
        const workbook = XLSX.read(req.file.buffer)
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: null })

        const year = parseInt(req.query.year) || 0

        const columns = Object.keys(data[0])
        const missingColumns = expectedColumns.filter(col => !columns.includes(col))

        const notFoundMaterial = []
        const duplicatesMaterial = []

        if (year <= 0) {
            return api.error(res, 'Invalid year', 400)
        }

        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                status: false, 
                data: {
                    message: "The XLSX file is not valid (missing columns). Please using the template instead!",
                    missing_columns: missingColumns
                }
            })
        }

        const checkNotIncludedData = async () => {
            return new Promise((resolve, reject) => {
                let materials = new Set()
                data.forEach(async(item, index) => {
                    let material = await materialModel.getByCode(item.material_code)
                    let avgPrice = await avgPriceModel.getByCode(item.material_code)
    
                    if (materials.has(item.material_code)) {
                        duplicatesMaterial.push(JSON.stringify(item))
                    }
                    materials.add(item.material_code)
    
                    if (material.length < 1 || avgPrice.length < 1) {
                        notFoundMaterial.push(item.material_code)
                    }

                    if (index === data.length - 1) {
                        setTimeout(() => resolve(), 50)
                    }
                })
            })
        }

        await checkNotIncludedData().then(() => {
            if (notFoundMaterial.length > 0 || duplicatesMaterial.length > 0) {
                return res.status(400).json({
                    status: false,
                    data: {
                        message: 'There were undefined or duplicates material data in the file',
                        duplicates_material: [... new Set(duplicatesMaterial)].map(obj => (JSON.parse(obj))),
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

// Material Middlewares

const checkMaterialAvailability = async (req, res, next) => {
    try {
        const material = await materialModel.getByCode(req.body.form_data.material_code)
        if (material.length > 0) {
            return api.error(res, 'Material is already exists', 400)
        }
        next()
    } catch (err) {
        api.catchError(res, err)
    }
}

const checkMaterialAvailabilityUpdate = async (req, res, next) => {
    try {
        const materialId = req.params.id
        const materialCode = req.body.form_data.material_code

        if (!materialCode) {
            next()
        } else {
            const currentMaterial = await materialModel.getById(materialId)
            const updateMaterial = await materialModel.getByCode(materialCode)
            if (updateMaterial.length == 1) {
                if (updateMaterial[0].material_code === currentMaterial[0].material_code) {
                    next()
                } else {
                    return api.error(res, 'Material is already exists', 400)
                }
            } else {
                next()
            }
        }

        
        
    } catch (err) {
        api.catchError(res, err)
    }
}

// Avg Price Middlewares

const checkAvgPriceAvailability = async (req, res, next) => {
    try {
        const material = await materialModel.getById(req.body.form_data.material_id)
        const year = req.body.form_data.year
        const avgPrice = await avgPriceModel.getByCodeAndYear(material[0].material_code, year)
        if (avgPrice.length > 0) {
            return api.error(res, `Average price in ${year} for ${material[0].material_code} is already exists`, 400)
        }
        next()
    } catch (err) {
        api.catchError(res, err)
    }
}


module.exports = {
    checkUploadedActual,
    checkUploadedPlan,
    checkUploadedMaterial,
    checkUploadedAvgPriceUpdate,
    checkMaterialAvailability,
    checkMaterialAvailabilityUpdate,
    checkAvgPriceAvailability
}
