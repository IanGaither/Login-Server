//ResponseTemplates.js


/** 
 * Constructs a failure response.
 * @param {Object} reason - The reason the request failed.
 */
module.exports.fail = function(reason)
{
	return {status: 'fail', reason: reason};
}

/** 
 * Constructs a success response.
 * @param {Object} data - The data requested by the user.
 */
module.exports.success = function (data)
{
	return {status: 'success', data: data};
}