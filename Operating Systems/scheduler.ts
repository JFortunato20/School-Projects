/* ------------
   Console.ts

   The OS Console - stdIn and stdOut by default.
   Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
   ------------ */

module TSOS {

    // --- iProject1: command history helper ---
    const _CommandHistory = (() => {
        const list: string[] = [];
        let idx = -1; // one past end
        return {
            push(cmd: string) { if (cmd.trim()) { list.push(cmd); idx = list.length; } },
            move(delta: number): string | null {
                if (!list.length) return null;
                idx = Math.min(list.length, Math.max(0, idx + delta));
                if (idx === list.length) return "";  // blank beyond last
                return list[idx];
            }
        };
    })();

    export class Console {

        constructor(
            public currentFont = _DefaultFontFamily,
            public currentFontSize = _DefaultFontSize,
            public currentXPosition = 0,
            public currentYPosition = ((window as any)._TaskbarH || 22) + _DefaultFontSize,
            public buffer = ""
        ) { }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            const tb = (window as any)._TaskbarH || 22;
            _DrawingContext.clearRect(0, tb, _Canvas.width, _Canvas.height - tb);
        }

        public resetXY(): void {
            const tb = (window as any)._TaskbarH || 22;
            this.currentXPosition = 0;
            this.currentYPosition = tb + this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                const chr = _KernelInputQueue.dequeue();

               if (chr === "\r") { // Enter
  const line = this.buffer;   // capture
  this.buffer = "";           // clear so Enter again won't reuse it
  _CommandHistory.push(line);

  const trimmed = line.trim();
  if (trimmed.length === 0) {
    this.advanceLine();       // ← use 'this' (you're inside the Console)
    _OsShell.putPrompt();
    continue;
  }

  _OsShell.handleInput(trimmed);


                } else if (chr === "\b") { // Backspace
                    if (this.buffer.length > 0) {
                        const last = this.buffer[this.buffer.length - 1];
                        const w = _DrawingContext.measureText(this.currentFont, this.currentFontSize, last);
                        this.currentXPosition -= w;
                        _DrawingContext.clearRect(
                            this.currentXPosition,
                            this.currentYPosition - this.currentFontSize,
                            w,
                            this.currentFontSize + _FontHeightMargin
                        );
                        this.buffer = this.buffer.slice(0, -1);
                    }

                } else if (chr === "\t") { // Tab completion
                    const partial = this.buffer.trim();
                    const matches = _OsShell.commandList
                        .map(c => c.command)
                        .filter(cmd => cmd.startsWith(partial));

                    if (matches.length === 1) {
                        const rest = matches[0].slice(partial.length);
                        this.putText(rest);
                        this.buffer += rest;
                    } else if (matches.length > 1) {
                        this.advanceLine();
                        _StdOut.putText(matches.join("  "));
                        this.advanceLine();
                        _StdOut.putText(_OsShell.promptStr + this.buffer);
                    }

                } else if (chr === "\u2191" || chr === "\u2193") { // Up/Down history
                    const dir = (chr === "\u2191") ? -1 : 1;
                    const next = _CommandHistory.move(dir);
                    if (next !== null) {
                        // Clear current buffer visually
                        while (this.buffer.length > 0) {
                            const last = this.buffer[this.buffer.length - 1];
                            const w = _DrawingContext.measureText(this.currentFont, this.currentFontSize, last);
                            this.currentXPosition -= w;
                            _DrawingContext.clearRect(
                                this.currentXPosition,
                                this.currentYPosition - this.currentFontSize,
                                w,
                                this.currentFontSize + _FontHeightMargin
                            );
                            this.buffer = this.buffer.slice(0, -1);
                        }
                        // Write recalled command
                        this.putText(next);
                        this.buffer = next;
                    }

                } else {
                    this.putText(chr);
                    this.buffer += chr;
                }
            }
        }

        public putText(text: string): void {
            if (text !== "") {
                const w = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + w > _Canvas.width) {
                    this.advanceLine();
                }
                _DrawingContext.drawText(
                    this.currentFont, this.currentFontSize,
                    this.currentXPosition, this.currentYPosition, text
                );
                this.currentXPosition += w;
            }
        }

       public advanceLine(): void {
  this.currentXPosition = 0;
  this.currentYPosition += _DefaultFontSize
    + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
    + _FontHeightMargin;

  const taskbarH = (window as any)._TaskbarH || 22;
  const lineH = _DefaultFontSize
    + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
    + _FontHeightMargin;

  // if we're beyond the drawable area, scroll the text region up
  if (this.currentYPosition > _Canvas.height - _DefaultFontSize) {
    const img = _DrawingContext.getImageData(
      0, taskbarH + lineH,
      _Canvas.width, _Canvas.height - taskbarH - lineH
    );
    _DrawingContext.putImageData(img, 0, taskbarH);
    _DrawingContext.clearRect(0, _Canvas.height - lineH, _Canvas.width, lineH);
    this.currentYPosition -= lineH;
  }
}

    }
}
