import { PropertyConverter } from "../models/property_converter";
import * as vscode from "vscode";

export const textStyleConverter: PropertyConverter = {
  regexp:
    /font-family: (.+);\nfont-size: (\d+)px;\n(font-style: ([\w]+);\n)?font-weight: (\d+);\nline-height: (\d+)px;\nletter-spacing: (0?.?\d+)em;\n(text-align: (.+));/g,
  replacer: (_, ff, size, __, style, fw, lh, ls, ta) => {
    const textStyleProps = vscode.workspace.getConfiguration(
      "f2f-properties-conveter.textStyle"
    );
    const wrapInClass = textStyleProps.get("wrapTextStyleInClass");
    const pasteFontStyleNormalWhenItsUndefined = textStyleProps.get(
      "pasteFontStyleNormalWhenItsUndefined"
    );
    const pasteZeroLetterSpacingWhenItsUndefined = textStyleProps.get(
      "pasteZeroLetterSpacingWhenItsUndefined"
    );

    const height = parseInt(lh) / parseInt(size);
    const spacing =
      ls === "0"
        ? pasteZeroLetterSpacingWhenItsUndefined
          ? "spacing: 0, "
          : ""
        : `${parseInt(size) * parseFloat(ls)}, `;

    const fontStyle = style
      ? `fontStyle: FontStyle.${style}, `
      : pasteFontStyleNormalWhenItsUndefined
      ? "fontStyle: FontStyle.normal, "
      : "";
    const fontFamily = formatFontFamily(ff);
    const properties =
      `height: ${height}, ` +
      `fontSize: ${size}, ` +
      `fontWeight: FontWeight.w${fw}, ` +
      `${fontStyle}` +
      `${spacing}` +
      `${fontFamily}`;
    if (wrapInClass) {
      return `const TextStyle(${properties})`;
    }
    return properties;
  },
};

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
  regexp: /font-family: (.+);?/g,
  replacer: (_, ff) => {
    const fontFamily = formatFontFamily(ff);
    return `fontFamily: ${fontFamily},`;
  },
};

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
  const fontFamily = `fontFamily: ${fontFamilyQuotes}${ff}${fontFamilyQuotes}`;
  return fontFamily;
}

export const fontStyleConverter: PropertyConverter = {
  regexp: /font-style: (\w+);?/g,
  replacer: (_, fs) => {
    return `fontStyle: FontStyle.${fs},`;
  },
};

export const fontSizeConverter: PropertyConverter = {
  regexp: /font-size: (\d+)px;?/g,
  replacer: (_, fs) => {
    return `fontSize: ${fs},`;
  },
};
export const fontWeightConverter: PropertyConverter = {
  regexp: /font-weight: (\d+);?/g,
  replacer: (_, fw) => {
    return `fontWeight: FontWeight.w${fw},`;
  },
};
