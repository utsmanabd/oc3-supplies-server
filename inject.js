const xlsx = require("xlsx")
const materialModel = require("./src/model/material.model")
const prodplanModel = require("./src/model/tr_prodplan.model")
const suppliesModel = require("./src/model/tr_supplies.model")
const costCenterModel = require("./src/model/cost_ctr.model")
const actualModel = require("./src/model/tr_actual.model")

const _year = 2024
const _lineId = 4

const sapSupplies = async () => {
  console.log("Reading XLSX file...");
  const workbook = xlsx.readFile('uploads/inject_data/sap_supplies_ready.xlsx')
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet)

  setTimeout(() => {
    console.log("Raw data length: " + data.length);
  }, 1500)

  const injectionData = []

  data.forEach(async (item, index) => {
    const costCenter = await costCenterModel.search(item.cost_ctr)
    const material = await materialModel.search(item.material_code)
    if (costCenter.length == 1 && material.length == 1 && costCenter[0].line_id != null) {
      item.cost_ctr_id = costCenter[0].id,
      item.material_id = material[0].id
      delete item['cost_ctr']
      delete item['material_code']
      injectionData.push(item)
    }
  })

  setTimeout(async() => {
    console.log("Injection length: " + injectionData.length);
    console.log(injectionData);
    await actualModel.insert(injectionData).then(() => {
      console.log("Successfully inserted");
    })
  }, 3000)
}

const injectTrSuppliesBudget = async () => {
  console.log("Reading XLSX file...");
  const workbook = xlsx.readFile('uploads/inject_data/suppliesBudget.xlsx')
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet)

  let injectionData = []
  data.forEach(async (item) => {
    let material = await materialModel.getByCode(item.material_code)
    if (material.length > 0) {
      injectionData.push({
        budget_id: `${_year}-${_lineId}-${item.cost_ctr_id}-${material[0].id}`,
        material_id: material[0].id,
        cost_ctr_id: item.cost_ctr_id,
        calc_budget_id: item.calc_budget_id,
        bom: item.bom,
        average_price: material[0].average_price
      })
    } else {
      console.log(`Material code ${item.material_code} not found`)
    }
  })

  // console.log(`Fetching prodplan data on lineId: ${_lineId} in ${_year}...`);
  // const prodplanData = await prodplanModel.getByYearAndLine(_year, _lineId).then(data => {
  //   return data.map(prod => {
  //     let object = { month: prod.month, id: prod.id }
  //     return object
  //   })
  // })

  // let finalData = []
  // setTimeout(() => {
  //   if (prodplanData.length > 0 && injectionData.length > 0) {
  //     console.log("XLSX and Prodplan data loaded successfully");
  //     console.log("Begin injecting supplies data...");
  //     injectionData.forEach(async item => {
  //       prodplanData.forEach(async prod => {
  //         let prodplan = await prodplanModel.getByDateAndLine(prod.month, _year, _lineId)
  //         if (prodplan.length > 0) {
  //           let quantity = 0
  //           let price = 0
  //           if (item.calc_budget_id == 1) {
  //             quantity = prodplan[0].prodplan / 1000 * item.bom
  //           } else if (item.calc_budget_id == 3) {
  //             quantity = prodplan[0].weekly_count * item.bom
  //           } else if (item.calc_budget_id == 4) {
  //             quantity = 1 * item.bom
  //           }
  //           price = quantity * item.average_price
  
  //           finalData.push({
  //             budget_id: item.budget_id,
  //             material_id: item.material_id,
  //             cost_ctr_id: item.cost_ctr_id,
  //             calc_budget_id: item.calc_budget_id,
  //             prodplan_id: prod.id,
  //             bom: item.bom,
  //             quantity: quantity,
  //             price: price
  //           })
  //         }
  //       })
  //     })
  //   } else {
  //     console.log("The XLSX or prodplan data is empty")
  //   }
  // }, 2000)

  // setTimeout(async () => {
  //   if (finalData.length > 0) {
  //     try {
  //       await suppliesModel.insert(finalData).then(() => console.log(`${finalData.length} supplies data inserted successfully`))
  //     } catch (err) {
  //       console.log("Something went wrong")
  //       console.error(err)
  //     }
  //   } else {
  //     console.log("The final data is empty. Please recheck your data and try again");
  //   }
    
  // }, 10000)

}

const injectMstMaterialSupplies = async () => {
  let injectionData = await materialModel.getInjectAvg()
  let totalMaterial = 0
  injectionData.forEach(async data => {
    let material = await materialModel.getByCode(data.material_code)
    if (material.length == 1 && (material[0].average_price == null || material[0].average_price == 0) && data.average_price != 0) {
      console.log(`(Before) Material: ${data.material_code}, Price: ${data.average_price}`);
      let avgPriceData = { average_price: data.average_price }
      await materialModel.updateByCode(data.material_code, avgPriceData)
      totalMaterial++
      console.log(`(After) Data-${totalMaterial} added`);
    }
  })
}

function getUniqueData(arr, property) {
  let uniqueData = {};
  let result = [];

  for (let obj of arr) {
    let value = obj[property];
    if (!uniqueData[value]) {
      uniqueData[value] = obj;
      result.push(obj);
    }
  }

  return result;
}

module.exports = {
  injectTrSuppliesBudget,
  injectMstMaterialSupplies,
  sapSupplies
}