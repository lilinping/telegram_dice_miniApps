 'use client';

 import React from 'react';
 import dynamic from 'next/dynamic';

 interface TrendChartEChartsProps {
   results: any[];
   maxPoints?: number;
 }

 // Dynamically import echarts-for-react on client only to avoid SSR/bundler resolution errors.
 const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false }) as any;

 export default function TrendChartECharts({ results, maxPoints = 20 }: TrendChartEChartsProps) {
   const data = (results || []).slice(0, maxPoints).reverse();

   const labels = data.map((r: any, i: number) => String(maxPoints - i));
   const totals = data.map((r: any) => {
     const dice = r.result || r.outCome || [];
     return dice.reduce((s: number, v: number) => s + (v || 0), 0);
   });

   const option = {
     grid: {
       left: '18%',
       right: '10%',
       top: '8%',
       bottom: '28%'
     },
     xAxis: {
       type: 'category',
       data: labels,
       axisLabel: {
         interval: 0,
         rotate: 0,
         color: '#9CA3AF',
         fontSize: 11
       },
       axisLine: { lineStyle: { color: '#2D2D2D' } },
       axisTick: { alignWithLabel: true }
     },
     yAxis: {
       type: 'value',
       min: 3,
       max: 18,
       interval: 3,
       axisLabel: { color: '#9CA3AF', formatter: '{value}' },
       axisLine: { show: false },
       splitLine: { lineStyle: { color: '#2D2D2D' } }
     },
     tooltip: {
       trigger: 'axis'
     },
     dataZoom: [
       {
         type: 'slider',
         start: 0,
         end: 100,
         bottom: 4,
         height: 8
       },
       {
         type: 'inside'
       }
     ],
     series: [
       {
         type: 'line',
        data: totals.map((val: number, idx: number) => {
          const dice = data[idx].result || data[idx].outCome || [];
          const total = val;
          const isTriple = dice && dice.length >= 3 && dice[0] === dice[1] && dice[1] === dice[2];
          const isBig = total >= 11 && total <= 17 && !isTriple;
          const name = isTriple ? '豹' : isBig ? '大' : '小';
          return {
            value: total,
            name,
            __isBig: isBig
          };
        }),
         symbol: 'circle',
         symbolSize: 10,
         lineStyle: { width: 4, color: '#3B82F6' },
         itemStyle: {
           borderColor: '#fff',
           borderWidth: 1
         },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            // params.data contains value and name and __isBig
            const name = params.data?.name || '';
            const value = params.value;
            // use rich to style name and value
            return `${params.data?.__isBig ? '{big|' + name + '}' : '{small|' + name + '}'}\n{num|${value}}`;
          },
          rich: {
            big: { color: '#EF4444', fontSize: 12, align: 'center' },
            small: { color: '#3B82F6', fontSize: 12, align: 'center' },
            num: { color: '#fff', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.6)', padding: [2, 6], borderRadius: 4, align: 'center' }
          }
        }
       }
     ]
   };

   return (
     <div>
       {/* ReactECharts dynamically loaded on client */}
       <ReactECharts option={option} style={{ height: 280, width: '100%' }} />
     </div>
   );
 }


