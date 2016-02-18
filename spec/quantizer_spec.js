'use strict';

import Quantizer from '../src/quantizer';

describe('Quantizer', () => {

	describe('When given a range starting at 0', () => {
		let low = 0;
		let high = 99;
		let values = ['0s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'];
		let quantizer = new Quantizer(low, high, values);

		it('Maps the lower limit to the lowest value', () => {
			expect(quantizer.quantize(low)).toEqual(values[0]);
		});

		it('Maps the upper limit to the highest value', () => {
			expect(quantizer.quantize(high)).toEqual(values[values.length - 1]);
		});

		it('Maps values outside the bounds correctly', () => {
			expect(quantizer.quantize(150)).toEqual(values[values.length - 1]);
			expect(quantizer.quantize(-150)).toEqual(values[0]);
		});

		it('Maps values on the bounds of bands correctly', () => {
			expect(quantizer.quantize(9)).toEqual(values[0]);
			expect(quantizer.quantize(10)).toEqual(values[1]);
			expect(quantizer.quantize(19)).toEqual(values[1]);
		});

		it('Maps values in the middle of bands correctly', () => {
			expect(quantizer.quantize(5)).toEqual(values[0]);
			expect(quantizer.quantize(15)).toEqual(values[1]);
		});
	});

	describe('Maps ranges that start higher than 0', () => {
		let low = 50;
		let high = 99;
		let values = ['50s', '60s', '70s', '80s', '90s'];
		let quantizer = new Quantizer(low, high, values);

		it('Maps the lower limit to the lowest value', () => {
			expect(quantizer.quantize(low)).toEqual(values[0]);
		});

		it('Maps the upper limit to the highest value', () => {
			expect(quantizer.quantize(high)).toEqual(values[values.length - 1]);
		});

		it('Maps values outside the bounds correctly', () => {
			expect(quantizer.quantize(150)).toEqual(values[values.length - 1]);
			expect(quantizer.quantize(0)).toEqual(values[0]);
		});

		it('Maps values on the bounds of bands correctly', () => {
			expect(quantizer.quantize(59)).toEqual(values[0]);
			expect(quantizer.quantize(60)).toEqual(values[1]);
			expect(quantizer.quantize(69)).toEqual(values[1]);
		});

		it('Maps values in the middle of bands correctly', () => {
			expect(quantizer.quantize(75)).toEqual(values[2]);
		});
	});

	describe('Maps ranges that include negative numbers', () => {
		let low = -99;
		let high = -50;
		let values = ['-99s', '-80s', '-70s', '-60s', '-50s'];
		let quantizer = new Quantizer(low, high, values);

		it('Maps the lower limit to the lowest value', () => {
			expect(quantizer.quantize(low)).toEqual(values[0]);
		});

		it('Maps the upper limit to the highest value', () => {
			expect(quantizer.quantize(high)).toEqual(values[values.length - 1]);
		});

		it('Maps values outside the bounds correctly', () => {
			expect(quantizer.quantize(150)).toEqual(values[values.length - 1]);
			expect(quantizer.quantize(-150)).toEqual(values[0]);
		});

		it('Maps values on the bounds of bands correctly', () => {
			expect(quantizer.quantize(-90)).toEqual(values[0]);
			expect(quantizer.quantize(-89)).toEqual(values[1]);
		});

		it('Maps values in the middle of bands correctly', () => {
			expect(quantizer.quantize(-75)).toEqual(values[2]);
		});
	});
});
