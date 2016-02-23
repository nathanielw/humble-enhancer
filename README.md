# Humble Enhancer

UserScript (GreaseMonkey, TamperMonkey, etc.) for adding useful information about games to [Humble Bundle](http://humblebundle.com/) pages.

Data displayed by the script comes from the [CheapShark](http://www.cheapshark.com/) API.

## Installing
1. Install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome.

2. Visit the script's page on either [OpenUserJS](https://openuserjs.org/scripts/nathanielw/Humble_Enhancer) or [Greasy Fork](https://greasyfork.org/en/scripts/17343-humble-enhancer) and press the *Install* button.

The script may work with other browsers and/or userscript systems, but it has only been tested in the latest versions of Firefox and Chrome.

## Building
`npm install` to install all dependencies.

`gulp watch` to watch for changes and build js and css automatically to `/dist-dev/`.

`gulp build:dist` to build js and css to `/dist/`, ready for distribution.

`gulp test` to run unit tests (found in the `/spec/` folder) using Jasmine.

## License
```
Humble Enhancer
	 Copyright (C) Nathaniel Watson

	 This program is free software: you can redistribute it and/or modify
	 it under the terms of the GNU General Public License as published by
	 the Free Software Foundation, either version 3 of the License, or
	 (at your option) any later version.

	 This program is distributed in the hope that it will be useful,
	 but WITHOUT ANY WARRANTY; without even the implied warranty of
	 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	 GNU General Public License for more details.

	 You should have received a copy of the GNU General Public License
	 along with this program. If not, see <http://www.gnu.org/licenses/>.
 ```
