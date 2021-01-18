import {Captures, Message, Meta, SubEmitter} from "@rocketry/core";
import LaunchpadMk2 from "../..";
import {Button} from ".";


type Predicate = (value: Button, index: number, array: Array<Button>) => boolean;

export class ButtonList extends SubEmitter<LaunchpadMk2> {
	buttons: Set<Button>;
	constructor (device: LaunchpadMk2, ...buttons: Array<Button>) {
		super(device);
		this.buttons = new Set(buttons);
	}

	// Determine if the emitter should emit
	willEmit (event: string, message: Message, captures: Captures, meta: Meta): boolean {
		return Array.from(this.buttons)
			.map(button => button.willEmit(event, message, captures, meta))
			.some(value => value);
	}

	filter (predicate: Predicate): ButtonList {
		return new ButtonList(
			this.device,
			...Array.from(this.buttons)
				.filter(predicate)
		);
	}

	find (predicate: Predicate): Button | undefined {
		return Array.from(this.buttons)
			.find(predicate);
	}

	// Iterator for use in for loops and spread syntax
	get [Symbol.iterator] (): () => IterableIterator<Button> {
		return this.buttons[Symbol.iterator];
	}
}
