//routes/Game.js

const crypto = require('crypto');

const userdb = require('../interface/MongoInterface');
const sessiondb = require('../interface/RedisInterface');
const template = require('../ResponseTemplates');


/** 
 * Fetches the location (hostname/IP and port) of the game server.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function connect(req, res)
{
	sessiondb.findSessionByID(req.body._session, req.body._token, function (session)
	{
		//valid session
		if(session)
		{
			userdb.findByID(session.user, function (result)
			{
				var hash = crypto.createHmac('sha256', process.env.SECRET).update(result.username + result.avatar + result.id).digest('hex');
				//user exists
				if(result)
				{
					var data = {id: result._id, username: result.username, avatar: result.avatar, token: hash,
					server : process.env.SERVER_HOSTNAME + ':' + process.env.SERVER_PORT};
					res.send(template.success(data));
				}
				//session has no user attached, shouldn't happen.
				else
				{
					res.send(template.fail({id: 'Not found'}));
				}
			});
		}
		else
		{
			res.send(template.fail({_token: 'Invalid'}));
		}
	});
}

/** 
 * Registers all of the game endpoints in the express app.
 * @param {Object} app - The express app listening for new connections.
 * @param {string} root - The route root.
 */
module.exports.register = function(app, root)
{
	app.post(root + 'connect', connect);
}