const api = require('../../tools/common')
const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const getActualXlsxTemplate = async (req, res) => {
    const filePath = path.join(__dirname, "../../../uploads/template/template_supplies_actual.xlsx")
    res.sendFile(filePath)
}

module.exports = {
    getActualXlsxTemplate
}