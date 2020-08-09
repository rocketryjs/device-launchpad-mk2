import {light, dark, flash, pulse} from "./light";
import {Button, Device} from "@rocketry/core";
import LaunchpadMk2 from "../..";
import bindDeep from "bind-deep";

// LaunchpadMk2Button class definition
export class LaunchpadMk2Button extends Button {
	constructor (device: LaunchpadMk2, assignProps?: unknown, defineProps?: PropertyDescriptorMap) {
		super(device);

		// Assign coords, name, other properties to query by
		assignProps && Object.assign(this, assignProps);
		// Dynamic and other properties that must be defined
		defineProps && Object.defineProperties(this, defineProps);
	}
	light = bindDeep(light, this);
	dark = bindDeep(dark, this);
	flash = bindDeep(flash, this);
	pulse = bindDeep(pulse, this);
}

/*
	Generation of button with values
*/
export const createButtons = function (device: LaunchpadMk2) {
	const buttons: Array<LaunchpadMk2Button> = [];
	const range = [...Array(8).keys()];

	// Grid and Right
	const rightNames = ["record arm", "solo", "mute", "stop", "send b", "send a", "pan", "volume"];
	for (const y of range) {
		for (const x of range) {
			// Quadrant
			let quadrant = 0;
			if (x > 3) {
				quadrant += 1;
			}
			if (y > 3) {
				quadrant += 2;
			}

			// Push to buttons
			buttons.push(
				new LaunchpadMk2Button(
					device,
					{
						"status": "noteOn",
						"group": "grid",
						"column": x,
						"row": y,
						quadrant,
					},
					{
						"note": {
							get() {
								if (this.device.layout.current === "1") {
									// Note for layouts[1]
									return 36 + (4 * y) + x + (x <= 3 ? 0 : 28);
								} else {
									// Default
									return (10 * y) + x + 11;
								}
							},
						},
					},
				)
			);
		}

		// Right
		buttons.push(
			new LaunchpadMk2Button(
				device,
				{
					"name": rightNames[y],
					"group": "right",
					"status": "noteOn",
					"column": 8,
					"row": y,
				},
				{
					"note": {
						get() {
							if (this.device.layout.current === "1") {
								// Note for layouts[1]
								return 100 + y;
							} else {
								// Default
								return (10 * y) + 19;
							}
						},
					},
				},
			)
		);
	}

	// Top
	const topNames = ["up", "down", "left", "right", "session", "user 1", "user 2", "mixer"];
	for (const x of range) {
		buttons.push(
			new LaunchpadMk2Button(
				device,
				{
					"name": topNames[x],
					"group": "top",
					"status": "controlChange",
					"column": x,
					"row": 8,
					"note": 104 + x,
				},
			)
		);
	}

	return buttons;
};

export * from "./events";
export * from "./light";
