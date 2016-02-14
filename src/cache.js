const EXPIRY_PREFIX = 'expiry';
const LAST_CLEARED_KEY = 'lastcleared';

/**
 * Retrieves a value from the cache
 * @param {string} type The type/category of item being retrieved
 * @param {[type]} id ID of the item
 * @return {*} The value/item from the cache, or undefined if the item is not in the cache
 */
export function getValue(type, id) {
	let value = GM_getValue(type + ':' + id);

	try {
		return JSON.parse(value);
	} catch (ex) {
		return value;
	}
}

/**
 * Stores a value in the cache (or overwrites an existing value)
 * @param {string} type The type/category of item being stored
 * @param {string} id ID of the item. Should be unique within the type/category
 * @param {*} value Value to store in the cache
 * @param {number=} expiry Unix timestamp after which the item should be considered expired
 */
export function setValue(type, id, value, expiry) {
	if(typeof value === 'object') {
		value = JSON.stringify(value);
	}

	GM_setValue(formatKey(type, id), value);

	if (expiry !== undefined) {
		GM_setValue(formatKey(EXPIRY_PREFIX, formatKey(type, id)), expiry);
	}
}

/**
 * Removes any items from the cache if their expiry time/date has been reached
 */
export function clearExpired() {
	let keys = GM_listValues();
	let now = Date.now();

	GM_setValue(LAST_CLEARED_KEY, now);

	keys.forEach(key => {
		if(key.lastIndexOf(EXPIRY_PREFIX, 0) === 0) {
			let expiry = GM_getValue(key);
			if (expiry <= now) {
				let mainKey = expiryKeyToKey(key);
				GM_deleteValue(mainKey);
			}
		}
	});
}

/**
 * @return {number} Unix timestamp of the last time #clearExpired() was called.
 *                  If the cache has never been checked/cleared, the current time will be returned.
 */
export function getLastCleared() {
	let time = GM_getValue(LAST_CLEARED_KEY);

	if (time === undefined) {
		time = Date.now();
		GM_setValue(LAST_CLEARED_KEY, time);
	}

	return time;
}

function formatKey(type, id) {
	return `${type}:${id}`;
}

function expiryKeyToKey(expiryKey) {
	return expiryKey.substring(EXPIRY_PREFIX.length + 1); // + 1 for the colon/separater
}
