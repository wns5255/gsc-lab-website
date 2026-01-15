const readDir = require('../service/readDir');

const objDir = '/home/node/app/public/plyAssets/object';
const roomDir = '/home/node/app/public/plyAssets/room';
const listDir = '/home/node/app/public/plyAssets/list';

const fs = require('fs');

const getIndexPage = function (req, res) {
    res.render('./ply/index.ejs');
}

const getSelectModeObjPage = function (req, res) {
    res.render('./ply/select_mode_obj.ejs');
}

const getSelectModeRoomPage = function (req, res) {
    res.render('./ply/select_mode_room.ejs');
}

const getSelectOneArPage = function (req, res) {
    fs.readdir(roomDir, function (err, list) {
        if (err) {
            console.log(err);
            res.render('./ply/select_one_ar.ejs', { result: '' });
        }
        res.render('./ply/select_one_ar.ejs', { result: list });
    })
}

const getSelectOneVrPage = function (req, res) {
    fs.readdir(roomDir, function (err, list) {
        if (err) {
            console.log(err);
            res.render('./ply/select_one_vr.ejs', { result: '' });
        }
        res.render('./ply/select_one_vr.ejs', { result: list });
    })
}

const getSelectTwoArPage = function (req, res) {
    fs.readdir(objDir, function (err, list) {
        if (err) {
            console.log(err);
            res.render('./ply/select_two_ar.ejs', { result: '' });
        }
        res.render('./ply/select_two_ar.ejs', { result: list });
    })
}

const getSelectTwoVrPage = function (req, res) {
    fs.readdir(objDir, function (err, list) {
        if (err) {
            console.log(err);
            res.render('./ply/select_two_vr.ejs', { result: '' });
        }
        res.render('./ply/select_two_vr.ejs', { result: list });
    })
}

module.exports = {
    getIndexPage,
    getSelectModeObjPage,
    getSelectModeRoomPage,
    getSelectOneArPage,
    getSelectOneVrPage,
    getSelectTwoArPage,
    getSelectTwoVrPage
}