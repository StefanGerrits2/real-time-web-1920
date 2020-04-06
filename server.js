require('dotenv').config();
const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const minifyHTML = require('express-minify-html-2');
const compression = require('compression');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, './public/');

// Controllers
const home = require('./routes/home.js');
const notFound = require('./routes/notFound.js');

app
    .set('view engine', 'hbs')
    .engine( 'hbs', hbs( {
        extname: 'hbs',
        defaultLayout: 'main',
        partialsDir: __dirname + '/views/partials/'
    }))
    
    .use(compression())
    .use('/', express.static(publicPath))

    .use(minifyHTML({
        override: true,
        exception_url: false,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            minifyJS: true
        }
    }))

    // Get routes
    .get('/', home)

    // 404 not found
    .use(notFound);

server.listen(port, () => console.log(`Example app listening on port ${port}!`));

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});