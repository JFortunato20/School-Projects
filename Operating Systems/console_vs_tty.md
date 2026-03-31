/* ------------
   Swapper.ts

   Handles rolling processes out to disk and back into memory.
------------ */

module TSOS {

  export class Swapper {
    // Swap files will look like: proc-<pid>.swp
    private static readonly SWAP_PREFIX = "proc-";
    private static readonly SWAP_SUFFIX = ".swp";

    private static filenameForPid(pid: number): string {
      return `${this.SWAP_PREFIX}${pid}${this.SWAP_SUFFIX}`;
    }

    // --- Small helper: hex string -> byte array (0–255) ---
    private static hexToBytes(hex: string): number[] {
      if (!hex) return [];
      const clean = hex.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
      const out: number[] = [];

      for (let i = 0; i < clean.length; i += 2) {
        const chunk = clean.substr(i, 2);
        if (chunk.length < 2) break;
        const v = parseInt(chunk, 16);
        if (!Number.isFinite(v)) break;
        out.push(v & 0xFF);
      }
      return out;
    }

    // ========= Roll OUT: Memory -> Disk =========
    public static rollOut(pcb: PCB): boolean {
      if (!_DiskDriver || typeof (_DiskDriver as any).createFile !== "function") {
        _Kernel.krnTrace("Swapper: disk driver not available for rollOut.");
        return false;
      }

      // If it is already on disk, nothing to do.
if (pcb.location === "Disk" || pcb.segment < 0) {
  _Kernel.krnTrace(`Swapper: PID=${pcb.pid} already on disk.`);
  return true;
}


      const fname = this.filenameForPid(pcb.pid);

      // 1) Pull 256 bytes from this process's segment
      const bytes: number[] = [];
      for (let addr = pcb.base; addr <= pcb.limit; addr++) {
        // Note: your Memory class exposes write(), so we assume read() exists too.
        const v = (_Memory as any).read
          ? (_Memory as any).read(addr)
          : _MemoryAccessor.read(addr);
        bytes.push(v & 0xFF);
      }

      // 2) Ensure a fresh file
      try { (_DiskDriver as any).deleteFile?.(fname); } catch { /* ignore */ }

      if (!_DiskDriver.createFile(fname)) {
        _Kernel.krnTrace(`Swapper: failed to create swap file ${fname} for PID=${pcb.pid}.`);
        return false;
      }

      // 3) Write raw bytes to disk
      const ok = (_DiskDriver as any).writeRawDataToFile(fname, bytes);
      if (!ok) {
        _Kernel.krnTrace(`Swapper: writeRawDataToFile failed for ${fname}.`);
        return false;
      }

      // 4) Free the memory segment
      try {
        _MemoryManager.freeByPid(pcb.pid);
      } catch (e) {
        _Kernel.krnTrace(`Swapper: freeByPid error for PID=${pcb.pid}: ${e}`);
      }

      // 5) Update PCB to reflect disk residency
pcb.location     = "Disk";
pcb.swapFilename = fname;
pcb.segment      = -1;
pcb.base         = 0;
pcb.limit        = 0;


      _Kernel.krnTrace(`Swapper: rolled OUT PID=${pcb.pid} to ${fname}.`);
      return true;
    }

    // ========= Roll IN: Disk -> Memory =========
  // ========= Roll IN: Disk -> Memory =========
public static rollIn(pcb: PCB, targetSeg?: number): boolean {
  const fname = this.filenameForPid(pcb.pid);
  _Kernel.krnTrace(`Swapper.rollIn: start PID=${pcb.pid}, loc=${pcb.location}, file=${fname}`);

  if (!_DiskDriver || typeof (_DiskDriver as any).readFile !== "function") return false;
  if (pcb.location !== "Disk") return true;

  // --- Determine where to load ---
  let alloc: { base: number; limit: number; segment: number } | null = null;
  const SEGMENT_SIZE = 256; // <-- Adjust if your OS uses a different segment size

  if (targetSeg !== undefined && targetSeg >= 0) {
    // We already have the segment reserved; compute base/limit manually
    const base = targetSeg * SEGMENT_SIZE;
    const limit = base + SEGMENT_SIZE - 1;
    alloc = { base, limit, segment: targetSeg };
  } else {
    alloc = _MemoryManager.allocateSegmentFor(pcb.pid);
    if (!alloc) {
      _Kernel.krnTrace(`Swapper.rollIn: allocate FAILED for PID=${pcb.pid}`);
      return false;
    }
  }

  // --- Read swap file ---
  const hex: string = (_DiskDriver as any).readFile(fname);
  if (!hex) {
    _Kernel.krnTrace(`Swapper.rollIn: ${fname} missing/empty`);
    return false;
  }

  const bytes = this.hexToBytes(hex);

  // --- Load bytes into memory ---
  let addr = alloc.base;
  let i = 0;
  while (addr <= alloc.limit && i < bytes.length) {
    (_Memory as any).write
      ? (_Memory as any).write(addr, bytes[i] & 0xff)
      : _MemoryAccessor.write(addr, bytes[i] & 0xff);
    addr++;
    i++;
  }

  // Fill the rest of the segment with zeros
  while (addr <= alloc.limit) {
    (_Memory as any).write
      ? (_Memory as any).write(addr, 0x00)
      : _MemoryAccessor.write(addr, 0x00);
    addr++;
  }

  // --- Update PCB ---
  pcb.base = alloc.base;
  pcb.limit = alloc.limit;
  pcb.segment = alloc.segment;
  pcb.location = "Memory";
  pcb.swapFilename = null;

  // --- Delete swap file if present ---
  try { (_DiskDriver as any).deleteFile?.(fname); } catch {}

  _Kernel.krnTrace(
    `Swapper.rollIn: SUCCESS PID=${pcb.pid} seg=${pcb.segment} base=${pcb.base} limit=${pcb.limit}`
  );
  return true;

    }
  }
}
