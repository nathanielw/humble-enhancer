/*global __VERSION__ */

'use strict';

import * as Cache from '../cache';
import * as VersionUtil from './version-util';

const TYPE_VERSION = 'version';
const ID_VERSION = 'installed';
const VERSION = __VERSION__;

/**
 * Check if the script has been updated and performs any necessary prep/cleanup tasks
 */
export default function updateTasks() {
	let oldVersion = Cache.getValue(TYPE_VERSION, ID_VERSION);

	if (!oldVersion) {
		performTasks();
	} else {
		let oldMajor = VersionUtil.getMajorVersion(oldVersion);
		let newMajor = VersionUtil.getMajorVersion(VERSION);
		let oldMinor = VersionUtil.getMinorVersion(oldVersion);
		let newMinor = VersionUtil.getMinorVersion(VERSION);

		// Run tasks if the major version number has changed, or if we're pre-1.0.0 and the minor version has changed
		if ((newMajor !== oldMajor) || (newMajor === 0 && (oldMinor !== newMinor))) {
			performTasks();
		}
	}
}

function performTasks() {
	Cache.clearAll();
	Cache.setValue(TYPE_VERSION, ID_VERSION, VERSION);
}
