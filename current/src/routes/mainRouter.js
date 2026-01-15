var router = require('express').Router();
const controller = require('../controllers/mainController');

router.route('/')
    .get(controller.getMainPage);

// router.route('/about')
//     .get(controller.getAboutPage);

router.route('/contact')
    .get(controller.getContactPage);

router.route('/research')
    .get(controller.getPublications);

router.route('/team')
    .get(controller.getTeam);

router.route('/OlgrimPage')
    .get(controller.getOlgrimPage);

router.route('/map')
    .get(controller.getMapPage);

router.route('/test')
    .get(controller.getTestPage);

// -----------------------------------------

router.route('/kakao')
    .get(controller.getKakaoMap);

router.route('/naver')
    .get(controller.getNaverMap);

router.route('/google')
    .get(controller.getGoogleMap);

router.route('/vworld')
    .get(controller.getVworldMap);


module.exports = router;