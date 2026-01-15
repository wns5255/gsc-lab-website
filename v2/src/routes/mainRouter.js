var router = require('express').Router();
const controller = require('../controllers/mainController');

router.route('/')
    .get(controller.getMainPage);

router.route('/about')
    .get(controller.getAboutPage);

router.route('/contact')
    .get(controller.getContactPage);

router.route('/map')
    .get(controller.getMapPage);

router.route('/olgrim')
    .get(controller.getOlgrimPage);

module.exports = router;