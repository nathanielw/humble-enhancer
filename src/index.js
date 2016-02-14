'use strict';

import * as Cheapshark from './cheapshark';
import * as Cache from './cache';

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
// ==/UserScript==

const TYPE_GAME = 'game';

/**
 * Finds games on the page/in the bundle.
 * @return {array} Array of games on the page. Each game has a title, id and DOM element
 */
function findBundleGames() {
	const TITLE_REGEX = /[^a-zA-Z0-9\s]/g;

	let gameEls = [...(document.querySelectorAll('.promo-body .game-border:not(.charity) .game-boxes > li'))];

	let gameList = gameEls.map((gameEl) => {
		let titleEl = gameEl.querySelector('.game-description h2');

		if (titleEl !== null) {
			let title = titleEl.textContent;

			return {
				title: title,
				id: title.replace(TITLE_REGEX, ''),
				element: gameEl
			};
		} else {
			return null;
		}
	}).filter(game => {
		return (game !== null);
	});

	return gameList;
}

function main() {
	let now = Date.now();

	// Clear expired items from the cache once per day (at most)
	if (now - Cache.getLastCleared() >= 24*60*60) {
		Cache.clearExpired();
	}

	// GM_listValues().forEach((key) => {
	// 	GM_deleteValue(key);
	// });

	let games = findBundleGames();
	let expiry = now + (14*24*60*60); // now + 2 weeks

	games.forEach((g) => {
		let gameInfo = Cache.getValue(TYPE_GAME, g.id);

		if (gameInfo) {
			g.info = gameInfo;
			// TODO: displayInfo
		} else {

			// Get the game info from Cheapshark
			Cheapshark.games({title: g.title, limit: 1}, (err, gamesData) => {
				if (!err && gamesData.length > 0) {
					g.info = gamesData[0];

					// Get the game's Metacritic info from the deals endpoint
					Cheapshark.deals({title: g.info.external, exact: 1}, (err, dealsData) => {
						if (!err && dealsData.length > 0) {
							g.deals = dealsData;

							for (let i = 0; i < dealsData.length; i++) {
								let deal = dealsData[i];

								if (deal.metacriticLink && deal.metacriticScore) {
									g.info.metacriticLink = deal.metacriticLink;
									g.info.metacriticScore = deal.metacriticScore;
									break;
								}
							}

							Cache.setValue(TYPE_GAME, g.id, gameInfo, expiry);
						} else {
							// Still set the deals object so we don't try and fetch it again
							g.deals = [];
						}
					});

					// TODO: displayInfo
				} else {
					// TODO: handle game not found. Is anything actually needed? Push empty value to cache?
				}
			});
		}
	});
}

function displayInfo(game) {


	// TODO: onclick handler {
	//	if (!g.deals) {
	//		// TODO: Fetch the deals
	//	}
	// }
}

main();


/*
Find games on page
for each bundle game: (first run)
	call CheapShark API (/games?title=X)
	Store: lowest price, SteamID, gameID, external (title)
	call CheapShark API (/deals?title=X&exact=1)
	Store: metacriticScore, metacriticLink

for each bundle game: (all runs)
	get data from LS
	Display: Metacritic, lowest price
	Maybe call /games?ids=1,2,3,4... to get updated lowest price

	When clicked:
		call CheapShark API (/deals?title=X&exact=1)
		Display: List of prices


Maybe hardcode store list? Or download on first run and store.
 */
