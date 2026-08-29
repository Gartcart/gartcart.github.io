import Seismograph from "./Seismograph.js";
import { plot, formatCTime } from "./ascii-chart.js";

new Seismograph("drum");

const CONFIG = {
    csvUrl: "traffic/views.csv",
    metric: "total_views",
    label: "Views",
    height: 15,
    typeOnLoad: true,
};

function daysThatFit() {
    const w = window.innerWidth;
    if (w < 560) return 30;
    if (w < 900) return 60;
    return 90;
}

function parseCsv(text, metric) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0].split(",");
    const dateAt = header.indexOf("date");
    const valueAt = header.indexOf(metric);
    if (dateAt === -1 || valueAt === -1) {
        throw new Error(`CSV has no "${metric}" column`);
    }
    return lines.slice(1).map((line) => {
        const cells = line.split(",");
        return { date: cells[dateAt], value: Number(cells[valueAt]) || 0 };
    });
}

function buildFile(rows, { label, height }) {
    const values = rows.map((r) => r.value);
    const from = rows[0].date;
    const to = rows[rows.length - 1].date;
    const stamp = formatCTime(new Date(`${to}T23:55:00Z`));

    return [
        "",
        `        Total ${label} per Day from ${from} to ${to}`,
        "",
        "        Repository Views",
        plot(values, { height }),
        "",
        `        Data collected through - ${stamp} UTC`,
        "        ",
    ].join("\n");
}

let cachedRows = null;
let renderToken = 0;

async function render() {
    const output = document.getElementById("traffic-output");
    const status = document.getElementById("traffic-status");
    if (!output) return;

    const token = ++renderToken;
    const setStatus = (msg) => { if (status) status.textContent = msg; };

    try {
        if (!cachedRows) {
            const res = await fetch(CONFIG.csvUrl, { cache: "no-cache" });
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            cachedRows = parseCsv(await res.text(), CONFIG.metric);
        }
        if (token !== renderToken) return;

        const all = cachedRows;
        if (!all.length) throw new Error("no rows in CSV");

        const rows = all.slice(-daysThatFit());
        const file = buildFile(rows, CONFIG);

        const total = rows.reduce((sum, r) => sum + r.value, 0);
        const peak = rows.reduce((best, r) => (r.value > best.value ? r : best));

        setStatus(
            `${total.toLocaleString()} ${CONFIG.label.toLowerCase()} across ` +
            `${rows.length} days, peaking at ${peak.value.toLocaleString()} on ${peak.date}.`
        );

        reveal(output, file, token);
    } catch (error) {
        if (token !== renderToken) return;
        output.textContent =
        "        Could not load traffic data.\n\n" +
        setStatus("Traffic data unavailable.");
    }
}

function reveal(output, text, token) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!CONFIG.typeOnLoad || reduced) {
        output.textContent = text;
        return;
    }

    const lines = text.split("\n");
    let i = 0;
    output.textContent = "";

    const step = () => {
        if (token !== renderToken) return;
        output.textContent = lines.slice(0, ++i).join("\n");
        if (i < lines.length) setTimeout(step, 28);
    };
        step();
}

let currentDays = daysThatFit();
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (daysThatFit() !== currentDays) {
            currentDays = daysThatFit();
            CONFIG.typeOnLoad = false;
            render();
        }
    }, 200);
});

render();
