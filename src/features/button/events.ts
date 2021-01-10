import {inRange} from "lodash";
import LaunchpadMk2 from "../..";


export const registerButtonEvents = function () {
	// Events
	// Shared functions
	const isNoteOn = function(value: number) {
		return inRange(value, 144, 160);
	};
	const isControlChange = function(value: number) {
		return inRange(value, 176, 192);
	};

	// Shared bytes
	const noCcStatus = {
		min: 1,
		max: 1,
		validate(value: any) {
			return isNoteOn(value) || isControlChange(value);
		},
		mutate(message: any) {
			if (isNoteOn(message.status)) {
				message.status = "noteOn";
			} else if (isControlChange(message.status)) {
				message.status = "controlChange";
			}
		}
	};
	const note = {
		min: 1,
		max: 1,
		validate(value: number) {
			return inRange(value, 0, 128);
		},
		mutate(this: LaunchpadMk2, message: any) {
			message.note = message.note[0];

			// Target
			message.target = this.query({
				status: message.status,
				note: {
					[this.layout.current ?? 0]: message.note,
				},
			});
		},
	};

	// When pressing a button
	LaunchpadMk2.registerEvent(
		"press",
		{
			status: noCcStatus,
			note,
			pressure: {
				min: 1,
				max: 1,
				validate(value) {
					return inRange(value, 1, 128);
				},
				mutate(message) {
					message.pressed = true;
					message.pressure = message.pressure[0];
				},
			},
		},
	);

	// When releasing a button
	LaunchpadMk2.registerEvent(
		"release",
		{
			status: noCcStatus,
			note,
			pressure: {
				matches: [0],
				mutate(message) {
					message.pressed = false;
					message.pressure = 0;
				},
			},
		},
	);
};
