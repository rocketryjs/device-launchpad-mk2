import {inRange} from "lodash";
import type {Device, Send} from "@rocketry/core";

// Change layouts
const change: Layout<DependentDevice>["change"] = function(layout: LayoutType) {
	// Normalize
	layout = this.layout.normalize(layout);

	// Save
	this.layout.current = layout;

	// Send
	return this.send.sysEx([...this.constructor.sysex.prefix, 34, layout]);
};
const set: Layout<DependentDevice>["set"] = change;
const reset: Layout<DependentDevice>["reset"] = function() {
	return this.layout.change(0);
};
// Validate and normalize layouts
const normalize: Layout<DependentDevice>["normalize"] = function(layout: LayoutType) {
	let result: number;
	if (typeof layout === "number") {
		result = layout
	} else {
		for (let index = 0; index < this.layouts.length; index++) {
			if (this.layouts[index].regex.test(layout)) {
				result = index;
				break;
			}
		}
	}

	// Return layout if a number in range
	if (!inRange(result, 0, this.layouts.length)) {
		throw new RangeError(`Layout ${layout} isn't a valid layout for this device.`);
	}
	return result;
};

export type LayoutType = number | string;

export const layout: Layout<DependentDevice> = {
	change,
	set,
	reset,
	normalize,
};

interface DependentDevice extends Device {
	layout: Layout<DependentDevice, void>;
	send: Send<DependentDevice, void>;
	layouts: Array<{
		regex: RegExp,
		channel: number;
	}>
}

export interface Layout<R extends DependentDevice, T extends DependentDevice | void = R> {
	normalize (this: T, layout: LayoutType): number;
	change (this: T, layout: LayoutType): R;
	set (this: T, layout: LayoutType): R;
	reset (this: T): R;
	current?: number;
}
