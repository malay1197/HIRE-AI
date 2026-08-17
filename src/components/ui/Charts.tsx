'use client';

import React, { useState } from 'react';

// ==========================================
// 1. LINE CHART (Applications Over Time)
// ==========================================
interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

export function LineChart({ data, height = 200 }: LineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const padding = 40;
  const chartHeight = height - padding * 2;
  const width = 500;
  const chartWidth = width - padding * 2;

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const minVal = 0;

  const points = data.map((d, idx) => {
    const x = padding + (idx / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
    : '';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding + chartHeight * p;
          const val = Math.round(maxVal - (maxVal - minVal) * p);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-glass)" strokeDasharray="4" />
              <text x={padding - 10} y={y + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{val}</text>
            </g>
          );
        })}

        {/* Filled Area */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* Main Line */}
        {pathD && <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />}

        {/* Data points & Interaction */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 6 : 4}
              fill={hoveredIdx === idx ? 'white' : 'var(--primary)'}
              stroke="var(--bg-secondary)"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            />
            {/* X Labels */}
            <text x={p.x} y={height - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* HTML Custom Tooltip */}
      {hoveredIdx !== null && (
        <div className="chart-tooltip" style={{
          left: `${(points[hoveredIdx].x / width) * 100}%`,
          top: `${(points[hoveredIdx].y / height) * 100 - 15}%`
        }}>
          <strong>{points[hoveredIdx].label}</strong>: {points[hoveredIdx].value} apps
        </div>
      )}

      <style jsx>{`
        .svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .chart-tooltip {
          position: absolute;
          background: rgba(15, 14, 30, 0.95);
          border: 1px solid var(--primary);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          pointer-events: none;
          transform: translate(-50%, -100%);
          white-space: nowrap;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }
      `}</style>
    </div>
  );
}

// ==========================================
// 2. FUNNEL CHART (Candidate Funnel)
// ==========================================
interface FunnelChartProps {
  data: { stage: string; count: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="funnel-container">
      {data.map((item, idx) => {
        const percent = Math.round((item.count / maxVal) * 100);
        // Calculate standard conversion relative to previous stage
        const prevCount = idx > 0 ? data[idx - 1].count : 0;
        const convRate = idx > 0 && prevCount > 0 ? Math.round((item.count / prevCount) * 100) : null;

        return (
          <div key={idx} className="funnel-row">
            <div className="funnel-label">
              <span>{item.stage}</span>
              <small>{item.count} Candidates</small>
            </div>
            <div className="funnel-bar-wrapper">
              <div 
                className="funnel-bar" 
                style={{ 
                  width: `${percent}%`, 
                  background: `linear-gradient(90deg, var(--primary) 0%, rgba(99, 102, 241, 0.5) 100%)` 
                }}
              >
                {percent > 20 && <span className="funnel-bar-pct">{percent}%</span>}
              </div>
            </div>
            {convRate !== null && (
              <div className="funnel-conversion">
                <small>↓ {convRate}% conv.</small>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .funnel-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
        .funnel-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .funnel-label {
          width: 120px;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .funnel-label span {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }
        .funnel-label small {
          font-size: 11px;
          color: var(--text-muted);
        }
        .funnel-bar-wrapper {
          flex: 1;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          height: 28px;
          overflow: hidden;
        }
        .funnel-bar {
          height: 100%;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          transition: width 0.8s ease-out;
        }
        .funnel-bar-pct {
          font-size: 10px;
          font-weight: 700;
          color: white;
        }
        .funnel-conversion {
          width: 80px;
          color: var(--success);
          font-weight: 600;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

// ==========================================
// 3. BAR CHART (AI Score Distribution)
// ==========================================
interface BarChartProps {
  data: { label: string; count: number }[];
}

export function BarChart({ data }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bar-chart-container">
      {data.map((item, idx) => {
        const heightPct = (item.count / maxVal) * 100;
        return (
          <div key={idx} className="bar-column">
            <div className="bar-count">{item.count}</div>
            <div className="bar-wrapper">
              <div 
                className="bar-fill" 
                style={{ 
                  height: `${heightPct}%`,
                  background: 'var(--primary)'
                }}
              />
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        );
      })}

      <style jsx>{`
        .bar-chart-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 200px;
          padding: 20px 0;
          border-bottom: 1px solid var(--border-glass);
        }
        .bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 60px;
          height: 100%;
        }
        .bar-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .bar-wrapper {
          width: 24px;
          height: 120px;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .bar-fill {
          width: 100%;
          border-radius: var(--radius-sm);
          transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bar-label {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 8px;
          text-align: center;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

// ==========================================
// 4. DONUT CHART (Jobs by Department)
// ==========================================
interface DonutChartProps {
  data: { label: string; value: number }[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--error)'];

  let currentAngle = 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map((item, idx) => {
    const fraction = item.value / (total || 1);
    const dashArray = `${fraction * circumference} ${circumference}`;
    const offset = circumference - currentAngle;
    currentAngle += fraction * circumference;

    return {
      label: item.label,
      value: item.value,
      percentage: Math.round(fraction * 100),
      dashArray,
      offset,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="donut-container">
      <svg viewBox="0 0 160 160" className="donut-svg">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="var(--bg-glass)"
          strokeWidth="15"
        />
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth="15"
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.offset}
            transform="rotate(-90 80 80)"
            className="donut-segment"
          />
        ))}
        {/* Center count info */}
        <text x="80" y="78" fill="var(--text-main)" fontSize="18" fontWeight="800" textAnchor="middle">
          {total}
        </text>
        <text x="80" y="93" fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Total Jobs
        </text>
      </svg>

      <div className="donut-legend">
        {segments.map((seg, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-indicator" style={{ background: seg.color }} />
            <span className="legend-label">{seg.label}</span>
            <span className="legend-value">{seg.value} ({seg.percentage}%)</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .donut-container {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .donut-svg {
          width: 120px;
          height: 120px;
        }
        .donut-segment {
          transition: stroke-dashoffset 0.6s ease;
        }
        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .legend-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-label {
          color: var(--text-secondary);
          flex: 1;
        }
        .legend-value {
          color: var(--text-main);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
