'use strict';

import * as Cheapshark from './cheapshark';
import * as Cache from './cache';
import Game from './game';
import BundleGameView from './bundle-game-view';
import StoreManager from './store-manager';
import * as Constants from './constants';

const TYPE_GAME = 'game';

function main() {
	cleanCache();
	GM_addStyle(GM_getResourceText('style'));

	let stores = new StoreManager();
	stores.init(initGameInfo);
}

/**
 * Sets up everything related to games on the page - finding them, getting info and displaying the info.
 * @param {StoreManager} storeManager StoreManager to use when populating each game's pricing details
 */
function initGameInfo(storeManager) {
	let games = findBundleGames();
	let expiry = Date.now() + (Constants.DAYS * 14);

	games.forEach((g) => {
		let gameInfo = Cache.getValue(TYPE_GAME, g.model.id);
		if (gameInfo !== undefined) {
			if (gameInfo !== null) {
				g.model.setInfo(gameInfo);
				g.displayInfo(storeManager);
			}
		} else {
			// Get the game info from Cheapshark
			Cheapshark.games({title: g.model.title, limit: 10}, (err, gamesData) => {
				if (!err) {
					if (gamesData.length > 0) {
						let l = g.model.title.length;
						gamesData.sort((a, b) => {
							let ret = Math.abs(l - a.external.length) - Math.abs(l - b.external.length);
							return ret;
						});

						g.model.setInfo(gamesData[0]);

						// Get the game's Metacritic info from the deals endpoint
						Cheapshark.deals({title: g.model.info.external, exact: 1}, (err, dealsData) => {
							if (!err && dealsData.length > 0) {
								// Store the deals now so they're not fetched again later
								g.model.deals = dealsData;

								for (let i = 0; i < dealsData.length; i++) {
									let deal = dealsData[i];

									if (deal.metacriticLink && deal.metacriticScore) {
										g.model.setMetacriticInfo(parseInt(deal.metacriticScore), deal.metacriticLink);
										break;
									}
								}

								Cache.setValue(TYPE_GAME, g.model.id, g.model.info, expiry);
							} else {
								// Still set the deals object so we don't try and fetch it again
								g.model.deals = [];
							}

							g.displayInfo(storeManager);
						});
					} else {
						// Store null for the game info so we don't try and fetch it again
						Cache.setValue(TYPE_GAME, g.model.id, null, expiry);
					}
				}
			});
		}
	});
}

function cleanCache() {
	let now = Date.now();

	// Clear expired items from the cache once per day (at most)
	if (now - Cache.getLastCleared() >= Constants.DAYS) {
		Cache.clearExpired();
	}
}

/**
 * Finds games on the page/in the bundle.
 * @return {array} Array of BundleGameViews
 */
function findBundleGames() {
	let gameEls = [...(document.querySelectorAll('.promo-body .game-border:not(.charity) .game-boxes > li'))];

	let gameList = gameEls.map((gameEl) => {
		let titleEl = gameEl.querySelector('.game-description h2');

		if (titleEl !== null) {
			let title = titleEl.textContent;

			let game = new Game(title);
			return new BundleGameView(gameEl, game);
		} else {
			return null;
		}
	}).filter(game => {
		return (game !== null);
	});

	return gameList;
}

main();
