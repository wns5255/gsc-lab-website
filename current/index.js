// dotenv setting
const dotenv = require('dotenv').config();

const http = require('node:http');
const fs = require('fs');

//const compression = require('compression');

const options = {
    // key: fs.readFileSync('./keys/private.pem'),
    // cert: fs.readFileSync('./keys/public.pem')
};

const hostname = '0.0.0.0';

// Configure node express server
const express = require("express");
const app = express();

const port = 8888;
//const path = require("path")

app.use(express.static('/home/node/app/public'));
//app.use(compression());

app.set('view engine', 'ejs');

app.set('views', '/home/node/app/views');

app.use('/', require('./src/routes/mainRouter.js'));
app.use('/ply', require('./src/routes/plyRouter.js'));


const server = http.createServer(options, app);

server.listen(port, hostname, () => {
    console.log('app started');
})