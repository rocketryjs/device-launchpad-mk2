import {inRange} from "lodash";
import LaunchpadMk2 from "..";
import type {Message, Device, Send, DeviceAPIClass} from "@rocketry/core";
import type {StandardColorType, Color} from "./color";


// Text Scrolling across the pad
export const marquee: Marquee<DependentDevice> = function (text, color = "white", loop = 0) {
	const normalizedColor = this.constructor.color.normalize(color);
	if (text) {
		text = this.marquee.normalize(text);
	} else {
		text = [0];
	}
	loop = +loop; // true, 1 => 1; false, 0, "" => 0

	if (Array.isArray(normalizedColor)) {
		// RGB
		throw new TypeError("Marquee can't be used with an RGB color via MIDI.");
	}
	// Basic
	this.send.sysex([...this.constructor.sysex.prefix, 20, normalizedColor, loop, ...text]);

	// Return promise to detect loop or stop (stopMarquee or finished)
	// This will only resolve once but looping may cause the event to fire after a single "marquee" event
	// 0 => never timeout - since the text may be long
	return this.promiseOnce("marquee", 0);
};
// Stop the marquee
marquee.stop = function() {
	return this.marquee();
};
marquee.reset = marquee.stop;
marquee.normalize = function(text: string | Message): Message {
	let result = [];
	if (Array.isArray(text)) {
		for (const object of text) {
			if (typeof object === "string") {
				// Recursive with each string
				result.push(this.marquee.normalize(object));
			} else if (typeof object === "number") {
				if (!inRange(object, 1, 8)) {
					throw new RangeError("Text speed isn't in the valid range.");
				}
				// Add plain speed byte, recursive with each string in object
				result.push(object);
			} else {
				throw new TypeError(`Text: ${object}, wasn't a number (for speed changes) or a string.`);
			}
		}
	} else {
		// Get character codes, not all ASCII works; not all non-standard ASCII fails so there's not currently a validation process
		for (let i = 0; i < text.length; i++) {
			result.push(text.charCodeAt(i));
		}
	}

	return result;
};


interface DependentDevice extends Device {
	marquee: Marquee<void>;
	send: Send<DependentDevice, void>;
	constructor: typeof Device & DeviceAPIClass & {
		color: Color;
	};
}

export interface Marquee<T extends DependentDevice | void> {
	(this: T, text?: string | Message, color?: string | StandardColorType, loop?: boolean | number): Promise<any>;
	stop (this: T): Promise<any>;
	reset (this: T): Promise<any>;
	normalize (this: T, text: string | Message): Message;
}


export const registerMarqueeEvents = function () {
	// Events
	// Shared bytes
	const sysExStatus = {
		matches: [240],
		mutate(message: any) {
			message.status = message.status[0];
		},
	};
	const sysExFooter = {
		matches: [247],
		mutate(message: any) {
			message.footer = message.footer[0];
		},
	};
	const manufacturerId = {
		matches: LaunchpadMk2.sysex.manufacturer,
	};
	const modelId = {
		matches: LaunchpadMk2.sysex.model,
	};

	// When marquee stops or loops
	LaunchpadMk2.registerEvent(
		"marquee",
		{
			status: sysExStatus,
			manufacturerId: manufacturerId,
			modelId: modelId,
			methodResponse: {
				matches: [21],
			},
			footer: sysExFooter,
		},
	);
};
