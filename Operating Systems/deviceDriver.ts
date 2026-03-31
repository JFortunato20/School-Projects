/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
// --- iProject1: taskbar globals ---
;(window as any)._TaskbarH = 22;
;(window as any)._StatusMsg = "Ready";
let _TaskbarTimer: number | null = null;


     function hostDrawTaskbar(): void {
        if (!_Canvas || !_DrawingContext) return;

    const h = (window as any)._TaskbarH as number;
        const w = _Canvas.width;

    // bar background
    _DrawingContext.fillStyle = "#e11b1bff";
    _DrawingContext.fillRect(0, 0, w, h);

    // left: date/time
    const dt = new Date().toLocaleString();
    _DrawingContext.fillStyle = "#ffffffff";
    _DrawingContext.drawText(_DefaultFontFamily, _DefaultFontSize - 2, 6, h - 6, dt);

    // right: status
    const status = (window as any)._StatusMsg || "Ready";
    const sw = _DrawingContext.measureText(_DefaultFontFamily, _DefaultFontSize - 2, status);
    _DrawingContext.drawText(_DefaultFontFamily, _DefaultFontSize - 2, w - sw - 6, h - 6, status);
    }

    function hostStartTaskbar(): void {
        if (_TaskbarTimer !== null) return;
            hostDrawTaskbar();
    _TaskbarTimer = window.setInterval(() => hostDrawTaskbar(), 1000);
    }

    function hostStopTaskbar(): void {
        if (_TaskbarTimer !== null) {
            clearInterval(_TaskbarTimer);
        _TaskbarTimer = null;
        }
    }

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display') as HTMLCanvasElement;

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
              (_CPU = new TSOS.Cpu()).init();
      (_Memory = new TSOS.Memory()).init(0x300);
      _MemoryAccessor = new TSOS.MemoryAccessor();
      _MemoryManager  = new TSOS.MemoryManager();

      (document.getElementById("taHostLog") as HTMLTextAreaElement).value = "";
      (document.getElementById("btnStartOS") as HTMLButtonElement).focus();
    }

    public static initDiskDisplay(): void {
  const body = document.getElementById("diskBody");
  if (!body) return;

  body.innerHTML = "";

  // Build static table rows for all T:S:B
  for (let t = 0; t < 4; t++) {
    for (let s = 0; s < 8; s++) {
      for (let b = 0; b < 8; b++) {
        const tsb = `${t}:${s}:${b}`;

        const tr = document.createElement("tr");
        tr.id = `disk-${tsb.replace(/:/g, "-")}`;

        const tdTsb   = document.createElement("td");
        const tdUsed  = document.createElement("td");
        const tdNext  = document.createElement("td");
        const tdData  = document.createElement("td");

        tdTsb.textContent  = tsb;
        tdUsed.textContent = "0";
        tdNext.textContent = "0:0:0";
        tdData.textContent = "".padEnd(64, "0");

        tr.appendChild(tdTsb);
        tr.appendChild(tdUsed);
        tr.appendChild(tdNext);
        tr.appendChild(tdData);

        body.appendChild(tr);
      }
    }
  }
}

public static refreshDiskDisplay(): void {
  if (!_HardDrive) return;
  const hd = _HardDrive.getHardDriveMap();
  const blockSize = _HardDrive.getBlockSize();

  hd.forEach((blk, key) => {
    const rowId = `disk-${key.replace(/:/g, "-")}`;
    const tr = document.getElementById(rowId);
    if (!tr) return;

    const tds = tr.getElementsByTagName("td");
    if (tds.length < 4) return;

    tds[0].textContent = key;
    tds[1].textContent = (blk.used ? "1" : "0");
    tds[2].textContent = blk.next || "0:0:0";

    const data = (blk.data || "").toUpperCase();
    tds[3].textContent = data.padEnd(blockSize, "0");
  });
}


        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
public static hostBtnStartOS_click(btn: HTMLButtonElement): void {
  // disable Start, enable Halt/Reset
  btn.disabled = true;
  (document.getElementById("btnHaltOS") as HTMLButtonElement).disabled = false;
  (document.getElementById("btnReset")  as HTMLButtonElement).disabled = false;

  // focus the canvas (so keyboard goes to your driver)
  document.getElementById("display")!.focus();

  // tick the virtual hardware
  _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);

  // bootstrap the OS once
  _Kernel = new TSOS.Kernel();
  _Kernel.krnBootstrap();

  // first paint of CPU/PCB/Memory panes
  TSOS.Control.refreshCpuPcbMemoryViews();
 hostStartTaskbar();

}

    
        

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?

            // --- iProject1: stop taskbar updates ---
            hostStopTaskbar();
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
        }

