const getMainPage = function (req, res) {
    res.render('./main/index.ejs');
}

const getAboutPage = function (req, res) {
    res.render('./main/about.ejs');
}

const getContactPage = function (req, res) {
    res.render('./main/contact.ejs');
}

const getMapPage = function (req, res) {
    res.render('./main/map.ejs');
}

const getOlgrimPage = function (req, res) {
    res.render('./main/olgrim.ejs');
}

module.exports = { getMainPage, getAboutPage, getContactPage, getMapPage, getOlgrimPage };