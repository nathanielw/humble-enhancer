'use strict';

export default class Quantizer {
	constructor(low, high, values) {
		this.low = low;
		this.high = high;
		this.values = values;
	}

	quantize(value) {
		let maxIndex = this.values.length - 1;
		let ratio = (value - this.low)/(this.high - this.low);
		let index = Math.ceil(ratio * this.values.length) - 1;
		index = Math.max(Math.min(index, maxIndex), 0);

		return this.values[index];
	}
}
