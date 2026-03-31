module TSOS {
  export class Memory {
    private bytes!: Uint8Array;

    public init(size = 0x300): void {        // 768 bytes (three segments) for P3
      this.bytes = new Uint8Array(size);
      this.bytes.fill(0x00);
    }

    public read(addr: number): number {
      if (addr < 0 || addr >= this.bytes.length) throw new Error("Memory OOB");
      return this.bytes[addr];
    }
    public write(addr: number, value: number): void {
      if (addr < 0 || addr >= this.bytes.length) throw new Error("Memory OOB");
      this.bytes[addr] = value & 0xFF;
    }
    public dump(): Uint8Array {
      return this.bytes;             // snapshot for UI
    }

    public clear(base = 0x0000, limit = 0x00FF): void {
  // Fill [base, limit] (inclusive) with 0x00
  const end = Math.min(this.dump().length - 1, limit);
  for (let a = base; a <= end; a++) {
    this.write(a, 0x00);
  }
}

  }
}


