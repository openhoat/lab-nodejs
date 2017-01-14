const colors = {
  // http://misc.flogisoft.com/bash/tip_colors_and_formatting
  bold: 1,
  default: '39',
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  lightGray: '37',
  darkGray: '90',
  lightRed: '91',
  lightGreen: '92',
  lightYellow: '93',
  lightBlue: '94',
  lightMagenta: '95',
  lightCyan: '96',
  white: '97',
  bgDefault: '49',
  bgBlack: '40',
  bgRed: '41',
  bgGreen: '42',
  bgYellow: '43',
  bgBlue: '44',
  bgMagenta: '45',
  bgCyan: '46',
  bgLightGray: '47',
  bgDarkGray: '100',
  bgLightRed: '101',
  bgLightGreen: '102',
  bgLightYellow: '103',
  bgLightBlue: '104',
  bgLightMagenta: '105',
  bgLightCyan: '106',
  bgWhite: '107',
}
const terminalColors = Object.assign((colors, text) => {
  const color = Array.isArray(colors) ? colors.join(';') : colors
  return `\x1b[${color}m${text}\x1b[0m`
}, colors)

exports = module.exports = terminalColors
