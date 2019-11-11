/*
	Module: Launchpad buttons mixin
	Description: Methods, properties, and events for Launchpad buttons

	TODO: genericize for all launchpads
	TODO: expose Button, ButtonArray, and LaunchpadMk2Button either on the device subclass or in a core module
*/

import _ from "lodash";


/*
	Export mixin
*/
export default function (target) {
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
					[this.layout.current]: message.note,
				},
			});
		},
	};

	// When pressing a button
	target.events.set(
		"press",
		{
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
				},
			},
		},
	);

	// When releasing a button
	target.events.set(
		"release",
		{
			"status": noCcStatus,
			note,
			"pressure": {
				"matches": [0],
				mutate(message) {
					message.pressed = false;
					message.pressure = 0;
				},
			},
		},
	);
};
