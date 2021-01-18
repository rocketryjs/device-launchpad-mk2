import rocketry, {Device, PortNumbers} from "@rocketry/core";
import {makeButtons, ButtonList, registerButtonEvents} from "./features/button";
import {Clock, makeClock} from "./features/clock";
import {Color, color} from "./features/color";
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
	// SysEx information
	static sysex = sysexInformation();
	// eslint-disable-next-line prefer-named-capture-group
	static regex = /^(launchpad mk2)(?:\s+\d+)?$/i;
	// Features
	buttons: ButtonList = makeButtons(this);
	clock: Clock<void, this> = makeClock<this>(this);
	marquee: Marquee<void> = makeMarquee<this>(this);

	constructor (ports?: PortNumbers) {
		super(ports);
		// Set layout to session for Rocketry control, assures the layout is the default
		this.send.sysEx([...this.constructor.sysex.prefix, 34, 0]);
	}

	// Full reset
	// The MK2 ignores all reset commands from the MIDI spec I tested and
	// doesn't document their own in the reference so...
	reset (): this {
		void(
			this.clock.reset()
				// .light.reset()
				.marquee.reset()
		);
		return this;
	}
}

registerButtonEvents();
registerMarqueeEvents();


/*
	Register with Rocketry core
*/
rocketry.registerDevice(LaunchpadMk2);
