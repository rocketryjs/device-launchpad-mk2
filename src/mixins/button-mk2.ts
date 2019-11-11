/*
	Module: Launchpad buttons mixin
	Description: Methods, properties, and events for Launchpad buttons
*/

import _ from "lodash";
import color from "./button/rgb-color";
import Button from "@rocketry/core/lib/button"; // TODO export button
import button from "./button"; // TODO move to common


// LaunchpadMk2Button class definition
@color
class LaunchpadMk2Button extends Button {
	constructor() {
		super(...arguments);
	}
}


/*
	Export mixin
*/
export default function (target) {
	// Extend Launchpad common button mixin
	button(target);

	target.inits.add(function () {
		/*
			Generation of button with values
		*/
		this.buttons = [];
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
				this.buttons.push(
					new LaunchpadMk2Button(
						this,
						{
							"status": "note on",
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
			this.buttons.push(
				new LaunchpadMk2Button(
					this,
					{
						"name": rightNames[y],
						"group": "right",
						"status": "note on",
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
			this.buttons.push(
				new LaunchpadMk2Button(
					this,
					{
						"name": topNames[x],
						"group": "top",
						"status": "control change",
						"column": x,
						"row": 8,
						"note": 104 + x,
					},
				)
			);
		}
	});
};
