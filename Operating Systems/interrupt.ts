/* ------------
   hardDrive.ts

   Backing store representation.
------------ */

module TSOS {
  // Shape of a single disk block
  export interface HardDriveBlock {
    used: number;   // 0 = free, 1 = allocated
    next: string;   // "track:sector:block" of next block OR "0:0:0" = end-of-chain / none
    data: string;   // hex string, padded with "0"
  }

  export class HardDrive {
    private readonly tracks  = 4;
    private readonly sectors = 8;
    private readonly blocks  = 8;
    private readonly blockSize = 64;  // bytes of DATA per block

    private driveMap: Map<string, HardDriveBlock> = new Map();

    /**
     * Called from kernel bootstrap.
     * Tries to restore from sessionStorage, otherwise does a fresh format.
     */
    public init(): void {
      const saved = sessionStorage.getItem("hardDriveStorage");
      if (saved) {
        try {
          const entries: [string, HardDriveBlock][] = JSON.parse(saved);
          this.driveMap = new Map(entries);
          // make sure UI is in sync
          this.refreshUi();
          return;
        } catch {
          // fall through to fresh format
        }
      }
      this.initializeHardDrive();
    }

    public getBlockSize(): number {
      return this.blockSize;
    }

    public getHardDriveMap(): Map<string, HardDriveBlock> {
      return this.driveMap;
    }

    /**
     * Fresh format: creates all TSBs and clears them.
     * MBR at 0:0:0 is marked used.
     *
     * NOTE: "0:0:0" is our "null pointer" / end-of-chain marker.
     */
    public initializeHardDrive(): void {
      this.driveMap = new Map();

      for (let t = 0; t < this.tracks; t++) {
        for (let s = 0; s < this.sectors; s++) {
          for (let b = 0; b < this.blocks; b++) {
            const key = `${t}:${s}:${b}`;
            const isMBR = (t === 0 && s === 0 && b === 0);

            this.driveMap.set(key, {
              used: isMBR ? 1 : 0,
              next: "0:0:0",                    // default: no next
              data: "".padEnd(this.blockSize, "0")
            });
          }
        }
      }

      this.persist();
    }

    /** Save current map to sessionStorage AND update UI */
    public persist(): void {
      try {
        const arr = Array.from(this.driveMap.entries());
        sessionStorage.setItem("hardDriveStorage", JSON.stringify(arr));
      } catch { /* ignore */ }

      this.refreshUi();
    }

    private refreshUi(): void {
      try {
        TSOS.Control.refreshDiskDisplay();
      } catch {
        // UI might not be ready yet during bootstrap
      }
    }
  }
}
