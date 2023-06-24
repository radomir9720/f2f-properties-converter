# Figma to Flutter Properties Converter

Extension for [VSCode](https://code.visualstudio.com/), which converts text style properties, colors, border radius, etc. from **Figma** to **Flutter** format(`Color`, `TextStyle`, `BorderRadius`)

<img src="https://raw.githubusercontent.com/radomir9720/f2f-properties-converter/main/doc/images/f2f_header_demo.png"/>

You can convert properties in two ways:
1. Copy parameter from `Figma`, and paste it in your `Flutter` project using the shortcut `CMD+SHIFT+F`(for Mac) or `CTRL+SHIFT+F`(other platforms).
2. Select `Figma`-formatted parameters in your `Flutter` project, and press `CMD+SHIFT+G`(for Mac) or `CTRL+SHIFT+G`(other platforms).

Shortcuts can be changed in the settings, of course. Also, you can use command palette to run the commands above.

## Installation
[Install from the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=radomir9720.f2f-properties-converter) or by [searching within VS Code](https://code.visualstudio.com/docs/editor/extension-marketplace#_search-for-an-extension).

## Features

1. `TextStyle` convert
<img src="https://raw.githubusercontent.com/radomir9720/f2f-properties-converter/main/doc/images/text_style_convert_demo.gif"/>

2. `Color` convert
<img src="https://raw.githubusercontent.com/radomir9720/f2f-properties-converter/main/doc/images/color_convert_demo.gif"/>

3. `BorderRadius` convert 
<img src="https://raw.githubusercontent.com/radomir9720/f2f-properties-converter/main/doc/images/border_radius_convert_demo.gif"/>

## Extension Settings

* `f2f-properties-conveter.color.wrapColorInClass`
* `f2f-properties-conveter.textStyle.fontFamilyQuotes`
* `f2f-properties-conveter.textStyle.pasteFontStyleNormalWhenItsUndefined`
* `f2f-properties-conveter.textStyle.pasteZeroLetterSpacingWhenItsUndefined`
* `f2f-properties-conveter.textStyle.wrapTextStyleInClass`

Below you can see the definitions:

<img src="https://raw.githubusercontent.com/radomir9720/f2f-properties-converter/main/doc/images/f2f_settings.png"/>
