const xlsx = require("xlsx")

const injectExcel = async () => {
    const workbook = xlsx.readFile('../../../uploads/inject_data/tr_supplies_budget.xlsx')
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    console.log(data);
}

module.exports = {
    injectExcel
}