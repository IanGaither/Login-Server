const express = require('express');
const bodyParser = require('body-parser');

const users = require('./routes/Users');
const game = require('./routes/Game');
const template = require('./ResponseTemplates');

let root = '/api/v1/'; //route root

// initialize express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//https validation
app.use(function(req, res, next)
{
	if(req.headers["x-forwarded-proto"] === "https")
	{
		next();
	}
	else
	{
		res.send(template.fail("Encryption required"));
	}
});

// set endpoint
users.register(app, root + 'users/');
game.register(app, root + 'game/');

// listen for connections
const server = app.listen(process.env.NODE_PORT);