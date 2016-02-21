'use strict';

import * as Cheapshark from './cheapshark';
import * as Cache from './cache';
import * as Constants from './constants';

const TYPE_STORES = 'stores';
const STORES_KEY = 'all-stores';

/**
 * Provides access to information about stores
 */
export default class StoreManager {
	/**
	 * Initialises the manager with store info (from the cache or Cheapshark).
	 * @param {Function} callback Callback to call once the manager has finished loading the store info. The StoreManager
	 *                            instance will be passed in as the only argument.
	 */
	init(callback) {
		let stores = Cache.getValue(TYPE_STORES, STORES_KEY);
		let expiry = Date.now() + (Constants.DAYS * 14); // now + 2 weeks

		if (stores !== undefined) {
			this._setStores(stores);
			callback(this);
		} else {
			Cheapshark.stores((err, data) => {
				if (!err) {
					Cache.setValue(TYPE_STORES, STORES_KEY, data, expiry);
					this._setStores(data);
				} else {
					this._setStores([]);
				}

				callback(this);
			});
		}
	}

	/**
	 * Clears the dictionary and adds stores from the given array.
	 * @param {array} stores Array of objects to add
	 * @private
	 */
	_setStores(stores) {
		this._storeDict = {};
		stores.forEach((store) => {
			this._storeDict[store.storeID] = store;
		});
	}

	/**
	 * @param {number} id ID of the store to return
	 * @return {object} Object containing details of the requested store, or undefined if the store cannot be found. See
	 *                         the Cheapshark API docs for format of the returned object.
	 */
	getStore(id) {
		if (this._storeDict === undefined) {
			throw Error('Store manager has not been initialised.');
		}

		return this._storeDict[id];
	}
}
