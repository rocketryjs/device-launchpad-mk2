/*
	Module: Launchpad RGB button mixin
	Description: Methods for RGB color capable Launchpad devices' buttons
*/

import bindDeep from "bind-deep";


// Helper function for sending standard colors
const sendStandard = function(color, channel) {
	const layout = this.device.layout.current || 0;
	if (!channel) {
		// Channel to use from layout
		channel = this.device.layouts[layout].channel;
	}
	const status = this.status.replace(/\s/g, "").toLowerCase();

	// Send
	return this.device.send[status]([this.note[layout], color.value], channel);
};


// Lighting
const light = function(color) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.light.current = color;

	// Send
	if (color.type === "rgb") {
		// RGB
		return this.device.send.sysex([this.device.constructor.sysex.prefix, 11, this.note.default, color.value]);
	} else if (color.type === "standard") {
		// Basic
		return sendStandard.call(this, color);
	}
};
light.stop = function() {
	return this.light("off");
};
light.reset = light.stop;


// Flashing
const flash = function(color) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.flash.current = color;

	// Send
	if (color.type === "rgb") {
		// RGB
		throw new TypeError("Flashing can't be used with an RGB color via MIDI.");
	} else if (color.type === "standard") {
		// Basic
		return sendStandard.call(this, color, 2);
	}

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
const pulse = function(color) {
	// Normalize
	color = this.device.constructor.color.normalize(color);

	// Save
	this.pulse.current = color;
	// Send
	if (color.type === "rgb") {
		// RGB
		throw new TypeError("Pulsing can't be used with an RGB color via MIDI.");
	} else if (color.type === "standard") {
		// Basic
		return sendStandard.call(this, color, 3);
	}

	// Method chaining
	return this;
};
pulse.stop = function() {
	return this.pulse("off");
};
pulse.reset = pulse.stop;


/*
	Export mixin
*/
export default function (target) {
	target.inits.add(function () {
		Object.defineProperties(
			this,
			{
				"light": {
					"value": bindDeep(this, light),
				},
				"dark": {
					get() {
						return this.light.stop;
					},
				},
				"flash": {
					"value": bindDeep(this, flash),
				},
				"pulse": {
					"value": bindDeep(this, pulse),
				},
			},
		);
	});
};
