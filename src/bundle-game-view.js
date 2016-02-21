'use strict';

import Quantizer from './quantizer';
import * as Cheapshark from './cheapshark';
import htmlEscape from './util/html-escape';

const DEAL_BASE = 'http://www.cheapshark.com/redirect.php?dealID=';
const scoreQuantizer = new Quantizer(40, 99, ['lowest', 'low', 'medium', 'high', 'highest']);

/**
 * Represents the display of a game on a Bundle page
 */
export default class BundleGameView {
	/**
	 * Creates a new view for the given element and model
	 * @param {HTMLElement} element Element on the Bundle page that contains the game's image, title, etc. and will be
	 *                              used to display/output any additional information.
	 * @param {Game} model Model holding data about the game
	 */
	constructor(element, model) {
		this.element = element;
		this.model = model;
	}

	/**
	 * Adds the game's details to its element.
	 * @param {StoreManager} storeManager StoreManager to use to get store details when displaying the game's prices.
	 */
	displayInfo(storeManager) {
		let outer = this.element.querySelector('.table-wrapper');

		if (outer) {
			let buttonContainer = document.createElement('div');
			buttonContainer.className = 'he-button-container';
			buttonContainer.innerHTML = `
				<div class='he-button-container__group he-button-container__group--left'>
					${(this.model.info.metacriticScore && this.model.info.metacriticLink) ?
						`<a class='he-info-button tooltip-top he-metacritic he-metacritic--${scoreQuantizer.quantize(this.model.info.metacriticScore)}'
							data-tooltip='Metacritic score for ${htmlEscape(this.model.info.external)}'
							href='http://www.metacritic.com${this.model.info.metacriticLink}'>
						${this.model.info.metacriticScore}
						</a>`
						: ''
					}
				</div>
				<div class='he-button-container__group he-button-container__group--right'>
					${(this.model.info.steamAppID) ?
						`<a class='he-info-button' href='http://store.steampowered.com/app/${this.model.info.steamAppID}'>
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

			if (this.model.deals) {
				this._createTooltip(priceTooltip, storeManager);
			} else {
				let hoverHandler = () => {
					priceButton.removeEventListener('mouseover', hoverHandler);
					priceTooltip.innerHTML = '<div class="he-tooltip__inner">Loading deals...</div>';
					Cheapshark.deals({title: this.model.info.external, exact: 1}, (err, dealsData) => {
						if (!err && dealsData.length > 0) {
							this.model.deals = dealsData;
							this._createTooltip(priceTooltip, storeManager);
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

	/**
	 * Creates and sets up the tooltip for displaying pricing info
	 * @param {HTMLElement} tooltipEl Element within which the tooltip's content should be placed.
	 * @param {StoreManager} storeManager StoreManager to use to get store details when displaying the game's prices.
	 * @private
	 */
	_createTooltip(tooltipEl, storeManager) {
		let self = this;

		tooltipEl.innerHTML = `
			<div class='he-tooltip__inner'>
				<h3 class='he-tooltip__title'>External Prices</h3>
				<span class='he-tooltip__subtitle'>${this.model.info.external}</span>
			</div>
			<div class='he-price-list'>
				${
					function() {
						let list = '';

						for (let i = 0; i < self.model.deals.length; i++) {
							let deal = self.model.deals[i];
							let store = storeManager.getStore(parseInt(deal.storeID));

							if (store) {
								list += `
								<a class='he-price-list__item' href=${DEAL_BASE}${deal.dealID}>
									<span class='he-price-list__cell'>
										<img src='//cheapshark.com/${htmlEscape(store.images.icon)}' />
									</span>
									<span class='he-price-list__cell'>
										${htmlEscape(store.storeName)}
									</span>
									<span class='he-price-list__cell he-price-list__cell--right'>
										$${deal.salePrice}
									</span>
								</a>`;
							}
						}
						return list;
					}()
				}
			</div>
		`;
	}
}
