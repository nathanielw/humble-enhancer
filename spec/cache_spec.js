'use strict';

import * as cache from '../src/cache';

describe('setValue', () => {
	beforeAll(() => {
		jasmine.getGlobal().GM_setValue = function(){};
	});

	beforeEach(() => {
		spyOn(jasmine.getGlobal(), 'GM_setValue');
	});

	it('converts objects to JSON strings before storing', () => {
		let obj = {foo: 'bar'};
		cache.setValue('key', 'id', obj);

		expect(jasmine.getGlobal().GM_setValue).toHaveBeenCalledWith(jasmine.any(String), JSON.stringify(obj));
	});

	it('converts arrays to JSON strings before storing', () => {
		let arr = ['foo', 'bar', { baz: 'foo' }];
		cache.setValue('key', 'id', arr);

		expect(jasmine.getGlobal().GM_setValue).toHaveBeenCalledWith(jasmine.any(String), JSON.stringify(arr));
	});

	it('does not alter numbers before storing', () => {
		let num = 42;
		cache.setValue('key', 'id', num);

		expect(jasmine.getGlobal().GM_setValue).toHaveBeenCalledWith(jasmine.any(String), num);
	});

	it('does not alter strings before storing', () => {
		let str = 'testing';
		cache.setValue('key', 'id', str);

		expect(jasmine.getGlobal().GM_setValue).toHaveBeenCalledWith(jasmine.any(String), str);
	});

	it('does not alter null before storing', () => {
		let n = null;
		cache.setValue('key', 'id', n);

		expect(jasmine.getGlobal().GM_setValue).toHaveBeenCalledWith(jasmine.any(String), n);
	});
});

describe('getValue', () => {
	beforeAll(() => {
		jasmine.getGlobal().GM_getValue = function(){};
	});

	it('converts JSON strings to objects before returning', () => {
		let obj = {foo: 'bar'};
		let str = JSON.stringify(obj);

		spyOn(jasmine.getGlobal(), 'GM_getValue').and.returnValue(str);
		let returned = cache.getValue('key', 'id');
		expect(returned).toEqual(obj);
	});

	it('Returns non-JSON string values as a string', () => {
		let str = 'foo';

		spyOn(jasmine.getGlobal(), 'GM_getValue').and.returnValue(str);
		let returned = cache.getValue('key', 'id');
		expect(returned).toEqual(str);
	});
});
