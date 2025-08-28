'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export function DataChart({ title, chartData, animated }) {
  const [themedChartData, setThemedChartData] = useState(null);

  useEffect(() => {
    if (chartData) {
      const computedStyle = getComputedStyle(document.documentElement);
      const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
      const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
      const textSecondaryColor = computedStyle.getPropertyValue('--color-textSecondary').trim();

      const dataWithResolvedColors = {
        ...chartData,
        datasets: chartData.datasets?.map(ds => ({
          ...ds,
          backgroundColor: ds.backgroundColor || primaryColor,
          borderColor: ds.borderColor || secondaryColor,
        })) || [],
      };
      setThemedChartData(dataWithResolvedColors);
    } else {
      setThemedChartData({ labels: [], datasets: [] });
    }
  }, [chartData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'var(--color-textSecondary)' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: 'var(--color-textSecondary)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: 'var(--color-textSecondary)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  const ChartComponent = chartData?.type === 'line' ? Line : Bar;

  return (
    <motion.div
      className="w-full h-full p-16 flex flex-col items-center justify-center"
      initial={animated ? { opacity: 0, y: 30 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5 }}
    >
      {title && (
        <h2 className="text-5xl font-bold mb-8 text-center" style={{ color: 'var(--color-textPrimary)' }}>
          {title}
        </h2>
      )}
      <div className="w-full h-full max-h-[450px]">
        {themedChartData && <ChartComponent options={options} data={themedChartData} />}
      </div>
    </motion.div>
  );
}
