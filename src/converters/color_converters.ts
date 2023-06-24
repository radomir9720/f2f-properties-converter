import * as vscode from "vscode";
import { PropertyConverter } from "../models/property_converter";

function formatColor(rgb: string, opacity = "FF"): string {
  let wrapInClass = vscode.workspace
    .getConfiguration("f2f-properties-conveter.color")
    .get("wrapColorInClass");
  const value = "0x" + `${opacity}${rgb}`.toUpperCase();
  if (wrapInClass === true) {
    return `const Color(${value})`;
  }
  return value;
}

export const hex6SymbolColorConverter: PropertyConverter = {
  regexp: /(background: )?#([0-9a-fA-F]{6});?/g,
  replacer: (_, __, color) => formatColor(color),
};

export const hex8SymbolColorConverter: PropertyConverter = {
  regexp: /(background: )?#([0-9a-fA-F]{6})([0-9a-fA-F]{2});?/g,
  replacer: (_, __, color, opacity) => formatColor(color, opacity),
};

export const rgbToHexColorConverter: PropertyConverter = {
  regexp: /(background: )?rgba\((\d+),\s?(\d+),\s?(\d+),\s?(\d?.?\d)\);?/g,
  replacer: (_, __, r, g, b, a) =>
    formatColor(
      `${rgbaToHex(r)}${rgbaToHex(g)}${rgbaToHex(b)}`,
      rgbaToHex(a, true)
    ),
};

export function rgbaToHex(value: string, float = false): string {
  let converted: number;
  if (float) {
    converted = Math.round(parseFloat(value) * 255);
  } else {
    converted = parseInt(value);
  }
  return converted.toString(16).padStart(2, "0");
}
