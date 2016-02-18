'use strict';

/**
 * Sends an HTTP GET request to the given URL
 * @param {string} url URL to send the request to
 * @param {object} params Object containg key-value pairs of parameters to send as the URL's query string
 * @param {NetworkUtil~responseCallback} callback Function to call with returned data.
 */
export function httpGet(url, params, callback) {
	GM_xmlhttpRequest({
		url: url + '?' + queryStringify(params),
		method: 'GET',
		onload: responseHandler(callback),
		onerror: responseHandler(callback, true)
	});
}

/**
 * Converts the key-value pairs of the given object to a URI-encoded query string
 * @param {object} params Object containg key-value pairs to convert
 * @return {string} An empty string if no parameters/key-value pairs are provided. A URI-encoded string with the format
 *                  key=value&foo=bar
 */
export function queryStringify(params) {
	let queryString = '';

	if (params) {
		queryString = Object.keys(params).reduce((a,k) => {
			a.push(k + '=' +encodeURIComponent(params[k]));
			return a;
		}, []).join('&');
	}

	return queryString;
}

/**
 * @param {NetworkUtil~responseCallback} callback Function to call with returned data
 * @param {boolean} wasError True if an error occurred with making the request
 * @return {function} Function that, when called, processes the response from HTTP requests. Expects a single argument:
 *                    a Greasemonkey Request Object
 */
function responseHandler(callback, wasError) {
	return function(response) {
		if (wasError || response.status !== 200) {
			callback(new Error(`Error communicating with server. ${response.status} ${response.statusText}`), null);
		} else {
			callback(null, response.responseText);
		}
	};
}


/**
 * @callback NetworkUtil~responseCallback
 * @param {Error} err Error object, if a non-200 response was returned, null otherwise
 * @param {string} data Body of the response.
 */
