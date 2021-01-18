import type {Message, Device, DeviceConstructor} from "@rocketry/core";
import bindDeep from "bind-deep";
import {inRange} from "lodash";
import LaunchpadMk2 from "..";
import type {StandardColor, Color} from "./color";


// Text Scrolling across the pad
export const marquee: Marquee<DependentDevice> = function (text, color = "white", loop = false) {
	const loopByte = +!!loop;
	const normalizedColor = this.constructor.color.normalize(color);
	const normalizedText: Message = text ? this.marquee.normalize(text) : [0];

	if (Array.isArray(normalizedColor)) {
		// RGB color
		throw new TypeError("Marquee can't be used with an RGB color via MIDI.");
	}
	// Basic color
	this.send.sysex([...this.constructor.sysex.prefix, 20, normalizedColor, loopByte, ...normalizedText]);

	// Return promise to detect loop or stop (stopMarquee or finished)
	// This will only resolve once but looping may cause the event to fire after a single "marquee" event
	// 0 => never timeout - since the text may be long
	return this.promiseOnce("marquee", 0);
};
// Stop the marquee
marquee.reset = marquee.stop = function () {
	return this.marquee();
};
marquee.normalize = function (text: string | Message): Message {
	const result = [];
	if (Array.isArray(text)) {
		for (const object of text) {
			if (typeof object === "string") {
				// Recursive with each string
				result.push(...this.marquee.normalize(object));
			} else if (typeof object === "number") {
				if (!inRange(object, 1, 8)) {
					throw new RangeError("Text speed isn't in the valid range.");
				}
				// Add plain speed byte, recursive with each string in object
				result.push(object);
			} else {
				throw new TypeError("Text wasn't a number (for speed changes) or a string.");
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

declare interface DependentDevice {
	constructor: DeviceConstructor<DependentDevice> & {
		color: Color;
	};
}
declare abstract class DependentDevice extends Device<DependentDevice> {
	static color: Color;
	marquee: Marquee<void>;
}

export interface Marquee<T extends DependentDevice | void> {
	(this: T, text?: string | Message, color?: string | StandardColor, loop?: boolean): Promise<Message>;
	stop (this: T): Promise<Message>;
	reset (this: T): Promise<Message>;
	normalize (this: T, text: string | Message): Message;
}


export const registerMarqueeEvents = function (): void {
	// When marquee stops or loops
	LaunchpadMk2.registerEvent(
		"marquee",
		{
			pattern: {
				status: {
					matchBytes: [240],
				},
				manufacturerId: {
					matchBytes: LaunchpadMk2.sysex.manufacturer,
				},
				modelId: {
					matchBytes: LaunchpadMk2.sysex.model,
				},
				methodResponse: {
					matchBytes: [21],
				},
				footer: {
					matchBytes: [247],
				},
			},
		},
	);
};

export const makeMarquee = function <T extends DependentDevice> (device: T): Marquee<void> {
	return bindDeep(marquee as Marquee<T>, device);
};
