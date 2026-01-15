var router = require('express').Router();
const controller = require('../controllers/plyController');

router.get('/', (req, res) => {
    res.redirect('/ply/select');
})

router.route('/select')
    .get(controller.getIndexPage);

router.route('/select/obj')
    .get(controller.getSelectModeObjPage);

router.route('/select/room')
    .get(controller.getSelectModeRoomPage);

router.route('/room/AR')
    .get(controller.getSelectOneArPage);

router.route('/room/VR')
    .get(controller.getSelectOneVrPage);

router.route('/obj/AR')
    .get(controller.getSelectTwoArPage);

router.route('/obj/VR')
    .get(controller.getSelectTwoVrPage);

module.exports = router;