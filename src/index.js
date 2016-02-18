'use strict';

import * as Cheapshark from './cheapshark';
import * as Cache from './cache';
import Game from './game';

// ==UserScript==
// @name          Humble Enhancher
// @namespace     http://www.nwatson.nz/gmscripts
// @description   Enhances Humble Bundle pages with additional info
// @include       https://www.humblebundle.com/*
// @exclude       https://www.humblebundle.com/books
// @exclude       https://www.humblebundle.com/monthly
// @exclude       https://www.humblebundle.com/store/*
// @version       0.1.0
// @grant         GM_xmlhttpRequest
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_listValues
// @grant         GM_deleteValue
// @grant         GM_getResourceText
// @grant         GM_addStyle
// @resource style style.css
// ==/UserScript==

const TYPE_GAME = 'game';

function main() {
	GM_addStyle(GM_getResourceText('style'));

	let now = Date.now();

	// Clear expired items from the cache once per day (at most)
	if (now - Cache.getLastCleared() >= 24*60*60) {
		Cache.clearExpired();
	}

	let games = findBundleGames();
	let expiry = now + (14*24*60*60); // now + 2 weeks


	games.forEach((g) => {
		let gameInfo = Cache.getValue(TYPE_GAME, g.id);
		if (gameInfo !== undefined) {
			if (gameInfo !== null) {
				g.setInfo(gameInfo);
				g.displayInfo();
			}
		} else {
			// Get the game info from Cheapshark
			Cheapshark.games({title: g.title, limit: 10}, (err, gamesData) => {
				if (!err) {
					if (gamesData.length > 0) {
						let l = g.title.length;
						gamesData.sort((a, b) => {
							let ret = Math.abs(l - a.external.length) - Math.abs(l - b.external.length);
							return ret;
						});

						g.setInfo(gamesData[0]);

						// Get the game's Metacritic info from the deals endpoint
						Cheapshark.deals({title: g.info.external, exact: 1}, (err, dealsData) => {
							if (!err && dealsData.length > 0) {
								// Store the deals now so they're not fetched again later
								g.deals = dealsData;

								for (let i = 0; i < dealsData.length; i++) {
									let deal = dealsData[i];

									if (deal.metacriticLink && deal.metacriticScore) {
										g.setMetacriticInfo(parseInt(deal.metacriticScore), deal.metacriticLink);
										break;
									}
								}

								Cache.setValue(TYPE_GAME, g.id, g.info, expiry);
							} else {
								// Still set the deals object so we don't try and fetch it again
								g.deals = [];
							}

							g.displayInfo(g);
						});
					} else {
						// Store null for the game info so we don't try and fetch it again
						Cache.setValue(TYPE_GAME, g.id, null, expiry);
					}
				}
			});
		}
	});
}

/**
 * Finds games on the page/in the bundle.
 * @return {array} Array of games on the page. Each game has a title, id and DOM element
 */
function findBundleGames() {
	let gameEls = [...(document.querySelectorAll('.promo-body .game-border:not(.charity) .game-boxes > li'))];

	let gameList = gameEls.map((gameEl) => {
		let titleEl = gameEl.querySelector('.game-description h2');

		if (titleEl !== null) {
			let title = titleEl.textContent;

			return new Game(title, gameEl);
		} else {
			return null;
		}
	}).filter(game => {
		return (game !== null);
	});

	return gameList;
}

main();
