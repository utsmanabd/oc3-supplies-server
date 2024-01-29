const xlsx = require("xlsx")
const materialModel = require("./src/model/material.model")
const prodplanModel = require("./src/model/tr_prodplan.model")
const suppliesModel = require("./src/model/tr_supplies.model")

const injectTrSuppliesBudget = () => {
    const workbook = xlsx.readFile('uploads/inject_data/tr_supplies_budget.xlsx')
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)

    let injectionData = []
    data.forEach(async (item) => {
        let material = await materialModel.getByCode(item.material_code)
        if (material.length > 0) {
            injectionData.push({
                budget_id: `2024-1-${item.cost_ctr_id}-${material[0].id}`,
                material_id: material[0].id,
                cost_ctr_id: item.cost_ctr_id,
                calc_budget_id: item.calc_budget_id,
                bom: item.bom,
                average_price: material[0].average_price
            })
        }
    })

    const months = [1,2,3,4,5,6,7,8,9,10,11,12]
    let finalData = []
    let year = 2024

    setTimeout(() => {
      injectionData.forEach(async item => {
        months.forEach(async month => {
          let prodplan = await prodplanModel.getByDateAndLine(month, year, 1)
          if (prodplan.length > 0) {
            let quantity = 0
            let price = 0
            if (item.calc_budget_id == 1) {
              quantity = prodplan[0].prodplan / 1000 * item.bom
            } else if (item.calc_budget_id == 3) {
              quantity = prodplan[0].weekly_count * item.bom
            }
            price = quantity * item.average_price
  
            finalData.push({
              budget_id: item.budget_id,
              material_id: item.material_id,
              cost_ctr_id: item.cost_ctr_id,
              calc_budget_id: item.calc_budget_id,
              prodplan_id: month,
              bom: item.bom,
              quantity: quantity,
              price: price
            })
          }
        })
      })
    }, 2000)

    setTimeout(async() => {
      // console.log(finalData);
      await suppliesModel.insert(finalData)
      console.log("Success!");
    }, 10000)
    
}

injectTrSuppliesBudget()

const injectMstMaterialSupplies = async () => {
    let injectionData = await materialModel.getInjectAvg()
    let totalMaterial = 0
    injectionData.forEach( async data => {
        let material = await materialModel.getByCode(data.material_code)
        if (material.length > 0) {
            let avgPriceData = { average_price: data.average_price }
            await materialModel.updateByCode(data.material_code, avgPriceData)
            totalMaterial++
            console.log(`Data-${totalMaterial} added`);
        }
    })
}

const fixDummy = [
    {
        budget_id: "2023-OC3-001-70001179",
        line: "OC3",
        year: 2023,
        section: "Preparation",
        cost_center: 12000324,
        material_code: 70001179,
        calculation_by: "Weekly",
        uom: "PC",
        average_price: 49756.25,
        bom: 0.025,
        budgeting_data: [
            {
                month: 1,
                prodplan: 14250000,
                totak_week: 5,
                quantity: 1.25,
                price: 126750.33
            },
            {
                month: 2,
                prodplan: 1272500,
                totak_week: 4,
                quantity: 0.75,
                price: 503400.33
            }
        ]
    },
    {
        budget_id: "2023-AL4-003-70001122",
        line: "AL4",
        year: 2023,
        section: "Blowfill",
        cost_center: 12000311,
        material_code: 70001122,
        calculation_by: "Prodplan",
        uom: "PC",
        average_price: 125645.25,
        budgeting_data: [
            {
                month: 1,
                prodplan: 13782900,
                totak_week: 4,
                quantity: 0.25,
                price: 75250.33
            },
            {
                month: 2,
                prodplan: 14250000,
                totak_week: 4,
                quantity: 1.25,
                price: 89204.33
            }
        ]
        
    }
]

const dataDummy = 
[
    {
        budget_id: "2023-OC3-001-70001179",
        line: "OC3",
        year: 2023,
        section: "Preparation",
        cost_center: 12000324,
        material_code: 70001179,
        calculation_by: "Weekly",
        uom: "PC",
        average_price: 49756.25,
        bom: 0.025,
        month: 1,
        prodplan: 14250000,
        totak_week: 5,
        quantity: 1.25,
        price: 126750.33
    },
    {
        budget_id: "2023-OC3-001-70001179",
        line: "OC3",
        year: 2023,
        section: "Preparation",
        cost_center: 12000324,
        material_code: 70001179,
        calculation_by: "Weekly",
        uom: "PC",
        average_price: 49756.25,
        bom: 0.025,
        month: 2,
        prodplan: 1272500,
        totak_week: 4,
        quantity: 0.75,
        price: 503400.33
    },
    {
        budget_id: "2023-AL4-003-70001122",
        line: "AL4",
        year: 2023,
        section: "Blowfill",
        cost_center: 12000311,
        material_code: 70001122,
        calculation_by: "Prodplan",
        uom: "PC",
        average_price: 125645.25,
        bom: 0.013,
        month: 1,
        prodplan: 13782900,
        totak_week: 4,
        quantity: 0.25,
        price: 75250.33
    },
    {
        budget_id: "2023-AL4-003-70001122",
        line: "AL4",
        year: 2023,
        section: "Blowfill",
        cost_center: 12000311,
        material_code: 70001122,
        calculation_by: "Prodplan",
        uom: "PC",
        average_price: 125645.25,
        bom: 0.013,
        month: 2,
        prodplan: 14250000,
        totak_week: 4,
        quantity: 1.25,
        price: 89204.33
    },
]