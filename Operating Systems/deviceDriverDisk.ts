// cpu.ts – tell TS about the global instance and skip strict typing here
declare var _Scheduler: any;

module TSOS {
  export class Cpu {
    public isExecuting = false;
    public PC=0; public Acc=0; public Xreg=0; public Yreg=0; public Zflag=0;

    public init(): void {
      this.isExecuting = false;
      this.PC=0; this.Acc=0; this.Xreg=0; this.Yreg=0; this.Zflag=0;
    }

    public loadFromPcb(pcb: TSOS.PCB): void {
      this.PC = pcb.pc; this.Acc = pcb.acc; this.Xreg = pcb.x; this.Yreg = pcb.y; this.Zflag = pcb.z;
    }

    public saveToPcb(pcb: TSOS.PCB): void {
      pcb.pc = this.PC; pcb.acc = this.Acc; pcb.x = this.Xreg; pcb.y = this.Yreg; pcb.z = this.Zflag;
      pcb.ir = _MemoryAccessor.read(this.PC).toString(16).padStart(2,"0").toUpperCase();
    }

    public cycle(): void {
  if (!this.isExecuting) return;

  const op = _MemoryAccessor.read(this.PC++);
  switch (op) {

  // --- Load / Store ---
  case 0xA9: // LDA #imm
    this.Acc = _MemoryAccessor.read(this.PC++);
    this.Zflag = (this.Acc === 0) ? 1 : 0;
    break;

  case 0xAD: // LDA abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      this.Acc = _MemoryAccessor.read(addr);
      this.Zflag = (this.Acc === 0) ? 1 : 0;
      break;
    }

  case 0x8D: // STA abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      _MemoryAccessor.write(addr, this.Acc);
      break;
    }

  case 0xA2: // LDX #imm
    this.Xreg = _MemoryAccessor.read(this.PC++);
    this.Zflag = (this.Xreg === 0) ? 1 : 0;
    break;

  case 0xAE: // LDX abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      this.Xreg = _MemoryAccessor.read(addr);
      this.Zflag = (this.Xreg === 0) ? 1 : 0;
      break;
    }

  case 0xA0: // LDY #imm
    this.Yreg = _MemoryAccessor.read(this.PC++);
    this.Zflag = (this.Yreg === 0) ? 1 : 0;
    break;

  case 0xAC: // LDY abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      this.Yreg = _MemoryAccessor.read(addr);
      this.Zflag = (this.Yreg === 0) ? 1 : 0;
      break;
    }

  // --- Math / Compare ---
  case 0x6D: // ADC abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      const value = _MemoryAccessor.read(addr);
      this.Acc = (this.Acc + value) & 0xFF;
      this.Zflag = (this.Acc === 0) ? 1 : 0;
      break;
    }

  case 0xEC: // CPX abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      const value = _MemoryAccessor.read(addr);
      this.Zflag = (this.Xreg === value) ? 1 : 0;
      break;
    }

  // --- Branch ---
  case 0xD0: // BNE (relative)
    {
      const offset = _MemoryAccessor.read(this.PC++);
      if (this.Zflag === 0) {
        this.PC = (this.PC + (offset > 127 ? offset - 256 : offset)) & 0xFF;
      }
      break;
    }

  // --- Increment ---
  case 0xEE: // INC abs
    {
      const lo = _MemoryAccessor.read(this.PC++);
      const hi = _MemoryAccessor.read(this.PC++);
      const addr = (hi << 8) | lo;
      const value = (_MemoryAccessor.read(addr) + 1) & 0xFF;
      _MemoryAccessor.write(addr, value);
      this.Zflag = (value === 0) ? 1 : 0;
      break;
    }

  // --- System Calls ---
  case 0xFF: // SYS (print)
    if (this.Xreg === 1) {
      _StdOut.putText(String(this.Yreg));
    } else if (this.Xreg === 2) {
      let addr = this.Yreg & 0xFF;
      let s = "";
      for (let b = _MemoryAccessor.read(addr); b !== 0x00; b = _MemoryAccessor.read(++addr)) {
        s += String.fromCharCode(b);
      }
      _StdOut.putText(s);
    }
    break;

 case 0xEA: { // NOP
  // do nothing, just continue
  break;
}

   case 0x00: { // BRK — program finished
  // Count BRK as one completed instruction so metrics match expected values
  _Scheduler.onInstructionCompleted(1);

  // Save state to PCB (if present), then terminate via Kernel
  const pcb = TSOS.Kernel.currentPcb?.();
  if (pcb) this.saveToPcb(pcb);

  this.isExecuting = false;
  _Kernel.krnProcessExit();                 // lets Scheduler print metrics & dispatch next
  TSOS.Control.refreshCpuPcbMemoryViews();
  return;                                   // stop this cycle
}


    default: {
  const hex = op.toString(16).toUpperCase().padStart(2, "0");
  _StdOut.putText(`Runtime error: invalid opcode ${hex}. Process terminated.`);
  this.isExecuting = false;

  // save state and let the kernel/scheduler clean up
  const pcb = TSOS.Kernel.currentPcb?.();
  if (pcb) this.saveToPcb(pcb);
  _Kernel.krnProcessExit();

  TSOS.Control.refreshCpuPcbMemoryViews();
  return;
}

  }

  // exactly one instruction finished => tick scheduler once
  _Scheduler.onInstructionCompleted(1);
}


}}
