/*
	Module: Launchpad MK2
	Description: Class for the Launchpad MK2 device
*/
import rocketry, {Device, PortNumbers} from "@rocketry/core";
import {Color, color} from "./features/color";
import {Clock, makeClock} from "./features/clock";
import {createButtons, registerButtonEvents} from "./features/button";
import {Layout, makeLayout} from "./features/layout";
import {makeQuery, get} from "./features/query";
import {makeMarquee, Marquee, registerMarqueeEvents} from "./features/marquee";


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
export default class LaunchpadMk2 extends Device<LaunchpadMk2, typeof LaunchpadMk2> {
	static color: Color = color;
	buttons = createButtons(this);
	// Features
	query = makeQuery(this);
	get = get.bind(this);
	clock: Clock<void, this> = makeClock<this>(this);
	layout: Layout<void, this> = makeLayout<this>(this);
	marquee: Marquee<void> = makeMarquee<this>(this);

	constructor (ports?: PortNumbers) {
		super(ports);
		// Set layout to session for Rocketry control, assures the layout is the default
		this.layout.set("session");
	}

	// Full reset
	// The MK2 ignores all reset commands from the MIDI spec I tested and
	// doesn't document their own in the reference so...
	reset() {
		this.clock.reset()
			.layout.reset()
			// .light.reset()
			.marquee.reset();
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
			"regex": /Volume|Fader/i,
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
