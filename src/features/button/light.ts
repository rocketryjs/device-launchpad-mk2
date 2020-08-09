import type {RGB} from "loose-rgb/lib/helpers";
import type {StandardColorType} from "../color";

// Helper function for sending standard colors
export const sendStandard = function(color: number, channel?: number) {
	const layout = this.device.layout.current || 0;
	if (!channel) {
		// Channel to use from layout
		channel = this.device.layouts[layout].channel;
	}
	console.log(this);
	return this.device.send[this.status]([this.note, color], channel);
};


// Lighting
export const light = function (color: StandardColorType | RGB) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.light.current = color;

	// Send
	if (Array.isArray(color)) {
		// RGB
		return this.device.send.sysex([this.device.constructor.sysex.prefix, 11, this.note.default, color]);
	}
	// Basic
	return sendStandard.call(this, color);
};
light.stop = function() {
	return this.light("off");
};
light.reset = light.stop;
export const dark = light.stop;


// Flashing
export const flash = function(color: StandardColorType) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.flash.current = color;

	// Send
	if (Array.isArray(color)) {
		// RGB
		throw new TypeError("Flashing can't be used with an RGB color via MIDI.");
	}
	// Basic
	return sendStandard.call(this, color, 2);

	// Method chaining
	return this;
};
flash.stop = function() {
	// Re-light or pulse color
	if (this.pulse.current) {
		this.pulse(this.pulse.current);
	} else if (this.light.current) {
		this.light(this.light.current);
	} else {
		// Stop flashing
		this.dark();
	}

	// Method chaining
	return this;
};
flash.reset = flash.stop;


// Pulsing
export const pulse = function(color: StandardColorType) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.pulse.current = color;
	// Send
	if (Array.isArray(color)) {
		// RGB
		throw new TypeError("Pulsing can't be used with an RGB color.");
	}
	return sendStandard.call(this, color, 3);

	// Method chaining
	return this;
};
pulse.stop = function() {
	return this.pulse("off");
};
pulse.reset = pulse.stop;
