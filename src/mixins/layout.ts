/*
	Module: Launchpad layout mixin
	Description: Methods for layouts
*/

import * as _ from "lodash";
import bindDeep from "bind-deep";


const layout = {};
// Change layouts
layout.change = function(layout) {
	// Normalize
	layout = this.layout.normalize(layout);

	// Save
	this.layout.current = layout;

	// Send
	return this.send.sysex([this.constructor.sysex.prefix, 34, layout]);
};
layout.set = layout.change;
layout.reset = function() {
	return this.layout.change(0);
};
// Validate and normalize layouts
layout.normalize = function(layout) {
	if (typeof layout !== "number") {
		for (let i = 0; i < this.layouts.length; i++) {
			if (this.layouts[i].regex.test(layout)) {
				layout = i;
				break;
			}
		}
	}

	// Return layout if a number in range
	if (_.inRange(layout, 0, this.layouts.length)) {
		return layout;
	} else {
		throw new RangeError(`Layout ${layout} isn't a valid layout for this device.`);
	}
};


/*
	Export mixin
*/
export default function (target) {
	target.inits.add(function () {
		Object.defineProperty(this, "layout", {
			"value": bindDeep(this, layout),
		});
	});
};
