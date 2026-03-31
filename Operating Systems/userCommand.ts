/* ------------
   Interrupt.ts
   ------------ */

module TSOS {
    export class Interrupt {
        constructor(public irq: number, public params: any[]) {
        }
        public static readonly CONTEXT_SWITCH_IRQ = 0x99; // pick an unused number        
        
    }
      export const CONTEXT_SWITCH_IRQ: number = 99; // pick any unused number
}
