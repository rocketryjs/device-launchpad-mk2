/*
	Module: Launchpad MK2
	Description: Class for the Launchpad MK2 device
*/
import rocketry, {Device, PortNumbers} from "@rocketry/core";
// Mixins
import color, {Color} from "./mixins/rgb-color";
import marquee from "./mixins/marquee";
import clock from "./mixins/clock";
import layout from "./mixins/layout";
import inquiry from "./mixins/inquiry";
import query from "./mixins/query";
import fader from "./mixins/fader";
import button from "./mixins/button";


/*
	SysEx information
*/
const sysexInformation = (() => {
	// SysEx Manufacturer ID for Focusrite/Novation
	// https://www.midi.org/specifications/item/manufacturer-id-numbers
	const manufacturer = [0, 32, 41];
	// [product type, product number]
	const model = [2, 24];
	const prefix = [...manufacturer, ...model];

	return {manufacturer, model, prefix};
});


/*
	Launchpad MK2 Class
*/
export default interface LaunchpadMk2 {
	constructor: typeof LaunchpadMk2;
}
@color @marquee @clock @layout @inquiry @query @fader @button
export default class LaunchpadMk2 extends Device {
	static color: Color;

	constructor (ports?: PortNumbers) {
		super(ports);
	}

	// Full reset
	// The MK2 ignores all reset commands from the MIDI spec I tested and
	// doesn't document their own in the reference so...
	reset() {
		this.clock.reset();
		this.layout.reset();
		this.marquee.reset();
		this.light.reset();
		return this;
	}

	// Layouts regex and channels (to allow config of user 1 and 2)
	layouts = [
		{
			"regex": /Session|Default/i,
			"channel": 1
		},
		{
			"regex": /User 1|Drum|Rack/i,
			"channel": 6
		},
		{
			"regex": /User 2/i,
			"channel": 14
		},
		{
			"regex": /Reserved|Ableton|Live/i,
			"channel": 1
		},
		{
			"regex": /Volume|^Fader$/i,
			"channel": 1
		},
		{
			"regex": /Pan/i,
			"channel": 1
		},
	]
	// SysEx information
	static sysex = sysexInformation;
	static regex = /^(?:\d+-?\s+)?(Launchpad MK2)(?:\s+\d+)?$/i
}


/*
	Register with Rocketry core
*/
rocketry.registerDevice(LaunchpadMk2);
