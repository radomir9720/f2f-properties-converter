import { PropertyConverter } from "../models/property_converter";
import * as vscode from "vscode";
import { rgbaToHex } from "./color_converters";

// Color
const hex3Regexp = /color: #([0-9a-fA-F]{3});/;
const hex6Regexp = /color: #([0-9a-fA-F]{6});/;
const hex8Regexp = /color: #([0-9a-fA-F]{6})([0-9a-fA-F]{2});/;
const rgbaRegexp = /rgba\((\d+),\s?(\d+),\s?(\d+),\s?(\d?.?\d)\);/;
//
const fontStyleRegexp = /font-style: (\w+);/;
const textAlignRegexp = /text-align: .+;/;
const fontSizeRegexp = /font-size: (\d+)px;/;
const fontFamilyRegexp = /font-family: (.*);/;
const fontWeightRegexp = /font-weight: (\d+);/;
const lineHeightPxRegexp = /line-height: (\d+)px;/;
const lineHeightPercentRegexp = /line-height: (\d+)%;/;
const letterSpacingPxRegexp = /letter-spacing: (\-?\d?\.?\d+)px;/;
const letterSpacingEmRegexp = /letter-spacing: (\-?\d?\.?\d+)em;/;
const textDecorationRegexp = /text-decoration-line: (\w+);/;

// Keys
const kColorKey = "color";
const kFontStyleKey = "fontStyle";
const kFontFamilyKey = "fontFamily";
const kFontWeightKey = "fontWeight";
const kLetterSpacingKey = "letterSpacing";
const kTextDecorationKey = "decoration";
const kFontSizeKey = "fontSize";
const kLineHeightKey = "height";

export const textStyleConverter: PropertyConverter = {
  regexp: /.*/gs,
  replacer: (all) => {
    const textStyleProps = vscode.workspace.getConfiguration(
      "f2f-properties-conveter.textStyle"
    );
    const wrapInClass = textStyleProps.get("wrapTextStyleInClass") !== false;

    let value = all;
    const propertiesMap = new Map<string, any>();
    popMatch(hex3Regexp, (_, color) =>
      propertiesMap.set(
        kColorKey,
        formatColor(`${color}${color}`, !wrapInClass)
      )
    );
    popMatch(hex6Regexp, (_, color) => {
      propertiesMap.set(kColorKey, formatColor(color, !wrapInClass));
    });
    popMatch(hex8Regexp, (_, color, opacity) =>
      propertiesMap.set(kColorKey, formatColor(color, !wrapInClass, opacity))
    );
    popMatch(rgbaRegexp, (_, r, g, b, a) => {
      propertiesMap.set(
        kColorKey,
        formatColor(
          `${rgbaToHex(r)}${rgbaToHex(g)}${rgbaToHex(b)}`,
          !wrapInClass,
          rgbaToHex(a, true)
        )
      );
    });
    popMatch(fontStyleRegexp, (_, style) =>
      propertiesMap.set(kFontStyleKey, formatFontStyle(style))
    );
    popMatch(textAlignRegexp, () => {});
    popMatch(fontSizeRegexp, (_, size) =>
      propertiesMap.set(kFontSizeKey, size)
    );
    popMatch(fontFamilyRegexp, (_, ff) =>
      propertiesMap.set(kFontFamilyKey, formatFontFamily(ff))
    );
    popMatch(fontWeightRegexp, (_, fw) =>
      propertiesMap.set(kFontWeightKey, formatFontWeight(fw))
    );
    popMatch(lineHeightPxRegexp, (_, lh) => {
      doIfSizeIsDefined((size) => {
        const height = parseInt(lh) / size;
        propertiesMap.set(kLineHeightKey, height.toFixed(2));
      });
    });
    popMatch(lineHeightPercentRegexp, (_, lh) => {
      doIfSizeIsDefined((size) => {
        const height = (parseInt(lh) * size) / 100;
        propertiesMap.set(kLineHeightKey, height.toFixed(2));
      });
    });
    popMatch(letterSpacingPxRegexp, (_, ls) =>
      propertiesMap.set(kLetterSpacingKey, ls)
    );
    popMatch(letterSpacingEmRegexp, (_, ls) => {
      doIfSizeIsDefined((size) => {
        const pasteZeroLetterSpacingWhenItsUndefined = textStyleProps.get(
          "pasteZeroLetterSpacingWhenItsUndefined"
        );
        if (!ls || ls === "0") {
          if (pasteZeroLetterSpacingWhenItsUndefined) {
            propertiesMap.set(kLetterSpacingKey, "0");
          }
          return;
        }
        propertiesMap.set(kLetterSpacingKey, `${size * parseFloat(ls)}`);
      });
    });
    popMatch(textDecorationRegexp, (_, td) => {
      if (td === "strikethrough") {
        return propertiesMap.set(
          kTextDecorationKey,
          formatTextDecoration("lineThrough")
        );
      }
      propertiesMap.set(kTextDecorationKey, formatTextDecoration(td));
    });

    const pasteFontStyleNormalWhenItsUndefined = textStyleProps.get(
      "pasteFontStyleNormalWhenItsUndefined"
    );
    if (pasteFontStyleNormalWhenItsUndefined === true) {
      if (!propertiesMap.has(kFontStyleKey)) {
        propertiesMap.set(kFontStyleKey, formatFontStyle("normal"));
      }
    }

    if (value.trim() !== "" || propertiesMap.size < 3) {
      return all;
    }

    const properties = Array.from(propertiesMap)
      .map((e) => `${e[0]}: ${e[1]}`)
      .join(",\n");

    if (wrapInClass) {
      return `const TextStyle(\n${properties},\n)`;
    }
    return properties;

    function popMatch(
      regexp: RegExp,
      replacer: (substring: string, ...args: any[]) => void
    ): void {
      value = value.replace(regexp, (all, ...segments) => {
        replacer(all, ...segments);
        return "";
      });
    }

    function doIfSizeIsDefined(whenDefined: (size: number) => void): void {
      const size = propertiesMap.get(kFontSizeKey);
      if (size) {
        whenDefined(parseInt(size));
      }
    }
  },
};

