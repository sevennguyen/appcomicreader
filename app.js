const PORT = 3000

var express = require('express')
var app = express()
var mysql = require('mysql')
var myConnection = require('express-myconnection')
var bodyParser = require('body-parser')

//
var crypto = require('crypto');
var uuid = require('uuid');

var config = require('./db')

var dbOptions = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.db
}



var routes = require('./routes/index')
var publicDir = (__dirname + '/public/'); // set static dir for display image


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type', 'Authorization');
    next();
});



app.use(express.static(publicDir));
app.use(myConnection(mysql, dbOptions, 'pool'))
app.use(bodyParser.urlencoded({ extended: true })) // accept url param
app.use(bodyParser.json())





app.use(function (err, req, res, next) {
    if (err.name === 'Uauthorization')
        res.status(401).send(JSON.stringify({ success: false, message: "Invalid Json Web Token" }));
    else
        next(err);
});

app.use("/", routes)
app.listen(PORT, () => {
    console.log('BACKEND running on PORT ' + PORT)
})
