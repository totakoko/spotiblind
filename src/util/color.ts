/**
 * Create a new color between 2 colors with a ratio.
 */
export function interpolateColor(color1: string, color2: string, ratio: number): string {
  const r = Math.ceil(Number.parseInt(color1.slice(1, 3), 16) * (1 - ratio) + Number.parseInt(color2.slice(1, 3), 16) * ratio)
  const g = Math.ceil(Number.parseInt(color1.slice(3, 5), 16) * (1 - ratio) + Number.parseInt(color2.slice(3, 5), 16) * ratio)
  const b = Math.ceil(Number.parseInt(color1.slice(5, 7), 16) * (1 - ratio) + Number.parseInt(color2.slice(5, 7), 16) * ratio)
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

function hex(i: number): string {
  return `${i < 16 ? '0' : ''}${i.toString(16)}`
}
