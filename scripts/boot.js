class TerminalBoot {
    constructor() {
        this.script = [
            { cmd: "sudo systemctl mask seismograph.service" },
            { out: "Terminating whimsical oscillation protocols ... [  OK  ]" },
            { out: "Purging 14.2 TB of unmonetized creative flair ... [  OK  ]" },
            { cmd: "./configure --enable-corporate-stoicism --disable-whimsy" },
            { out: "checking for whimsy... ERROR 418" },
            { out: "checking whether whimsy can be suppressed... ERROR 418" },
            { out: "checking for a serif that inspires confidence... Times New Roman" },
            { cmd: "make serious" },
            { out: "cc -O2 -Wall -Wno-fun formal.c -o resume" },
            { out: "ERROR: self.pat_on_back_for_jokes not found" },
            { out: "warning: 'passionate self-starter' deprecated since 2009" },
            { out: "warning: expected 'collaboration'" },
            { cmd: "export TONE=formal MARGINS=1in ADJECTIVES=load-bearing" },
            { cmd: "./resume --render --no-color" },
            { out: "rendering .... . . done" },
            { cmd: "sleep 3 # Pausing for an unnecessary amount of time..." },
            { wait: 3000 },
            { out: "ERROR: 418 -- I'M A LITTLE TEAPOT" },
            { wait: 2000 }
        ];

        this.config = {
            typeMs: 45,
            lineMs: 90,
            cmdPauseMs: 300,
            storageKey: "resume:booted"
        };

        this.elements = {
            terminal: document.getElementById("terminal"),
            skipBtn: document.getElementById("skip-btn"),
            body: document.body
        };

        this.state = {
            isFinished: false,
            abortController: new AbortController()
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.evaluateInitialState();
    }

    bindEvents() {
        const { signal } = this.state.abortController;

        if (this.elements.skipBtn) {
            this.elements.skipBtn.addEventListener("click", () => this.reveal(), { signal });
        } else {
            console.warn("TerminalBoot: skip button not found. Ensure HTML has <button id='skip-btn'>");
        }

        window.addEventListener("keydown", (e) => {
            if (["Escape", "Enter", " "].includes(e.key)) {
                e.preventDefault();
                this.reveal();
            }
        }, { signal });
    }

    evaluateInitialState() {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let hasSeen = false;
        try {
            hasSeen = sessionStorage.getItem(this.config.storageKey) === "1";
        } catch (e) {
        }

        if (hasSeen) {
            this.reveal();
        } else if (prefersReducedMotion) {
            this.renderInstantly();
        } else {
            this.runSequence();
        }
    }

    renderInstantly() {
        for (const step of this.script) {
            if (step.cmd || step.out) {
                this.printLine(step.cmd ?? step.out, step.cmd ? "cmd" : "out");
            }
        }
        this.reveal();
    }

    printLine(text, className) {
        const line = document.createElement("div");
        line.className = className;
        line.textContent = text;
        this.elements.terminal.append(line);
        this.elements.terminal.scrollTop = this.elements.terminal.scrollHeight;
        return line;
    }

    async typeText(text) {
        const line = this.printLine("", "cmd");

        for (const char of text) {
            if (this.state.isFinished) {
                line.textContent = text;
                return;
            }
            line.textContent += char;
            await this.wait(this.config.typeMs);
        }
    }

    async runSequence() {
        for (const step of this.script) {
            if (this.state.isFinished) break;

            if (step.wait) {
                await this.wait(step.wait);
            } else if (step.cmd) {
                await this.typeText(step.cmd);
                await this.wait(this.config.cmdPauseMs);
            } else if (step.out) {
                this.printLine(step.out, "out");
                await this.wait(this.config.lineMs);
            }
        }

        if (!this.state.isFinished) {
            await this.wait(600);
            this.reveal();
        }
    }

    reveal() {
        if (this.state.isFinished) return;

        this.state.isFinished = true;
        this.state.abortController.abort();
        this.elements.body.classList.add("is-rendered");

        try {
            sessionStorage.setItem(this.config.storageKey, "1");
        } catch (e) {
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

try {
    new TerminalBoot();
} catch (err) {
    console.error("TerminalBoot failed:", err);
    document.body.classList.add("is-rendered");
}
