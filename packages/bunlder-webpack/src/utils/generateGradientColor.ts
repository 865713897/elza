import chalk from "chalk";
import { RGB } from "../types";

export function generateGradientContent(
  content: string,
  colors: [string, string]
) {
  const _colors = generateGradientColor(
    colors[0],
    colors[1],
    content.trim().length
  );
  return content
    .split("")
    .map((c, index) => {
      if (c) {
        return _colors[index](c);
      }
      return c;
    })
    .join("");
}

export function generateGradientColor(
  startColor: string,
  endColor: string,
  steps: number
) {
  const start = parseColor(startColor);
  const end = parseColor(endColor);

  return Array.from({ length: steps }, (_, i) => {
    const factor = i / (steps - 1);
    const interpolatedColor = interpolateColor(start, end, factor);
    return chalk.hex(colorToHex(interpolatedColor));
  });
}

// 处理颜色
function parseColor(color: string): RGB {
  if (color.startsWith("#")) {
    return parseHexColor(color);
  } else if (color.startsWith("rgb")) {
    return parseRgbColor(color);
  }
  throw new Error("Invalid color format");
}

function parseHexColor(hex: string): RGB {
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  const result = hex
    .slice(1)
    .match(/.{1,2}/g)!
    .map((c) => parseInt(c, 16));
  return { r: result[0], g: result[1], b: result[2] };
}

function parseRgbColor(rgb: string): RGB {
  const result = rgb.match(/\d+/g)!.map(Number);
  return { r: result[0], g: result[1], b: result[2] };
}

function colorToHex(color: RGB): string {
  return `#${Object.values(color)
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

function interpolateColor(start: RGB, end: RGB, factor: number): RGB {
  const result: RGB = { r: 0, g: 0, b: 0 };
  ["r", "g", "b"].forEach((channel) => {
    result[channel as keyof RGB] = Math.round(
      start[channel as keyof RGB] +
        (end[channel as keyof RGB] - start[channel as keyof RGB]) * factor
    );
  });
  return result;
}
