/*
	Module: Launchpad MK2
	Description: Class for the Launchpad MK2 device
*/
import rocketry, {Device, PortNumbers} from "@rocketry/core";
import bindDeep from "bind-deep";
import {color} from "./features/color";
import {clock, Clock} from "./features/clock";
import {createButtons, registerButtonEvents} from "./features/button";
import {layout} from "./features/layout";
import {makeQuery, get} from "./features/query";
import {marquee, registerMarqueeEvents} from "./features/marquee";


/*
	SysEx information
*/
const sysexInformation = () => {
	// SysEx Manufacturer ID for Focusrite/Novation
	// https://www.midi.org/specifications/item/manufacturer-id-numbers
	const manufacturer = [0, 32, 41];
	// [product type, product number]
	const model = [2, 24];
	const prefix = [...manufacturer, ...model];

	return {manufacturer, model, prefix};
};


/*
	Launchpad MK2 Class
*/
export default interface LaunchpadMk2 {
	constructor: typeof LaunchpadMk2;
}
export default class LaunchpadMk2 extends Device {
	static color = color;
	clock = bindDeep(clock as Clock<LaunchpadMk2>, this);
	buttons = createButtons(this);
	layout = bindDeep(layout, this);
	query = makeQuery(this);
	get = get.bind(this);
	marquee = bindDeep(marquee, this)

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
		// this.light.reset();
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
	static sysex = sysexInformation();
	static regex = /^(Launchpad MK2)(?:\s+\d+)?$/i
}

registerButtonEvents();
registerMarqueeEvents();


/*
	Register with Rocketry core
*/
rocketry.registerDevice(LaunchpadMk2);
