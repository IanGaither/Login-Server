//MongoInterface.js

const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let dbName = "UserDB"; // database name
let collectionName = "Users"; // table name
var mongoDatabase; // handle for database


// Connects to mongo database
mongo.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, mongoConnection)
{
	mongoDatabase = mongoConnection.db(dbName);
});


/** 
 * Adds a user to the connected database.
 * @param {Object} user - A user (User.js) with a username, password and avatar.
 * @param {function} callback - Function to receive the ID returned from the database.
 */
exports.addUser = function(user, callback)
{
	mongoDatabase.collection(collectionName).findOne({username : user.username}, function(err, result)
	{
			if(err) throw err;
			//user already exists
			if(result)
			{
				callback(null);
			}
			else
			{
				mongoDatabase.collection(collectionName).insertOne(user, function (err, result)
				{
					if(err) throw err;
					callback(result.insertedId);
				});
			}
	});
}

/** 
 * Looks up a username in the connected database.
 * @param {string} username - The username to lookup.
 * @param {function} callback - Function to receive the result of the username lookup.
 */
exports.findByUsername = function (username, callback)
{
	mongoDatabase.collection(collectionName).findOne({username : username}, function(err, result)
	{
			if(err) throw err;
			callback(result)
	});
}

/** 
 * Looks up an ID in the connected database.
 * @param {string} id - The ID to lookup.
 * @param {function} callback - Function to receive the result of the ID lookup.
 */
exports.findByID = function (id, callback)
{
	try
	{
		mongoDatabase.collection(collectionName).findOne({_id : ObjectID(id)}, function(err, result)
		{
			if(err) throw err;
			callback(result)
		});
	}
	//catches invalid/improperly formatted IDs
	catch(err)
	{
		callback(null);
	}
}

/** 
 * Updates values in the connected database.
 * @param {string} id - The ID of the user being changed.
 * @param {Object} data - An object containing the pairs of data to update.
 */
exports.update = function (id, data)
{
	mongoDatabase.collection(collectionName).updateOne({_id : ObjectID(id)}, {$set : data}, function (err, user)
	{
		if(err) throw err;
	});
}