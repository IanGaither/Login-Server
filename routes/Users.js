//routes/Users.js

const userdb = require('../interface/MongoInterface');
const sessiondb = require('../interface/RedisInterface');
const template = require('../ResponseTemplates');


/** 
 * Creates a user object.
 * @constructor
 * @param {string} user - The username to be stored in this user.
 * @param {string} pass - The password to be stored in this user.
 */
function User(user, pass)
{
	this.username = user;
	this.password = pass;
	this.avatar = 'default';
};


/** 
 * Creates a new user in the database and returns the ID of that user if successful.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function create(req, res)
{
	let user = new User(req.body.username, req.body.password);
	
	if(req.body.avatar)
	{
		user.avatar = req.body.avatar;
	}
	
	userdb.addUser(user, function (result)
	{
		if(result === null)
		{
			res.send(template.fail({username : 'Already taken'}));
		}
		else
		{
			res.send(template.success({id : result, username : req.body.username}));
		}
	});
}

/** 
 * Logs the user in and returns the session ID and token.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function login(req, res)
{
	userdb.findByUsername(req.body.username, function (result)
	{
		//user was found passwords match
		if(result && result.password === req.body.password)
		{
			sessiondb.createSession(result, function (sessionID, token)
			{
				var data = {id: result._id, session: sessionID, token: token};
				res.send(template.success(data));
			});
		}
		//not found/passwords don't match
		else
		{
			res.send(template.fail('Username/password mismatch'));
		}
	});
}

/** 
 * Searches the database for the given user ID and returns their avatar and username.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function get(req, res)
{
	sessiondb.findSessionByID(req.body._session, req.body._token, function (session)
	{
		//valid session
		if(session)
		{
			userdb.findByID(req.params.id, function (result)
			{
				//user exists
				if(result)
				{
					if(result.avatar !== 'default')
					{
						var data = {id: result._id, username: result.username, avatar: result.avatar};
						res.send(template.success(data));
					}
					else
					{
						var data = {id: result._id, username: result.username};
						res.send(template.success(data));
					}
				}
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
 * Searches the database for the given username and returns their avatar and ID.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function find(req, res)
{
	sessiondb.findSessionByID(req.body._session, req.body._token, function (session)
	{
		//valid session
		if(session)
		{
			userdb.findByUsername(req.params.username, function (result)
			{
				//user exists
				if(result)
				{
					if(result.avatar !== 'default')
					{
						var data = {id: result._id, username: result.username, avatar: result.avatar};
						res.send(template.success(data));
					}
					else
					{
						var data = {id: result._id, username: result.username};
						res.send(template.success(data));
					}
				}
				else
				{
					res.send(template.fail({username: 'Not found'}));
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
 * Updates the database for this user with the data provided in the request.
 * @param {Object} req - The request information.
 * @param {Object} res - The response information.
 */
function update(req, res)
{
	sessiondb.findSessionByID(req.body._session, req.body._token, function (session)
	{
		//found session
		if(session)
		{
			//session belongs to user
			if(session.user === req.params.id)
			{
				//if password is being changed
				if(req.body.oldPassword && req.body.newPassword)
				{
					//find user being modified
					userdb.findByID(req.params.id, function (result)
					{
						if(result)
						{
							//current passwords match
							if(result.password === req.body.oldPassword)
							{
								//change avatar at the same time
								if(req.body.avatar)
								{
									userdb.update(req.params.id, {password : req.body.newPassword, avatar : req.body.avatar});
									res.send(template.success({passwordChanged : true, avatar : req.body.avatar}));
								}
								//just change password
								else
								{
									userdb.update(req.params.id, {password : req.body.newPassword});
									res.send(template.success({passwordChanged : true}));
								}
							}
							//incorrect password
							else
							{
								res.send(template.fail({oldPassword: 'Forbidden'}));
							}
						}
						//session has no user attached, shouldn't happen.
						else
						{
							res.send(template.fail({id: 'Not found'}));
						}
					});
				}
				//password isnt being changed
				else
				{
					//make sure avatar was included
					if(req.body.avatar)
					{
						userdb.update(req.params.id, {avatar: req.body.avatar});
						var data = {passwordChanged : false, avatar: req.body.avatar};
						res.send(template.success(data));
					}
					//nothing changed
					else
					{
						res.send(template.success({passwordChanged : false}));
					}
				}
			}
			//user trying to modify different user
			else
			{
				res.send(template.fail({id: 'Forbidden'}));
			}
		}
		//invalid session
		else
		{
			res.send(template.fail({_token: 'Invalid'}));
		}
	});

		
}

/** 
 * Registers all of the user endpoints in the express app.
 * @param {Object} app - The express app listening for new connections.
 * @param {string} root - The route root.
 */
module.exports.register = function(app, root)
{
	app.post(root + 'create', create);
	app.post(root + 'login', login);
	app.post(root + ':id/get', get);
	app.post(root + 'find/:username', find);
	app.post(root + ':id/update', update);
}