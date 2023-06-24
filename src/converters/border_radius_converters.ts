import { PropertyConverter } from "../models/property_converter";

export const allBorderRadiusConverter: PropertyConverter = {
  regexp: /(border-radius: )?([0-9]+)px/g,
  replacer: (_, __, radius) => wrapAllCircular(radius),
};

function wrapAllCircular(radius: any) {
  if (radius === "0") {
    return "BorderRadius.zero";
  }
  return `const BorderRadius.all(Radius.circular(${radius}))`;
}

export const mixedBorderRadiusConverter: PropertyConverter = {
  regexp: /border-radius: ([0-9]+)px ([0-9]+)px ([0-9]+)px ([0-9]+)px;?/g,
  replacer: (_, tl, tr, br, bl) => {
    if ([tl, tr, br, bl].every((e) => e === tl)) {
      return wrapAllCircular(tl);
    }

    if (tl === tr && br === bl) {
      return `const BorderRadius.vertical(
          ${wrapInRadiusCircular("top", tl)}
          ${wrapInRadiusCircular("bottom", br)}
      )`;
    }

    if (tl === bl && tr === br) {
      return `const BorderRadius.horizontal(
        ${wrapInRadiusCircular("left", tl)}
        ${wrapInRadiusCircular("right", br)}
      )`;
    }

    return `const BorderRadius.only(
        ${wrapInRadiusCircular("topLeft", tl)}
        ${wrapInRadiusCircular("topRight", tr)}
        ${wrapInRadiusCircular("bottomRight", br)}
        ${wrapInRadiusCircular("bottomLeft", bl)}
      )`;
  },
};

export const diagonalBorderRaiusConverter: PropertyConverter = {
  regexp: /border-radius: ([0-9]+)px ([0-9]+)px;?/g,
  replacer: (_, a, b) => {
    return `const BorderRadius.only(
        ${wrapInRadiusCircular("topLeft", a)}
        ${wrapInRadiusCircular("topRight", b)}
        ${wrapInRadiusCircular("bottomRight", a)}
        ${wrapInRadiusCircular("bottomLeft", b)}
      )`;
  },
};

function wrapInRadiusCircular(position: string, radius: any) {
  if (radius === "0") {
    return "";
  }
  return `${position}: Radius.circular(${radius}),`;
}