function formatColor(rgb: string, makeConst: boolean, opacity = "FF"): string {
  const value = "0x" + `${opacity}${rgb}`.toUpperCase();
  return `${makeConst ? "const " : ""}Color(${value})`;
}

export const fontLineHeightConverter: PropertyConverter = {
  regexp:
    /(font-size: (\d+)px.*?)?line-height: (\d+)px;?(.*?font-size: (\d+)px)?/gs,
  replacer: (all, bef, fsbef, fh, aft, fsaft) => {
    const fontSize = fsbef ?? fsaft;
    if (!fontSize) {
      return all;
    }
    return `${bef ?? ""}height: ${fh / parseInt(fontSize)},${aft ?? ""}`;
  },
};

export const fontLetterSpacingConverter: PropertyConverter = {
  regexp:
    /(font-size: (\d+)px.*?)?letter-spacing: (0?.?\d+)em;?(.*?font-size: (\d+)px)?/gs,
  replacer: (all, bef, fsbef, ls, aft, fsaft) => {
    const pasteZeroLetterSpacingWhenItsUndefined = vscode.workspace
      .getConfiguration("f2f-properties-conveter.textStyle")
      .get("pasteZeroLetterSpacingWhenItsUndefined");

    const fontSize = fsbef ?? fsaft;
    if (!fontSize) {
      return all;
    }
    const spacing =
      ls === "0"
        ? pasteZeroLetterSpacingWhenItsUndefined
          ? "spacing: 0"
          : ""
        : `${parseInt(fontSize) * parseFloat(ls)}`;
    return `${bef ?? ""}${spacing},${aft ?? ""}`;
  },
};

export const fontFamilyConverter: PropertyConverter = {
  regexp: RegExp(fontFamilyRegexp, "g"),
  replacer: (_, ff) => {
    const fontFamily = formatFontFamily(ff);
    return `fontFamily: ${fontFamily},`;
  },
};

function formatFontStyle(fs: string) {
  return `FontStyle.${fs}`;
}
function formatFontWeight(fw: string) {
  return `FontWeight.w${fw}`;
}
function formatTextDecoration(td: string) {
  return `TextDecoration.${td}`;
}

function formatFontFamily(ff: string) {
  const fontFamilyQuotesId = vscode.workspace
    .getConfiguration("f2f-properties-conveter.textStyle")
    .get("fontFamilyQuotes");

  let fontFamilyQuotes = "";
  switch (fontFamilyQuotesId) {
    case "double":
      fontFamilyQuotes = '"';
      break;
    case "single":
      fontFamilyQuotes = "'";
  }
  const fontFamily = `${fontFamilyQuotes}${ff}${fontFamilyQuotes}`;
  return fontFamily;
}

export const fontStyleConverter: PropertyConverter = {
  regexp: RegExp(fontStyleRegexp, "g"),
  replacer: (_, fs) => {
    return `${kFontStyleKey}: ${formatFontStyle(fs)},`;
  },
};

export const fontSizeConverter: PropertyConverter = {
  regexp: RegExp(fontSizeRegexp, "g"),
  replacer: (_, fs) => {
    return `${kFontSizeKey}: ${fs},`;
  },
};
export const fontWeightConverter: PropertyConverter = {
  regexp: RegExp(fontWeightRegexp, "g"),
  replacer: (_, fw) => {
    return `${kFontWeightKey}: ${formatFontWeight(fw)},`;
  },
};
