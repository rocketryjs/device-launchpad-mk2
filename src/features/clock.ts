import type {Device} from "@rocketry/core";
import bindDeep from "bind-deep";


const clear: Clock<DependentDevice>["clear"] = function () {
	// Stop the interval
	if (this.clock.interval) {
		clearInterval(this.clock.interval);
		delete this.clock.interval;
	}
	return this;
};
const change: Clock<DependentDevice>["change"] = function (
	// Beats per minute
	bpm: number,
	// Will stop after 48 messages (2 beats) by default
	maxReps = 48
) {
	// Save
	this.clock.current = bpm;

	// Clear if called before last one was stopped
	this.clock.clear();

	// Stop sending MIDI clock messages when closing the device
	// `device.reset()` should be run before `device.close()` as this only prevents extra messages
	if (!this.clock.hasCloseListener) {
		this.clock.hasCloseListener = true;
		this.on("close", () => this.clock.clear());
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
	return this;
};

export const clock: Clock<DependentDevice> = {
	clear,
	change,
	set,
	reset,
	current: undefined,
	hasCloseListener: false,
};

declare abstract class DependentDevice extends Device<DependentDevice> {
	clock: Clock<void, DependentDevice>;
}

export interface Clock<T extends DependentDevice | void, R extends DependentDevice | void = T> {
	current?: number;
	hasCloseListener: boolean;
	interval?: NodeJS.Timeout;
	clear (this: T): R;
	change (this: T, bpm: number, maxReps?: number): R;
	set (this: T, bpm: number, maxReps?: number): R;
	reset (this: T): R;
}

export const makeClock = function <T extends DependentDevice> (device: T): Clock<void, T> {
	return bindDeep(clock as Omit<Clock<T>, "interval">, device);
};
