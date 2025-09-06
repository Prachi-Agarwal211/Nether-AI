'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export function DataChart({ title, chartData, animated }) {
  const [themedChartData, setThemedChartData] = useState(null);

  useEffect(() => {
    if (chartData && chartData.labels && chartData.datasets) {
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--color-primary-accent').trim();
      const secondaryColor = computedStyle.getPropertyValue('--color-secondary-accent').trim();

      const dataWithResolvedColors = {
        ...chartData,
        datasets: chartData.datasets?.map(ds => ({
          ...ds,
          backgroundColor: ds.backgroundColor || [primaryColor, secondaryColor],
          borderColor: ds.borderColor || secondaryColor,
        })) || [],
      };
      setThemedChartData(dataWithResolvedColors);
    } else {
      setThemedChartData({
        labels: ['No Data'],
        datasets: [{
          label: 'No data available for this chart.',
          data: [1],
          backgroundColor: ['var(--color-text-secondary)'],
        }],
      });
    }
  }, [chartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'var(--color-text-secondary)' } },
      title: { display: false },
    },
    scales: {
      x: { 
        ticks: { color: 'var(--color-text-secondary)' }, 
        grid: { color: 'rgba(var(--color-text-secondary-rgb), 0.1)' } 
      },
      y: { 
        ticks: { color: 'var(--color-text-secondary)' }, 
        grid: { color: 'rgba(var(--color-text-secondary-rgb), 0.1)' } 
      },
    },
  };

  let ChartComponent;
  switch (chartData?.type) {
    case 'line':
      ChartComponent = Line;
      break;
    case 'pie':
      ChartComponent = Pie;
      break;
    case 'doughnut':
      ChartComponent = Doughnut;
      break;
    default:
      ChartComponent = Bar;
  }

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      initial={animated ? { opacity: 0, y: 30 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <h2 className="text-5xl font-bold mb-8 text-center" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
      )}
      <div className="w-full h-full max-h-[450px]">
        {themedChartData && <ChartComponent options={options} data={themedChartData} />}
      </div>
    </motion.div>
  );
}
