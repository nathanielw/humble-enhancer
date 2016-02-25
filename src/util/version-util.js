'use strict';

/**
 * @param {string} verString Semantic version string to parse
 * @return {number} Major version of the parsed version string
 */
export function getMajorVersion(verString) {
	return parseInt(verString.split('.')[0]);
}

/**
 * @param {string} verString Semantic version string to parse
 * @return {number} Minor version of the parsed version string
 */
export function getMinorVersion(verString) {
	return parseInt(verString.split('.')[1]);
}
