import {Captures, Message} from "@rocketry/core";
import {inRange} from "lodash";
import LaunchpadMk2 from "../..";


const isNoteOn = (value: number) => inRange(value, 144, 160);
const isControlChange = (value: number) => inRange(value, 176, 192);
const validateStatus = (message: Message, captures: Captures) => isNoteOn(captures.status[0]) || isControlChange(captures.status[0]);
const validateNote = (message: Message, captures: Captures) => inRange(captures.note[0], 0, 128);

const getMetaDataNote = function (this: LaunchpadMk2, message: Message, captures: Captures) {
	let status: string;
	if (isNoteOn(captures.status[0])) {
		status = "noteOn";
	} else if (isControlChange(captures.status[0])) {
		status = "controlChange";
	}
	return {
		note: captures.note,
		target: this.buttons.find(
			(button) => button.status === status && button.note === captures.note[0]
		),
	};
};

export const registerButtonEvents = function (): void {
	const singleByte = {
		minBytes: 1,
		maxBytes: 1,
	};

	// When pressing a button
	LaunchpadMk2.registerEvent(
		"press",
		{
			pattern: {
				status: singleByte,
				note: singleByte,
				pressure: singleByte,
			},
			validate (message, captures) {
				return validateStatus(message, captures)
					&& validateNote(message, captures)
					&& inRange(captures.pressure[0], 1, 128);
			},
			getMetaData (this: LaunchpadMk2, message, captures) {
				return {
					...getMetaDataNote.call(this, message, captures),
					pressed: true,
					pressure: captures.pressure[0],
				};
			},
		},
	);

	// When releasing a button
	LaunchpadMk2.registerEvent(
		"release",
		{
			pattern: {
				status: singleByte,
				note: singleByte,
				pressure: {
					matchBytes: [0],
				},
			},
			validate (message, captures) {
				return validateStatus(message, captures)
					&& validateNote(message, captures);
			},
			getMetaData (this: LaunchpadMk2, message, captures) {
				return {
					...getMetaDataNote.call(this, message, captures),
					pressed: false,
					pressure: 0,
				};
			},
		},
	);
};
