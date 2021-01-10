import {inRange} from "lodash";
import type {Device, Send} from "@rocketry/core";
import bindDeep from "bind-deep";

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
	let result: number = -1;
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
	current: undefined,
};

declare abstract class DependentDevice extends Device<DependentDevice> {
	layout: Layout<void, DependentDevice>;
	layouts: Array<{
		regex: RegExp,
		channel: number;
	}>
}

export interface Layout<T extends DependentDevice | void, R extends DependentDevice | void = T> {
	normalize (this: T, layout: LayoutType): number;
	change (this: T, layout: LayoutType): R;
	set (this: T, layout: LayoutType): R;
	reset (this: T): R;
	current?: number;
}

export const makeLayout = function <T extends DependentDevice> (device: T): Layout<void, T> {
	return bindDeep(layout as Layout<T>, device);
};
