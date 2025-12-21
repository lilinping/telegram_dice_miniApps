 'use client';

 import React from 'react';
 import { cn } from '@/lib/utils';

 interface TrendChartProps {
   results: any[]; // array of records that contain outCome or result arrays
   maxPoints?: number;
 }

 export default function TrendChart({ results, maxPoints = 20 }: TrendChartProps) {
   const data = (results || []).slice(0, maxPoints).reverse();

   const calculateTotal = (dice: number[]) => dice.reduce((s, v) => s + (v || 0), 0);
   const analyze = (dice: number[] = []) => {
     const total = calculateTotal(dice);
     const isTriple = dice && dice.length >= 3 && dice[0] === dice[1] && dice[1] === dice[2];
     const isBig = total >= 11 && total <= 17;
     const isSmall = total >= 4 && total <= 10;
     return { total, isBig, isSmall, isTriple };
   };

   const points: string[] = [];
   const pointData: Array<any> = [];
  // global paddings for plot area (percent)
  // increased horizontal and bottom padding to avoid label overlap (conservative)
  const LEFT_PAD = 18;
  const RIGHT_PAD = 10;
  const TOP_PAD = 8;
  const BOTTOM_PAD = 28;

  data.forEach((record: any, idx: number) => {
     const dice = record.result || record.outCome || [];
     const analysis = analyze(dice);
    const rawX = (idx / (data.length - 1 || 1)) * 100;
    // padding values are declared above

    // map total (3-18) to percentage y inside padded area
    const rawY = (analysis.total - 3) / 15; // 0..1
    let y = TOP_PAD + (1 - rawY) * (100 - TOP_PAD - BOTTOM_PAD);

    // Avoid collision with Y-axis tick labels: compute tick positions inside same padded area
    const ticks = [18, 15, 12, 9, 6, 3];
    const tickYs = ticks.map(t => {
      const tRaw = (t - 3) / 15;
      return TOP_PAD + (1 - tRaw) * (100 - TOP_PAD - BOTTOM_PAD);
    });

    // iterative nudge until clear
    const COLLIDE_THRESHOLD = 6; // percent distance threshold
    const NUDGE_PERCENT = 8; // percent to move each iteration
    let iter = 0;
    while (iter < 4) {
      const closest = tickYs.reduce((acc, ty) => {
        const d = Math.abs(y - ty);
        return d < acc.dist ? { dist: d, ty } : acc;
      }, { dist: 1000, ty: 0 });
      if (closest.dist < COLLIDE_THRESHOLD) {
        // move away from the tick line
        y = y < closest.ty ? Math.max(TOP_PAD, y - NUDGE_PERCENT) : Math.min(100 - BOTTOM_PAD, y + NUDGE_PERCENT);
      } else {
        break;
      }
      iter++;
    }
    // map x into padded horizontal range
    const xScaled = LEFT_PAD + (rawX / 100) * (100 - LEFT_PAD - RIGHT_PAD);
    points.push(`${xScaled},${y}`);
     pointData.push({
      x: xScaled,
       y,
       total: analysis.total,
       isBig: analysis.isBig,
       isTriple: analysis.isTriple,
       idx
     });
   });

   return (
     <div className="relative h-64 mb-8">
      {/* Y axis marks will be rendered above plot later to avoid overlap */}

       <div className="absolute inset-0 pl-10 pr-2 pb-14">
         <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
           <polyline
             points={points.join(' ')}
             fill="none"
             stroke="#3B82F6"
             strokeWidth="1.5"
             strokeLinecap="round"
             strokeLinejoin="round"
           />
           {pointData.map((point) => (
             <circle
               key={point.idx}
               cx={point.x}
               cy={point.y}
               r="1.6"
               fill={point.isTriple ? '#9333EA' : point.isBig ? '#EF4444' : '#3B82F6'}
               stroke="#fff"
               strokeWidth="0.9"
             />
           ))}
         </svg>

         {/* labels layer */}
         <div className="absolute inset-0 overflow-visible">
           {pointData.map((point) => {
             const leftPercent = point.x;
             const topPercent = point.y;
            // If the point is very close to the top, render the label below the point to avoid clipping
            const nearTop = topPercent < 8;
            // If the point is very close to the bottom, nudge the label upward to avoid overlapping the x-axis
            const nearBottom = topPercent > 88;
            // If the point is very close to the left edge (y-axis area), shift label right to avoid overlapping y-axis numbers
            const nearLeft = leftPercent < 8;
             let labelStyle: React.CSSProperties;
            if (nearTop) {
              labelStyle = {
                left: `${leftPercent}%`,
                top: `${Math.min(100, topPercent + 10)}%`,
                transform: 'translate(-50%, 0)',
              };
            } else if (nearBottom) {
              labelStyle = {
                left: `${leftPercent}%`,
                top: `${Math.max(0, topPercent - 12)}%`,
                transform: 'translate(-50%, -100%)',
              };
            } else {
              // default place above the point
              labelStyle = {
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: 'translate(-50%, -120%)',
              };
            }
            // apply left-shift if near left edge to avoid overlapping y-axis numbers
            if (nearLeft) {
              const SHIFT_RIGHT = 12; // percent
              labelStyle.left = `${Math.min(100, leftPercent + SHIFT_RIGHT)}%`;
              // when shifted, ensure label stays above the point unless nearBottom
              if (!nearBottom && !nearTop) {
                labelStyle.transform = 'translate(-50%, -120%)';
              }
            }

             return (
               <div
                 key={point.idx}
                 className="absolute flex flex-col items-center pointer-events-none"
                 style={{
                   ...labelStyle,
                 }}
               >
                <span className={cn('text-xs font-semibold mb-0.5', point.isBig ? 'text-error' : 'text-info')}>
                  {point.isBig ? '大' : '小'}
                </span>
                <span className="text-xs font-bold text-white drop-shadow-md px-1 bg-black/60 rounded">
                  {point.total}
                </span>
               </div>
             );
           })}
         </div>

        {/* x axis - render ticks positioned using same x scaling as points */}
        <div className="absolute left-0 right-0" style={{ bottom: '-14px', pointerEvents: 'auto' }}>
          <div
            style={{
              paddingLeft: `${LEFT_PAD}%`,
              paddingRight: `${RIGHT_PAD}%`,
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div style={{ display: 'inline-flex', gap: '8px', paddingBottom: '4px' }}>
              {pointData.map((point) => (
                <span
                  key={point.idx}
                  className="text-[11px] text-text-disabled"
                  style={{
                    minWidth: 28,
                    textAlign: 'center',
                    display: 'inline-block',
                  }}
                >
                  {maxPoints - point.idx}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 text-center text-xs text-text-disabled" style={{ bottom: '-56px', zIndex: 10 }}>
          <span className="inline-block bg-bg-dark px-2 rounded text-text-disabled">
            横坐标：局数（数字表示距当前最近的局数）
          </span>
        </div>
        {/* Y axis marks (rendered after plot so they sit above points) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[18, 15, 12, 9, 6, 3].map((value) => (
            <div key={value} className="flex items-center">
              <span className="text-xs text-text-disabled w-6">{value}</span>
              <div className="flex-1 h-px bg-border ml-2" />
            </div>
          ))}
        </div>
       </div>
     </div>
   );
 }


