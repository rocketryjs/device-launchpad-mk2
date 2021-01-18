import {Captures, Message, Meta, Status, SubEmitter} from "@rocketry/core";
import LaunchpadMk2 from "../..";
import {ButtonList} from "./button-list";
import {Light, makeLight, makeDark, makeFlash, makePulse, Flash, Pulse} from "./light";


export interface LaunchpadMk2ButtonProps {
	name?: string;
	group: string;
	status: Status;
	column: number;
	row: number;
	note: number;
	quadrant?: number;
}

export class Button extends SubEmitter<LaunchpadMk2> implements LaunchpadMk2ButtonProps {
	name?: string;
	group: string;
	status: Status;
	column: number;
	row: number;
	note: number;
	quadrant?: number;
	light: Light<void, this> = makeLight(this);
	dark: Light<void, this>["reset"] = makeDark(this);
	flash: Flash<void, this> = makeFlash(this);
	pulse: Pulse<void, this> = makePulse(this);

	constructor (device: LaunchpadMk2, properties: LaunchpadMk2ButtonProps) {
		super(device);
		this.note = properties.note;
		this.name = properties.name;
		this.group = properties.group;
		this.status = properties.status;
		this.column = properties.column;
		this.row = properties.row;
		this.quadrant = properties.quadrant;
	}

	// Determine if the emitter should emit
	willEmit (event: string, message: Message, captures: Captures, meta: Meta): boolean {
		if (event === "press" || event === "release") {
			return this === meta.target;
		}
		return false;
	}
}

/*
	Generation of button with values
*/
export const makeButtons = function (device: LaunchpadMk2): ButtonList {
	const buttons: Array<Button> = [];
	const range = [...new Array(8).keys()];

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
				new Button(
					device,
					{
						status: "noteOn",
						group: "grid",
						column: x,
						row: y,
						quadrant,
						note: (10 * y) + x + 11,
					},
				)
			);
		}

		// Right
		buttons.push(
			new Button(
				device,
				{
					name: rightNames[y],
					group: "right",
					status: "noteOn",
					column: 8,
					row: y,
					note: (10 * y) + 19,
				},
			)
		);
	}

	// Top
	const topNames = ["up", "down", "left", "right", "session", "user 1", "user 2", "mixer"];
	for (const x of range) {
		buttons.push(
			new Button(
				device,
				{
					name: topNames[x],
					group: "top",
					status: "controlChange",
					column: x,
					row: 8,
					note: 104 + x,
				},
			)
		);
	}

	return new ButtonList(device, ...buttons);
};

export * from "./events";
export * from "./light";
export * from "./button-list";
