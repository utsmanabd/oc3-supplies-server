const express = require('express');
const router = express.Router();
const UserController = require('../../controller/master_controller/UserController');
const CalculationController = require('../../controller/master_controller/CalculationController');
const CostCenterController = require('../../controller/master_controller/CostCenterController');
const LineController = require('../../controller/master_controller/LineController');
const MaterialController = require('../../controller/master_controller/MaterialController');
const AveragPriceController = require('../../controller/master_controller/AveragePriceController')
const PlantController = require('../../controller/master_controller/PlantController');
const ProdplanController = require('../../controller/master_controller/ProdplanController');
const SuppliesController = require('../../controller/master_controller/SuppliesController');
const DashboardController = require('../../controller/master_controller/DashboardController');
const ActualController = require('../../controller/master_controller/ActualController');
const _XLSXController = require('../../controller/master_controller/_XlsxController')


// Middleware
const { uploadXlsx, handleUploadError } = require('../../services/file-handler.service');

// Calculation Budget
router.get('/calculation', CalculationController.getAllCalculation)
router.get('/calculation/:id', CalculationController.getCalculationById)
router.post('/calculation', CalculationController.insertCalculation)
router.put('/calculation/:id', CalculationController.updateCalculation)

// Factory Cost Center
router.get('/costctr', CostCenterController.getAllCostCenter)
router.get('/costctr/:id', CostCenterController.getCostCenterById)
router.post('/costctr', CostCenterController.insertCostCenter)
router.post('/costctr/search', CostCenterController.searchCostCenter)
router.put('/costctr/:id', CostCenterController.updateCostCenter)

// Factory Line
router.get('/line', LineController.getAllLine)
router.get('/line/:id', LineController.getLineById)
router.post('/line', LineController.insertLine)
router.put('/line/:id', LineController.updateLine)

// Material Supplies
router.get('/material', MaterialController.getAllMaterial)
router.get('/material/uom', MaterialController.getAllUOM)
router.get('/material/pagination', MaterialController.getMaterialByPagination)
router.get('/material/with-price', MaterialController.getMaterialWithPriceAvailable)
router.get('/material/:id', MaterialController.getMaterialById)
router.get('/material/code/:code', MaterialController.getMaterialByCode)
router.post('/material', MaterialController.insertMaterial);
router.post('/material/search', MaterialController.searchMaterial);
router.post('/material/search/pagination', MaterialController.searchMaterialByPagination);
router.put('/material/:id', MaterialController.updateMaterial)

// Average Price
router.get('/avg-price', AveragPriceController.getAllAveragePrice)
router.get('/avg-price/:id', AveragPriceController.getAveragePriceById)
router.post('/avg-price', AveragPriceController.insertAveragePrice)
router.put('/avg-price/:id', AveragPriceController.updateAveragePrice)

// Factory Plant
router.get('/plant', PlantController.getAllFactoryPlant)
router.get('/plant/:id', PlantController.getFactoryPlantById)
router.post('/plant', PlantController.insertFactoryPlant)
router.put('/plant/:id', PlantController.updateFactoryPlant)

// Prodplan
router.get('/prodplan', ProdplanController.getAllProdplan)
router.get('/prodplan/year', ProdplanController.getProdplanGroupYears)
router.get('/prodplan/:id', ProdplanController.getProdplanById)
router.get('/prodplan/year/:year', ProdplanController.getProdplanByYear)
router.get('/prodplan/year-line/:year/:line', ProdplanController.getProdplanByYearAndLine)
router.get('/prodplan/year-line/is-available/:year/:line', ProdplanController.isProdplanExists)
router.post('/prodplan', ProdplanController.insertProdplan)
router.put('/prodplan/:id', ProdplanController.updateProdplan)

// Supplies Budget
router.get('/supplies', SuppliesController.getAllSuppliesBudget)
router.get('/supplies/:id', SuppliesController.getSuppliesBudgetById)
router.get('/supplies/year-line/:year/:line', SuppliesController.getSuppliesByYearAndLine)
router.get('/supplies/year-costctr/:year/:costctr', SuppliesController.getSuppliesByYearAndCostCenter)
router.get('/supplies/budget-id/is-available/:budgetid', SuppliesController.isBudgetIdExist)
router.post('/supplies', SuppliesController.insertSuppliesBudget)
router.post('/supplies/multiple', SuppliesController.updateMultipleSupplies)
router.post('/supplies/budget-prodplan/:budgetid', SuppliesController.updateWithBudgetAndProdplanId)
router.put('/supplies/:budgetid', SuppliesController.updateSuppliesBudget)

// Users
router.get('/users', UserController.getAllUsers)
router.get('/users/role', UserController.getUserRole)
router.get('/users/:id', UserController.getUserByNik)
router.get('/users/is-exists/:nik', UserController.isNIKExists)
router.post('/users', UserController.insertUser)
router.put('/users/:id', UserController.updateUser)

// Dashboard
router.get('/dashboard/line-by-year', DashboardController.getBudgetPerLineByYear)
router.get('/dashboard/section-by-line', DashboardController.getBudgetPerSectionByLine)
router.get('/dashboard/month-by-line', DashboardController.getBudgetPerMonthByLine)
router.get('/dashboard/supply-by-line', DashboardController.getBudgetPerSupplyByLine)
router.get('/dashboard/top-by-line', DashboardController.getTop5SuppliesByLine)
router.get('/dashboard/sectionmonth-by-line', DashboardController.getBudgetPerSectionMonthByLine)
router.get('/dashboard/month-by-section', DashboardController.getBudgetPerMonthBySection)

// Actual
router.get('/actual/supplies/:year/:line', ActualController.getActualSuppliesByYearAndLine)
router.get('/actual/line-by-year', ActualController.getActualPerLineByYear)
router.get('/actual/section-by-line', ActualController.getActualPerSectionByLine)
router.get('/actual/sectionmonth-by-line', ActualController.getActualPerSectionMonthByLine)
router.get('/actual/supply-by-line', ActualController.getActualPerSupplyByLine)
router.get('/actual/prodplan/year-line/:year/:line', ActualController.getProdplanByYearAndLine)
router.post('/actual', ActualController.insertActualBudget)

// XLSX
router.post('/xlsx/actual', uploadXlsx.single('file'), handleUploadError, _XLSXController.checkUploadedActual, _XLSXController.uploadActualBudget)
router.post('/xlsx/plan', uploadXlsx.single('file'), handleUploadError, _XLSXController.checkUploadedPlan, _XLSXController.uploadPlanBudget)

module.exports = router;