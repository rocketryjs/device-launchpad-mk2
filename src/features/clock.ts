/*
	Module: Launchpad MIDI clock
	Description: Methods for MIDI clock capable Launchpad devices
*/

import {Device} from "@rocketry/core";

const clear: Clock<DependentDevice>["clear"] = function () {
	// Stop the interval
	clearInterval(this.clock.interval);
	delete this.clock.interval;
	return this;
};
const change: Clock<DependentDevice>["change"] = function(
	// Beats per minute
	bpm: number,
	// Will stop after 48 messages (2 beats) by default
	maxReps: number = 48
) {
	// Save
	this.clock.current = bpm;

	// Clear if called before last one was stopped
	this.clock.clear();

	// Stop sending MIDI clock messages when closing the device
	// `device.reset()` should be run before `device.close()` as this only prevents extra messages
	if (!this.clock.closeListener) {
		this.clock.closeListener = () => {
			this.clock.clear();
		};
		this.on("close", this.clock.closeListener);
	}

	let reps = 0;
	this.clock.interval = setInterval(
		// Call MIDI clock
		() => {
			// Will stop after reached maxReps if not 0 or otherwise falsy
			if (reps < maxReps || !maxReps) {
				this.send([248]);
				reps++;
			} else {
				this.clock.clear();
			}
		},
		// Timing formula: 1000 / messages per second
		// Messages per second: messages per minute / 60
		// Messages per minute: 24 pulses per beat
		1000 / (bpm * 24 / 60)
	);

	return this;
};
const set: Clock<DependentDevice>["set"] = change;
const reset: Clock<DependentDevice>["reset"] = function () {
	// Reset to 120bpm if the bpm is set to something other than 120
	if (typeof this.clock.current !== "undefined" && this.clock.current !== 120) {
		return this.clock.change(120);
	}
};

export const clock: Clock<DependentDevice> = {
	clear,
	change,
	set,
	reset,
	current: undefined,
};

interface DependentDevice extends Device {
	clock: Clock<DependentDevice, void>;
}

export interface Clock<R extends DependentDevice, T extends DependentDevice | void = R> {
	clear (this: T): R;
	change (this: T, bpm: number, maxReps?: number): R;
	set (this: T, bpm: number, maxReps?: number): R;
	reset (this: T): R;
	current?: number;
	closeListener?(): void;
	interval?: NodeJS.Timeout;
}
