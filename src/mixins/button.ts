/*
	Module: Launchpad buttons mixin
	Description: Methods, properties, and events for Launchpad buttons
*/


import _ from "lodash";
import color from "./mixins/button/rgb-color";
// const Button = require("../button");
// const ButtonArray = require("../button-array");
// const mixin = require("../../mixin");
// const {methods, properties, events} = mixin;


module.exports = function(mixins) {
	// Button class definition
	@color
	class LaunchpadMk2Button extends Button {
		constructor() {
			super(...arguments);
		}
		static is(object) {
			return object instanceof this;
		}
	}

	// Methods
	methods(
		// Object to mix into
		this,

		// Instance - none
		false,

		// Static
		{
			// The Button class to use for this device
			"Button": ButtonExtended,
			// Expose the ButtonArray constructor
			ButtonArray
		}
	);


	// Properties
	properties(
		// Object to mix into
		this,

		// Instance
		{
			// Smart getters
			// Object.defineProperty defines a prop for this so it doesn't override
			// this.prototype.buttons but won't be called again by this device. (~magic~)
			"buttons": {
				// Get buttons
				get() {
					// Generate all buttons from values
					const buttons = [];
					for (const value of this.constructor.values) {
						buttons.push(new this.constructor.Button(this, value));
					}

					return Object.defineProperty(this, "buttons", {
						"value": buttons
					}).buttons;
				},
			}
		}
	);


	// Events
	// Shared functions
	const isNoteOn = function(value) {
		return _.inRange(value, 144, 160);
	};
	const isControlChange = function(value) {
		return _.inRange(value, 176, 192);
	};

	// Shared bytes
	const noCcStatus = {
		"min": 1,
		"max": 1,
		validate(value) {
			return isNoteOn(value) || isControlChange(value);
		},
		mutate(message) {
			if (isNoteOn(message.status)) {
				message.status = "note on";
			} else if (isControlChange(message.status)) {
				message.status = "control change";
			}
		}
	};
	const note = {
		"min": 1,
		"max": 1,
		validate(value) {
			return _.inRange(value, 0, 128);
		},
		mutate(message) {
			message.note = message.note[0];

			// Target
			message.target = this.query({
				"status": message.status,
				"note": {
					[this.layout.current]: message.note
				}
			});
		}
	};

	events(this, {
		// When pressing a button
		"press": {
			"status": noCcStatus,
			note,
			"pressure": {
				"min": 1,
				"max": 1,
				validate(value) {
					return _.inRange(value, 1, 128);
				},
				mutate(message) {
					message.pressed = true;
					message.pressure = message.pressure[0];
				}
			}
		},
		// When releasing a button
		"release": {
			"status": noCcStatus,
			note,
			"pressure": {
				"matches": [0],
				mutate(message) {
					message.pressed = false;
					message.pressure = 0;
				}
			}
		}
	});
};
