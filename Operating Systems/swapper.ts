/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
  // Parse params
  const keyCode: number = params[0];
  const isShifted: boolean = params[1];

  _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);

  // --- iProject1: number row with shift symbols ---
  const shiftedNumberRow: Record<string, string> = {
    "48": ")", "49": "!", "50": "@", "51": "#", "52": "$",
    "53": "%", "54": "^", "55": "&", "56": "*", "57": "("
  };
  if (keyCode >= 48 && keyCode <= 57) {
    const chr = isShifted ? shiftedNumberRow[String(keyCode)] : String.fromCharCode(keyCode);
    _KernelInputQueue.enqueue(chr);
    return;
  }

  // Space / Enter / Backspace / Tab
  if (keyCode === 32) { _KernelInputQueue.enqueue(" ");  return; } // space
  if (keyCode === 13) { _KernelInputQueue.enqueue("\r"); return; } // enter
  if (keyCode === 8)  { _KernelInputQueue.enqueue("\b"); return; } // backspace
  if (keyCode === 9)  { _KernelInputQueue.enqueue("\t"); return; } // tab

  // Punctuation (US keyboard)
  const unshifted: Record<number, string> = {
    186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
    219: "[", 220: "\\", 221: "]", 222: "'"
  };
  const shifted: Record<number, string> = {
    186: ":", 187: "+", 188: "<", 189: "_", 190: ">", 191: "?", 192: "~",
    219: "{", 220: "|", 221: "}", 222: "\""
  };
  if (unshifted[keyCode] || shifted[keyCode]) {
    _KernelInputQueue.enqueue(isShifted ? shifted[keyCode] : unshifted[keyCode]);
    return;
  }

  // History recall (Up/Down)
  if (keyCode === 38) { _KernelInputQueue.enqueue("\u2191"); return; } // Up
  if (keyCode === 40) { _KernelInputQueue.enqueue("\u2193"); return; } // Down

  // Letters A–Z
  if (keyCode >= 65 && keyCode <= 90) {
    const chr = isShifted ? String.fromCharCode(keyCode)          // uppercase
                          : String.fromCharCode(keyCode + 32);    // lowercase
    _KernelInputQueue.enqueue(chr);
    return;
  }

  // If we get here, we simply ignore the key (or add more cases later)


            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) { 
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)) {                       // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
