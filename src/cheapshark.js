'use strict';

import *  as net from './util/network-util';

const API_URL = 'http://www.cheapshark.com/api/1.0/';

/**
 * Helper for accessing the /games endpoint of the CheapShark API.
 * @param {Object} opts Key-value pairs of parameters to pass to the API - see the CheapShark docs for valid values.
 * @param {Cheapshark~dataCallback} callback Function to call with returned data.
 */
export function games(opts, callback) {
	sendGet('games', opts, callback);
}

/**
 * Helper for accessing the /deals endpoint of the CheapShark API.
 * @param {Object} opts Key-value pairs of parameters to pass to the API - see the CheapShark docs for valid values.
 * @param {Cheapshark~dataCallback} callback Function to call with returned data.
 */
export function deals(opts, callback) {
	sendGet('deals', opts, callback);
}

function sendGet(endpoint, opts, callback) {
	net.httpGet(
		API_URL + endpoint,
		opts,
		responseHandler(callback),
		responseHandler(callback)
	);
}

/**
 * Processes the response from API requests
 * @param {Cheapshark~dataCallback} callback Function to call with returned data.
 * @return {Function} Function that expects a single argument: a Greasemonkey Request Object
 */
function responseHandler(callback) {
	return function(err, response) {
		if(err) {
			callback(err, null);
		} else {
			let data = JSON.parse(response);
			callback(null, data);
		}
	};
}

/**
 * @callback Cheapshark~dataCallback
 * @param {Error} err
 * @param {Object} data Data returned by the API.
 */
