const FORMAT = '%c%s%s ';
const DD = ' » ';

// EXIT
export const ext = console.ext = function (msg) {
  console.log(FORMAT,
    'color: GreenYellow; background-color: DarkGreen;',
    DD, msg);
}
// ALERT
export const alt = console.alt = function (msg) {
  console.log(FORMAT,
    'color: Black; background-color: Gold;',
    DD, msg);
}
// ERROR
export const err = console.err = function (msg) {
  console.log(FORMAT,
    'color: MistyRose; background-color: DarkRed;',
    DD, msg);
}
// NOTIFICATION
export const not = console.not = function (msg) {
  console.log(FORMAT,
    'color: LightCyan; background-color: DarkSlateGray;',
    DD, msg);
}
// DEBUG
export const dbg = console.dbg = function (msg) {
  console.log(FORMAT,
    'color: SkyBlue; background-color: MidnightBlue;',
    DD, msg);
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