import {Device, DeviceConstructor, Status, SubEmitter} from "@rocketry/core";
import bindDeep from "bind-deep";
import type {RGB, RGBArray} from "loose-rgb/lib/helpers";
import type {Color, StandardColor} from "../color";


// Lighting
export const light: Light<DependentButton> = function (color) {
	// Normalize
	const normalizedColor = this.device.constructor.color.normalize(color);

	// Send
	if (Array.isArray(normalizedColor)) {
		// RGB color
		this.device.send.sysex([...this.device.constructor.sysex.prefix, 11, this.note, ...normalizedColor]);
	} else {
		// Standard color
		this.device.send[this.status]([this.note, normalizedColor]);
	}

	// Save
	this.light.current = normalizedColor;

	return this;
};

export const dark = light.reset = function () {
	return this.light("off");
};


// Flashing
export const flash: Flash<DependentButton> = function (color) {
	// Normalize
	const normalizedColor = this.device.constructor.color.normalize(color);

	// Send
	if (Array.isArray(normalizedColor)) {
		// RGB color
		throw new TypeError("Flashing can't be used with an RGB color via MIDI.");
	}
	// Standard color
	this.device.send[this.status]([this.note, normalizedColor], 2);

	// Save
	this.flash.current = normalizedColor;

	return this;
};
flash.reset = function () {
	// Re-light or pulse color
	if (this.pulse.current) {
		this.pulse(this.pulse.current);
	} else if (this.light.current) {
		this.light(this.light.current);
	} else {
		// Stop flashing
		this.dark();
	}

	return this;
};


// Pulsing
export const pulse: Pulse<DependentButton> = function (color) {
	// Normalize
	const normalizedColor = this.device.constructor.color.normalize(color);

	// Send
	if (Array.isArray(normalizedColor)) {
		// RGB color
		throw new TypeError("Pulsing can't be used with an RGB color.");
	}
	// Standard color
	this.device.send[this.status]([this.note, normalizedColor], 3);

	// Save
	this.pulse.current = normalizedColor;

	return this;
};
pulse.reset = function () {
	return this.pulse("off");
};

declare interface DependentDevice {
	constructor: DeviceConstructor<DependentDevice> & {
		color: Color;
	};
}
declare abstract class DependentDevice extends Device<DependentDevice> {}

declare abstract class DependentButton extends SubEmitter<DependentDevice> {
	status: Status;
	note: number;
	light: Light<void, DependentButton>;
	dark: Light<void, DependentButton>["reset"];
	flash: Flash<void, DependentButton>;
	pulse: Pulse<void, DependentButton>;
}

export interface Light<T extends DependentButton | void, R extends DependentButton | void = T> {
	current?: StandardColor | RGBArray;
	(this: T, color: string | StandardColor | RGB): R;
	reset (this: T): R;
}

export type Dark <T extends DependentButton | void, R extends DependentButton | void = T> = Light<T, R>["reset"]

export interface Flash<T extends DependentButton | void, R extends DependentButton | void = T> {
	current?: StandardColor;
	(this: T, color: string | StandardColor): R;
	reset (this: T): R;
}

export interface Pulse<T extends DependentButton | void, R extends DependentButton | void = T> {
	current?: StandardColor;
	(this: T, color: string | StandardColor): R;
	reset (this: T): R;
}

export const makeLight = function <T extends DependentButton> (button: T): Light<void, T> {
	return bindDeep(light as unknown as Light<T>, button);
};

export const makeDark = function <T extends DependentButton> (button: T): Dark<void, T> {
	return bindDeep(dark as unknown as Dark<T>, button);
};

export const makeFlash = function <T extends DependentButton> (button: T): Flash<void, T> {
	return bindDeep(flash as unknown as Flash<T>, button);
};

export const makePulse = function <T extends DependentButton> (button: T): Pulse<void, T> {
	return bindDeep(pulse as unknown as Pulse<T>, button);
};
