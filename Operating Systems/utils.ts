/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
  export class Kernel {
    public static processTable: Map<number, TSOS.PCB> = new Map();
    private static _currentPid: number | null = null;

    public static setCurrent(pid: number) { this._currentPid = pid; }
    public static currentPcb(): TSOS.PCB | null {
      return this._currentPid === null ? null : (this.processTable.get(this._currentPid) || null);
    }



        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();             // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            

/// Disk System Device Driver (dsDD)
try {
    this.krnTrace("Loading the disk device driver.");

    // 1) Create the backing store
    _HardDrive = new TSOS.HardDrive();
    _HardDrive.init();              // builds the Map and persists it

    // 2) Create the disk driver that uses _HardDrive
    _krnDiskDriver = new TSOS.DeviceDriverDisk();
    if (_krnDiskDriver && typeof _krnDiskDriver.driverEntry === "function") {
        _krnDiskDriver.driverEntry();
    }

    // 3) Expose it to the rest of the OS / shell
    _DiskDriver = _krnDiskDriver;
    (window as any)._DiskDriver = _DiskDriver;
    (window as any)._krnDiskDriver = _krnDiskDriver;

    // 4) Build / refresh UI
    TSOS.Control.initDiskDisplay();
    TSOS.Control.refreshDiskDisplay();

  this.krnTrace(_krnDiskDriver.status);
  _StdOut.putText("Disk driver loaded.");
  _StdOut.advanceLine();
} catch (e) {
  this.krnTrace("Disk driver init failed: " + e);
}




            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
            _Console = new TSOS.Console();
_Console.init();

_StdIn  = _Console;
_StdOut = _Console;

        }
        

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
  // 1) service interrupts first
  if (_KernelInterruptQueue.getSize() > 0) {
    const intObj = _KernelInterruptQueue.dequeue();
    this.krnInterruptHandler(intObj.irq, intObj.params);

  // 2) otherwise execute exactly ONE CPU instruction if running
  } else if (_CPU && _CPU.isExecuting) {
    _CPU.cycle();

  // 3) idle trace
  } else {
    this.krnTrace("Idle");
  }

  TSOS.Control.refreshCpuPcbMemoryViews();
}


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
  this.krnTrace("Handling IRQ~" + irq);

  switch (irq) {
    case TIMER_IRQ:
      this.krnTimerISR();
      break;

    case KEYBOARD_IRQ:
      _krnKeyboardDriver.isr(params);
      _StdIn.handleInput();
      break;

    case CONTEXT_SWITCH_IRQ:
      this.krnContextSwitch();   // save regs & let scheduler rotate
      break;

    default:
      this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
  }
}


        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
            // Or do it elsewhere in the Kernel. We don't really need this.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
public krnContextSwitch(): void {
  const cur = _Scheduler.getCurrentPcb();
  if (cur) {
    cur.pc = _CPU.PC;
    cur.acc = _CPU.Acc;
    cur.x   = _CPU.Xreg;
    cur.y   = _CPU.Yreg;
    cur.z   = _CPU.Zflag;
  }
  _Scheduler.handleContextSwitch();
}

public krnProcessExit(): void {
  const cur = _Scheduler.getCurrentPcb();
  if (cur) {
    cur.pc = _CPU.PC;
    cur.acc = _CPU.Acc;
    cur.x   = _CPU.Xreg;
    cur.y   = _CPU.Yreg;
    cur.z   = _CPU.Zflag;
  }
  _Scheduler.markCurrentTerminated();
}



        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would quickly lag the browser quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            this.krnShutdown();
        }
    }
}
