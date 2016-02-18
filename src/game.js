'use strict';

import Quantizer from './quantizer';
import escape from './util/html-escape';
import * as Cheapshark from './cheapshark';

const TITLE_REGEX = /[^a-zA-Z0-9\s]/g;
const scoreQuantizer = new Quantizer(40, 99, ['lowest', 'low', 'medium', 'high', 'highest']);
const DEAL_BASE = 'http://www.cheapshark.com/redirect.php?dealID=';

export default class Game {
	constructor(title, element) {
		this.title = title;
		this.element = element;
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

	/**
	 * Adds info to the page for the game
	 */
	displayInfo() {
		// TODO: separate from the model-y stuff? Probably not worthwhile unless the script is expanded to handle other
		// sections of the Humble site (e.g. the store)

		let outer = this.element.querySelector('.table-wrapper');

		if (outer) {
			let buttonContainer = document.createElement('div');
			buttonContainer.className = 'he-button-container';
			buttonContainer.innerHTML = `
				<div class='he-button-container__group he-button-container__group--left'>
					${(this.info.metacriticScore && this.info.metacriticLink) ?
						`<a class='he-info-button tooltip-top he-metacritic he-metacritic--${scoreQuantizer.quantize(this.info.metacriticScore)}'
							data-tooltip='Metacritic score for ${escape(this.info.external)}'
							href='http://www.metacritic.com${this.info.metacriticLink}'>
						${this.info.metacriticScore}
						</a>`
						: ''
					}
				</div>
				<div class='he-button-container__group he-button-container__group--right'>
					${(this.info.steamAppID) ?
						`<a class='he-info-button' href='http://store.steampowered.com/app/${this.info.steamAppID}'>
							<i class='fa fa-steam'></i>
						</a>` : ''
					}
					<span class='he-info-button he-info-button--price he-tooltipped'>
						<i class='fa fa-usd'></i>
						<div class='he-tooltip he-tooltip--medium'>
						</div>
					</span>
				</div>`;

			let priceButton = buttonContainer.querySelector('.he-info-button--price');
			let priceTooltip = priceButton.querySelector('.he-tooltip');

			if (this.deals) {
				this._createTooltip(priceTooltip);
			} else {
				let hoverHandler = () => {
					priceButton.removeEventListener('mouseover', hoverHandler);
					priceTooltip.innerHTML = '<div class="he-tooltip__inner">Loading deals...</div>';
					Cheapshark.deals({title: this.info.external, exact: 1}, (err, dealsData) => {
						if (!err && dealsData.length > 0) {
							this.deals = dealsData;
							this._createTooltip(priceTooltip);
						} else {
							priceTooltip.innerHTML = '<div class="he-tooltip__inner">No deals found</div>';
						}
					});
				};

				priceButton.addEventListener('mouseover', hoverHandler);
			}

			outer.insertBefore(buttonContainer, outer.firstChild);
		}
	}

	_createTooltip(tooltipEl) {
		let self = this;

		tooltipEl.innerHTML = `
			<div class='he-tooltip__inner'>
				<h3 class='he-tooltip__title'>External Prices</h3>
				<span class='he-tooltip__subtitle'>${this.info.external}</span>
			</div>
			<div class='he-price-list'>
				${
					function() {
						let list = '';
						for (let i = 0; i < self.deals.length; i++) {
							let deal = self.deals[i];
							list += `
							<a class='he-price-list__item' href=${DEAL_BASE}${deal.dealID}>
								<span class='he-price-list__cell'>
									<img src='//cheapshark.com/img/stores/icons/${parseInt(deal.storeID) - 1}.png' />
								</span>
								<span class='he-price-list__cell he-price-list__cell--right'>
									$${deal.salePrice}
								</span>
							</a>`;
						}
						return list;
					}()
				}
			</div>
		`;
	}
}
