//RedisInterface.js

const redis = require('redis');
const uuidv4 = require('uuid/v4');
const timeout = 5 * 60; // five minutes
var redisConnection;

// Connects to the redis database
redisConnection = redis.createClient(process.env.REDIS_URL);


/** 
 * Creates a session associated with a user ID.
 * @param {Object} user - The user containing the ID to associate with this session.
 * @param {function} callback - Function to receive the session information.
 */
exports.createSession = function (user, callback)
{
	let sessionID = uuidv4();
	let token = uuidv4();
	let key = 'SESSION : ' + sessionID;
	let session = 
	{
		user : user._id,
		token : token
	};
	
	redisConnection.hmset(key, session, function (err, reply)
	{
		if(err) throw err;
		setExpiration(sessionID); // set an expiration on the session
		callback(sessionID, token);
	});
}

/** 
 * Looks up a session in the connected database.
 * @param {string} sessionID - The session ID.
 * @param {string} token - The token for the session.
 * @param {function} callback - Function to receive the session information.
 */
exports.findSessionByID = function (sessionID, token, callback)
{
	let key = 'SESSION : ' + sessionID;
	redisConnection.hgetall(key, function (err, session)
	{
		if(err) throw err;
		if(session && session.token === token)
		{
			setExpiration(sessionID); // refresh the session expiration
			callback(session);
		}
		else
		{
			callback(null);
		}
	});
}

/** 
 * Sets an expiration timer on the session.
 * @param {string} sessionID - The session ID.
 */
function setExpiration(sessionID)
{
	let key = 'SESSION : ' + sessionID;
	redisConnection.expire(key, timeout);
}