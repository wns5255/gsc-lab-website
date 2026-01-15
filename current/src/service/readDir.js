var fs = require('fs');

const readDir = function (dir) {
    var list;

    list = fs.readdir(dir, function (error, list) {

    })

    console.log(list);
    return list;
}

module.exports = { readDir };