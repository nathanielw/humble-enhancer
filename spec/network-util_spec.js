'use strict';

import * as net from '../src/network-util';

describe('queryStringify', () => {
	it('returns a query string containing the given k-v pairs', () => {
		let params = net.queryStringify({key: 'value', foo: 'bar'});
		expect(params).toBe('key=value&foo=bar');
	});

	it('encodes special characters', () => {
		let params = net.queryStringify({key: '&='});
		expect(params).toBe('key=%26%3D');
	});

	it('handles empty objects by returning an empty string', () => {
		let params = net.queryStringify({});
		expect(params).toBe('');
	});
});
