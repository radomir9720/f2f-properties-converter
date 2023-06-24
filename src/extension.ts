// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";
import clipboard from "clipboardy";
import {
  hex6SymbolColorConverter,
  hex8SymbolColorConverter,
  rgbToHexColorConverter,
} from "./converters/color_converters";
import { PropertyConverter } from "./models/property_converter";
import {
  allBorderRadiusConverter,
  diagonalBorderRaiusConverter,
  mixedBorderRadiusConverter,
} from "./converters/border_radius_converters";
import {
  fontFamilyConverter,
  fontLetterSpacingConverter,
  fontLineHeightConverter,
  fontSizeConverter,
  fontStyleConverter,
  fontWeightConverter,
  textStyleConverter,
} from "./converters/text_style_converters";

export function activate(context: vscode.ExtensionContext) {
  const convertFromClipboard = vscode.commands.registerCommand(
    "f2f-properties-conveter.covertFromClipboard",
    () => {
      const clipboardValue = clipboard.readSync();
      if (!clipboardValue || clipboardValue === "") {
        showInfoMessage("Clipboard is empty. Copy some parameter(s) first");
        return;
      }

      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        showInfoMessage(
          "No editor selected! Put the cursor in an editor(file) where the converted value should be pasted"
        );
        return;
      }

      convert(editor, clipboardValue);
    }
  );

  const convertFromSelection = vscode.commands.registerCommand(
    "f2f-properties-conveter.covertFromSelection",
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        showInfoMessage(
          "No editor selected! Select parameter(s) in an editor(file) which should be converted"
        );
        return;
      }

      if (editor.selection.isEmpty) {
        vscode.window.showInformationMessage(
          "No selection! Select parameter(s) in an editor(file) which should be converted"
        );
        return;
      }

      const value = editor.document.getText(
        new vscode.Range(editor.selection.start, editor.selection.end)
      );

      convert(editor, value);
    }
  );

  context.subscriptions.push(convertFromClipboard);
  context.subscriptions.push(convertFromSelection);
}

const converters: PropertyConverter[] = [
  textStyleConverter,
  fontLineHeightConverter,
  fontLetterSpacingConverter,
  fontFamilyConverter,
  fontStyleConverter,
  fontSizeConverter,
  fontWeightConverter,
  rgbToHexColorConverter,
  hex8SymbolColorConverter,
  hex6SymbolColorConverter,
  mixedBorderRadiusConverter,
  diagonalBorderRaiusConverter,
  allBorderRadiusConverter,
];

function showInfoMessage(message: string): void {
  vscode.window.showInformationMessage(message);
}

function convert(editor: vscode.TextEditor, value: string): void {
  editor.edit((editBuilder) => {
    editBuilder.replace(editor.selection, convertProperties(value, converters));
  });
}

export function convertProperties(
  value: string,
  converters: PropertyConverter[]
): string {
  var newValue = value;
  for (const converter of converters) {
    newValue = newValue.replace(converter.regexp, converter.replacer);
  }
  return newValue;
}

export function deactivate() {}
