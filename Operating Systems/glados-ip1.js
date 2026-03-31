module TSOS {
  export type PcbState = "Ready" | "Running" | "Resident" | "Terminated";
  export type PcbLocation = "Memory" | "Disk";

    export class PCB {
    constructor(public pid: number) {}

    // CPU registers
    public pc = 0;
    public ir = "00";
    public acc = 0;
    public x = 0;
    public y = 0;
    public z = 0;

    // Mem Partition
    public base = 0x000;
    public limit = 0x0FF;
    public segment = -1; //0,1,2

    //scheduling
    public state: PcbState = "Ready";
    public priority = 0; // (future use)
    public quantumRemaining = 0;    
    
    // --- metrics (cpu cycles) ---
    public cyclesTotal: number = 0;      // time spent running on CPU
    public cyclesWaiting: number = 0;    // time spent in Ready queue
    public createdAt: number = _OSclock; // optional wall clock stamp
    public finishedAt: number | null = null; // when finished (optional)

    // --- project 4: swapping metadata ---
    public location: "Memory" | "Disk" = "Memory";
    public swapFilename: string | null = null;
  }
}