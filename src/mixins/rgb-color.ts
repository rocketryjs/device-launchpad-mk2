/*
	Module: Launchpad RGB color mixin
	Description: Methods and properties for RGB color capable Launchpad devices
*/
import {betweenInclusive} from "@rocketry/util"; // TODO correct location


export default function(target) {
	/*
		Static
	*/
	// RGB color names and ranges
	// Note: You can change these values at runtime. Read about how to do this in the docs.
	target.color = {
		"names": {
			"dark red": 7,
			"red": 5,
			"pink": 95,
			"fuchsia": 58,
			"purple": 55,
			"dark purple": 81,
			"indigo": 50,
			"blue": 45,
			"light blue": 41,
			"cyan": 37,
			"teal": 65,
			"green": 23,
			"light green": 21,
			"lime": 17,
			"yellow": 62,
			"amber": 61,
			"orange": 9,
			"dark orange": 11,
			"brown": 83,
			"sepia": 105,
			"gray": 71,
			"grey": "gray",
			"blue gray": 103,
			"blue grey": "blue gray",
			"white": 3,
			"black": "off",
			"off": 0
		},
		"basic": {
			"range": [0, 128] // Range, exclusive on ceiling
		},
		"rgb": {
			"range": [0, 64] // Range, exclusive on ceiling
		},
	};

	// Validates and normalizes formats for RGB and standard colors
	// TODO: type overload
	type StandardColorType = number;
	interface rgb {
		r: number,
		g: number,
		b: number,
	}
	interface redgreenblue {
		red: number,
		green: number,
		blue: number,
	}
	type RGBColorType = redgreenblue | rgb | [number, number, number];
	target.normalize = function (color: string | StandardColorType | RGBColorType): ColorType {
		// Validate and normalize colors for use in commands
		const result: ColorType = {};
		let valid;

		// Named basic or RGB color
		if (typeof color === "string") {
			// From color names
			return this.normalize(this.names[color]);
		}

		// Values
		if (typeof color === "object") {
			// RGB: {red, green, blue} or {r, g, b} or [red, green, blue], fallback on 0 in case of falsy values like 0
			result.value = [
				color.red || color.r || color[0] || 0,
				color.green || color.g || color[1] || 0,
				color.blue || color.b || color[2] || 0,
			];
			valid = result.value.every(value => betweenInclusive(value, ...this.rgb.range));
			result.type = "rgb";
		} else {
			// Basic: user color name or defaults color name for the device or use number
			result.value = color;
			valid = betweenInclusive(result.value, ...this.basic.range);
			result.type = "standard";
		}

		// Exit
		if (!valid) {
			throw new RangeError(`Color: ${color}, isn't in the accepted range.`);
		}
		return result;
	};
};
