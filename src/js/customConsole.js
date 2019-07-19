const FORMAT = '%c%s';
const RAD = 'border-radius: 99px;';
const DD = ' » ';

// SUCCESS
export const suc = console.suc = function (msg) {
  console.log(FORMAT,
    'color: GreenYellow; background-color: DarkGreen; ' + RAD,
    DD + msg + ' ');
}
// ALERT
export const alt = console.alt = function (msg) {
  console.log(FORMAT,
    'color: Black; background-color: Gold; ' + RAD,
    DD + msg + ' ');
}
// ERROR
export const err = console.err = function (msg) {
  console.log(FORMAT,
    'color: MistyRose; background-color: DarkRed; ' + RAD,
    DD + msg + ' ');
}
// NOTIFICATION
export const not = console.not = function (msg) {
  console.log(FORMAT,
    'color: LightCyan; background-color: DarkSlateGray; ' + RAD,
    DD + msg + ' ');
}
// DEBUG
export const dbg = console.dbg = function (msg) {
  console.log(FORMAT,
    'color: SkyBlue; background-color: MidnightBlue; ' + RAD,
    DD + msg + ' ');
}
// FANCY
export const fcy = console.fcy = function (msg) {
  console.log('%c%s',
    'color: #33cfff;' +
    'background-color: rgba(51, 207, 255, .1);' +
    'border: 1px solid #33cfff;' +
    'border-radius: 2px; padding: 6px 9px;' +
    'text-shadow: 0 0 2px rgba(255, 255, 255, .8);' +
    '',
    msg);
}
