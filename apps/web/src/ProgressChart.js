import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { colors } from "@radio-lingo/ui";
export function ProgressChart({ data }) {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!containerRef.current || data.length === 0)
            return;
        const container = containerRef.current;
        container.innerHTML = "";
        for (const pool of data) {
            const section = document.createElement("div");
            section.style.marginBottom = "32px";
            container.appendChild(section);
            // Pool header
            const header = document.createElement("h3");
            header.textContent = pool.label;
            header.style.cssText = `
        font-size: 14px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 1px; color: ${colors.textPrimary}; margin: 0 0 12px 0;
        font-family: system-ui, sans-serif;
      `;
            section.appendChild(header);
            // Summary donut + bar chart — side by side on wide, stacked on narrow
            const row = document.createElement("div");
            row.className = "pool-row";
            row.style.cssText = "display: flex; gap: 24px; align-items: flex-start;";
            section.appendChild(row);
            // Donut chart
            const donutDiv = document.createElement("div");
            donutDiv.style.flexShrink = "0";
            row.appendChild(donutDiv);
            renderDonut(donutDiv, pool);
            // Bar chart
            const barDiv = document.createElement("div");
            barDiv.style.flex = "1";
            barDiv.style.minWidth = "200px";
            row.appendChild(barDiv);
            // Defer to allow layout to settle so clientWidth is available
            requestAnimationFrame(() => renderBars(barDiv, pool));
        }
    }, [data]);
    return _jsx("div", { ref: containerRef });
}
function renderDonut(container, pool) {
    const totalQuestions = pool.subelements.reduce((a, s) => a + s.poolTotal, 0);
    const totalCorrect = pool.subelements.reduce((a, s) => a + s.correct, 0);
    const totalSeen = pool.subelements.reduce((a, s) => a + s.seen, 0);
    const totalUnseen = totalQuestions - totalSeen;
    const size = 120;
    const radius = size / 2;
    const innerRadius = radius * 0.6;
    const svg = d3
        .select(container)
        .append("svg")
        .attr("width", size)
        .attr("height", size)
        .append("g")
        .attr("transform", `translate(${radius},${radius})`);
    const pie = d3
        .pie()
        .sort(null)
        .value((d) => d);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);
    const sliceData = [totalCorrect, totalSeen - totalCorrect, totalUnseen];
    const sliceColors = [colors.primary, colors.peach, colors.grayBorder];
    svg
        .selectAll("path")
        .data(pie(sliceData))
        .join("path")
        .attr("d", arc)
        .attr("fill", (_, i) => sliceColors[i])
        .attr("stroke", colors.white)
        .attr("stroke-width", 2);
    // Center text
    const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.1em")
        .style("font-size", "20px")
        .style("font-weight", "800")
        .style("font-family", "system-ui, sans-serif")
        .style("fill", colors.textPrimary)
        .text(`${pct}%`);
    svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .style("font-size", "10px")
        .style("font-family", "system-ui, sans-serif")
        .style("fill", colors.grayText)
        .text("correct");
}
function renderBars(container, pool) {
    const containerWidth = container.clientWidth || 300;
    const margin = { top: 0, right: 40, bottom: 0, left: containerWidth < 300 ? 40 : 80 };
    const barHeight = 18;
    const barGap = 6;
    const height = pool.subelements.length * (barHeight + barGap) - barGap;
    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height;
    const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    const maxTotal = d3.max(pool.subelements, (s) => s.poolTotal) ?? 1;
    const x = d3.scaleLinear().domain([0, maxTotal]).range([0, innerWidth]);
    const y = d3
        .scaleBand()
        .domain(pool.subelements.map((s) => s.subelement))
        .range([0, innerHeight])
        .padding(barGap / (barHeight + barGap));
    // Background bars (total)
    svg
        .selectAll(".bar-bg")
        .data(pool.subelements)
        .join("rect")
        .attr("class", "bar-bg")
        .attr("x", 0)
        .attr("y", (s) => y(s.subelement))
        .attr("width", (s) => x(s.poolTotal))
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", colors.grayBg)
        .attr("stroke", colors.grayBorder)
        .attr("stroke-width", 1);
    // Seen bars (peach)
    svg
        .selectAll(".bar-seen")
        .data(pool.subelements)
        .join("rect")
        .attr("class", "bar-seen")
        .attr("x", 0)
        .attr("y", (s) => y(s.subelement))
        .attr("width", (s) => x(s.seen))
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", colors.peach);
    // Correct bars (coral)
    svg
        .selectAll(".bar-correct")
        .data(pool.subelements)
        .join("rect")
        .attr("class", "bar-correct")
        .attr("x", 0)
        .attr("y", (s) => y(s.subelement))
        .attr("width", (s) => x(s.correct))
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", colors.primary);
    // Labels (subelement ID + title)
    svg
        .selectAll(".label")
        .data(pool.subelements)
        .join("text")
        .attr("class", "label")
        .attr("x", -8)
        .attr("y", (s) => y(s.subelement) + y.bandwidth() / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "central")
        .style("font-size", "12px")
        .style("font-weight", "700")
        .style("font-family", "system-ui, sans-serif")
        .style("fill", colors.textPrimary)
        .text((s) => s.subelement);
    // Count labels on right
    svg
        .selectAll(".count")
        .data(pool.subelements)
        .join("text")
        .attr("class", "count")
        .attr("x", (s) => x(s.poolTotal) + 6)
        .attr("y", (s) => y(s.subelement) + y.bandwidth() / 2)
        .attr("dominant-baseline", "central")
        .style("font-size", "11px")
        .style("font-weight", "700")
        .style("font-family", "system-ui, sans-serif")
        .style("fill", colors.grayText)
        .text((s) => (s.seen > 0 ? `${s.seen}/${s.poolTotal}` : ""));
}
