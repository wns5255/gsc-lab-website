const getMainPage = function (req, res) {
    res.render('./main/index.ejs');
}

// const getAboutPage = function (req, res) {
//     res.render('./main/about.ejs');
// }

const getContactPage = function (req, res) {
    res.render('./main/contact.ejs');
}

const getPublications = function (req, res) {
    res.render('./main/publications.ejs');
}

const getTeam = function (req, res) {
    res.render('./main/team.ejs');
}

const getOlgrimPage = function (req, res) {
    res.render('./main/olgrim.ejs');
}

const getMapPage = function (req, res) {
    res.render('./main/map.ejs');
}

const getTestPage = function (req, res) {
    res.render('./main/test.ejs');
}

const getKakaoMap = function (req, res) {
    res.render('./main/kakao.ejs');
}

const getNaverMap = function (req, res) {
    res.render('./main/naver.ejs');
}

const getGoogleMap = function (req, res) {
    res.render('./main/google.ejs');
}

const getVworldMap = function (req, res) {
    res.render('./main/vworld.ejs');
}


module.exports = { getMainPage, getContactPage,getPublications, getTeam, getOlgrimPage, getMapPage, getTestPage, getKakaoMap, getNaverMap, getGoogleMap, getVworldMap};