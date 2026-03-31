/* ==== memoryAccessor.ts ==== */
module TSOS {
  export class MemoryAccessor {
    private translate(logical: number): number {
      const pcb = _Scheduler.getCurrentPcb();
      if (!pcb) _Kernel.krnTrapError("No current process for memory access");
      const phys = pcb.base + (logical & 0xFF);
      if (phys < pcb.base || phys > pcb.limit) {
        _Kernel.krnTrapError(`Memory access violation at logical ${logical.toString(16)} (phys ${phys.toString(16)})`);
      }
      return phys;
    }
    public read(logical: number): number { return _Memory.read(this.translate(logical)); }
    public write(logical: number, value: number): void { _Memory.write(this.translate(logical), value & 0xFF); }
  }
}
var _MemoryAccessor: TSOS.MemoryAccessor = new TSOS.MemoryAccessor();
