'use strict';

import * as VersionUtil from '../src/util/version-util';

describe('VersionUtil', () => {
	let values = [
		['0.0.0', 0, 0],
		['0.0.1', 0, 0],
		['0.1.0', 0, 1],
		['1.9.8', 1, 9],
		['5.0.0', 5, 0],
		['0.54.1', 0, 54],
		['210.54.1', 210, 54]
	];

	describe('getMajorVersion', () => {
		it('Returns the correct value for a range of version strings', () => {
			values.forEach((val) => {
				let ver = VersionUtil.getMajorVersion(val[0]);
				expect(ver).toBe(val[1]);
			});
		});
	});

	describe('getMinorVersion', () => {
		it('Returns the correct value for a range of version strings', () => {
			values.forEach((val) => {
				let ver = VersionUtil.getMinorVersion(val[0]);
				expect(ver).toBe(val[2]);
			});
		});
	});
});
