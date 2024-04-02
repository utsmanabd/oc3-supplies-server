const express = require('express');
const router = express.Router();

const _XlsxController = require('../../controller/master_controller/_XlsxController')

router.get('/xlsx/actual-template', _XlsxController.getActualXlsxTemplate)
router.get('/xlsx/plan-template', _XlsxController.getPlanXlsxTemplate)
router.get('/xlsx/material-template', _XlsxController.getMaterialXlsxTemplate)
router.get('/xlsx/avgprice-template', _XlsxController.getAvgPriceUpdateXlsxTemplate)

module.exports = router;