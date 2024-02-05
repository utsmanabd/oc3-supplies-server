const express = require('express');
const router = express.Router();
const UserController = require('../../controller/master_controller/UserController');
const CalculationController = require('../../controller/master_controller/CalculationController');
const CostCenterController = require('../../controller/master_controller/CostCenterController');
const LineController = require('../../controller/master_controller/LineController');
const MaterialController = require('../../controller/master_controller/MaterialController');
const PlantController = require('../../controller/master_controller/PlantController');
const ProdplanController = require('../../controller/master_controller/ProdplanController');
const SuppliesController = require('../../controller/master_controller/SuppliesController');


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
router.get('/material/with-price', MaterialController.getMaterialWithPriceAvailable)
router.get('/material/:id', MaterialController.getMaterialById)
router.post('/material', MaterialController.insertMaterial);
router.post('/material/search', MaterialController.searchMaterial);
router.put('/material/:id', MaterialController.updateMaterial)

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
router.put('/supplies/:id', SuppliesController.updateSuppliesBudget)

// Users
router.get('/users', UserController.getAllUsers)
router.get('/users/role', UserController.getUserRole)
router.get('/users/:id', UserController.getUserByNik)
router.get('/users/is-exists/:nik', UserController.isNIKExists)
router.post('/users', UserController.insertUser)
router.put('/users/:id', UserController.updateUser)

module.exports = router;