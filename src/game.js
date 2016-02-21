'use strict';

const TITLE_REGEX = /[^a-zA-Z0-9\s]/g;

/**
 * Model for a single game.
 */
export default class Game {
	constructor(title) {
		this.title = title;
		this.info = {};
	}

	get id() {
		return this.title.replace(TITLE_REGEX, '');
	}

	/**
	 * Copies all properties from the info object to the Game's info object
	 * @param {object} info [description]
	 */
	setInfo(info) {
		for (let attr in info) {
			this.info[attr] = info[attr];
		}
	}

	set deals(deals) {
		this._deals = deals.sort((a, b) => {
			return parseFloat(a.salePrice) - parseFloat(b.salePrice);
		});
	}

	get deals() {
		return this._deals;
	}

	/**
	 * Adds Metacritic info to the game's info object
	 * @param {number} score Metacritic score
	 * @param {string} link Path for the game on Metacritic, e.g. /game/pc/title
	 */
	setMetacriticInfo(score, link) {
		if (typeof score !== 'number') {
			throw Error('Invalid type: Metacritic score must be a number');
		}

		this.info.metacriticScore = score;
		this.info.metacriticLink = link;
	}
}
