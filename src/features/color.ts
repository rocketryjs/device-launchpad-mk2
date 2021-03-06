import {betweenInclusive} from "@rocketry/core";
import looseRGB from "loose-rgb";
import {RGB, RGBArray} from "loose-rgb/lib/helpers";


// RGB color names
export const names: Record<string, string | number> = {
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
	"off": 0,
};

// Ranges, exclusive on ceiling
export const ranges = {
	basic: [0, 128],
	rgb: [0, 64],
} as const;

// Validates and normalizes formats for RGB and standard colors
function normalize (this: Color, color: RGB): RGBArray;
function normalize (this: Color, color: StandardColor): StandardColor;
function normalize (this: Color, color: string): StandardColor | RGBArray;
function normalize (this: Color, color: string | StandardColor | RGB): RGBArray | StandardColor
function normalize (this: Color, color: string | StandardColor | RGB): RGBArray | StandardColor {
	const throwColorError = () => {
		throw new RangeError(`Color: ${color.toString()}, isn't in the accepted range.`);
	};
		// Alias for named color
	if (typeof color === "string") {
		// From color names
		return this.normalize(this.names[color]);
	}
	// Values
	if (typeof color === "object") {
		const result = looseRGB.convert.toArray(looseRGB.normalize(color));
		result.every(value => betweenInclusive(value, ...this.ranges.rgb)) || throwColorError();
		return result;
	} else {
		// Standard: user color name or defaults color name for the device or use number
		betweenInclusive(color, ...this.ranges.basic) || throwColorError();
		return color;
	}
}

export const color: Color = {
	names,
	ranges,
	normalize,
};

export type StandardColor = number;
export interface Color {
	names: typeof names;
	ranges: typeof ranges;
	normalize: typeof normalize;
}
