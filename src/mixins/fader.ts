/*
	Module: Launchpad fader mixin
	Description: Methods for faders
*/

import _ from "lodash";
import bindDeep from "bind-deep";


const fader = {};
fader.initialize = function(number, color = "white", type = "volume", value = 0) {
	// Validate fader column
	if (!_.inRange(number, 0, 8)) {
		throw new RangeError("Fader number is not in range.");
	}
	// Normalize color
	color = this.constructor.color.normalize(color);
	if (color.type === "rgb") {
		// RGB
		throw new TypeError("Faders can't be used with an RGB color via MIDI.");
	} else if (color.type === "standard") {
		// Basic
		color = color.value;
	}
	// Match strings with the cooresponding layout
	if (this.constructor.layouts[4].test(type)) {
		type = 0;
	} else if (this.constructor.layouts[5].test(type)) {
		type = 1;
	}
	// Validate type
	if (!_.inRange(type, 0, 2)) {
		throw new RangeError("Fader type is not in range.");
	}
	// Validate initial value
	if (!_.inRange(value, 0, 127)) {
		throw new RangeError("Fader inital value is not in range.");
	}

	this.send.sysex([this.constructor.sysex.prefix, 43, number, type, color, value]);
};


// Events
// Shared functions
const isControlChange = function(value) {
	return _.inRange(value, 176, 192);
};


/*
	Export mixin
*/
export default function (target) {
	target.inits.add(function () {
		Object.defineProperty(this, "fader", {
			"value": bindDeep(fader, this),
		});
	});

	// Events
	target.events.set(
		"fader",
		{
			"status": {
				"min": 1,
				"max": 1,
				validate(value) {
					return isControlChange(value);
				},
				mutate(message) {
					message.status = "control change";
				}
			},
			"fader": {
				"min": 1,
				"max": 1,
				validate(value) {
					return _.inRange(value, 21, 29);
				},
				mutate(message) {
					message.fader = message.fader[0] - 21;
				}
			},
			"value": {
				"min": 1,
				"max": 1,
				mutate(message) {
					message.value = message.value[0];
				}
			},
		}
	);
};