public static refreshCpuPcbMemoryViews(): void {
  const irHex = (_CPU as any).lastIR ? (_CPU as any).lastIR.toString(16).padStart(2,"0") : "00";
  this.updateCpuTable(_CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, irHex);

  // existing: updatePcbTable(pcb) if you show a separate PCB panel
  const pcb = TSOS.Kernel.currentPcb();
  if (pcb && (document.getElementById("pcb-pid"))) {
    this.updatePcbTable(pcb);
  }

  this.updateMemoryGrid(_Memory.dump(), 8);
  this.highlightPC(_CPU.PC);

  this.updateReadyQueue();   // <— add this
}


public static updateCpuTable(pc:number, acc:number, xr:number, yr:number, z:number, irHex?:string) {
  (document.getElementById("cpu-pc")!).textContent  = pc.toString(16).padStart(3,"0").toUpperCase();
  (document.getElementById("cpu-ir")!).textContent  = (irHex ?? "00").toUpperCase();
  (document.getElementById("cpu-acc")!).textContent = acc.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("cpu-x")!).textContent   = xr.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("cpu-y")!).textContent   = yr.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("cpu-z")!).textContent   = String(z);
}


public static updatePcbTable(pcb: TSOS.PCB) {
  const el = document.getElementById("pcb-pid"); if (!el) return;
  el.textContent = String(pcb.pid);
  (document.getElementById("pcb-state")!).textContent = pcb.state;
  (document.getElementById("pcb-pc")!).textContent    = pcb.pc.toString(16).padStart(4,"0").toUpperCase();
  (document.getElementById("pcb-ir")!).textContent    = pcb.ir;
  (document.getElementById("pcb-acc")!).textContent   = pcb.acc.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("pcb-x")!).textContent     = pcb.x.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("pcb-y")!).textContent     = pcb.y.toString(16).padStart(2,"0").toUpperCase();
  (document.getElementById("pcb-z")!).textContent     = String(pcb.z);
}

public static updateMemoryGrid(bytes: Uint8Array, rowLen = 8): void {
  const body = document.getElementById("mem-body");
  if (!body) return;

  let html = "";
  for (let base = 0; base < bytes.length; base += rowLen) {
    html += `<tr><th>0x${base.toString(16).padStart(3,"0").toUpperCase()}</th>`;
    for (let i = 0; i < rowLen; i++) {
      const addr = base + i;
      const b = bytes[addr] ?? 0;
      html += `<td data-addr="${addr}">${b.toString(16).padStart(2,"0").toUpperCase()}</td>`;
    }
    html += `</tr>`;
  }
  body.innerHTML = html;
}
private static _lastPcCell: HTMLElement | null = null;
public static highlightPC(pc: number): void {
  if (this._lastPcCell) this._lastPcCell.classList.remove("pc");
  const cell = document.querySelector<HTMLElement>(`#mem-table td[data-addr="${pc}"]`);
  if (cell) {
    cell.classList.add("pc");
    this._lastPcCell = cell;
  }
}
public static updateReadyQueue(): void {
  const body = document.getElementById("rq-body");
  if (!body) return;

  // Collect processes: current first, then ready, then others (optional)
  const rows: TSOS.PCB[] = [];
  const curr = TSOS.Kernel.currentPcb();
  if (curr) rows.push(curr);

  // include others: prioritize Ready state
  TSOS.Kernel.processTable.forEach(pcb => {
    if (!curr || pcb.pid !== curr.pid) rows.push(pcb);
  });

  // render
  let html = "";
  for (const pcb of rows) {
    html += `<tr>
      <td>${pcb.pid}</td>
      <td>${pcb.state}</td>
      <td>${pcb.pc.toString(16).padStart(3,"0").toUpperCase()}</td>
      <td>${(pcb.ir || "00").toString().toUpperCase()}</td>
      <td>${pcb.acc.toString(16).padStart(2,"0").toUpperCase()}</td>
      <td>${pcb.x.toString(16).padStart(2,"0").toUpperCase()}</td>
      <td>${pcb.y.toString(16).padStart(2,"0").toUpperCase()}</td>
      <td>${pcb.z}</td>
    </tr>`;
  }
  body.innerHTML = html;
}


    }
}
