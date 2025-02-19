import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const AmazingPieChart: React.FC<{ data: { mobile: number; desktop: number } }> = ({ data }) => {
  const [chartData, setChartData] = useState<any>(null);

  const generateGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 390);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const mobileGradient = generateGradient(ctx, '#C3937C', '#EAD9C9');
      const desktopGradient = generateGradient(ctx, '#EAD9C9', '#C3937C');

      const total = data.mobile + data.desktop;
      const mobilePercentage = ((data.mobile / total) * 100).toFixed(2);
      const desktopPercentage = ((data.desktop / total) * 100).toFixed(2);

      setChartData({
        labels: ['Mobile', 'Desktop'],
        datasets: [
          {
            data: [mobilePercentage, desktopPercentage],
            backgroundColor: [mobileGradient, desktopGradient],
            borderColor: ['#787878', '#787878'],
            borderWidth: 0.4,
            hoverOffset: 20, // Powiększenie segmentu przy najechaniu
          },
        ],
      });
    }
  }, [data]);

  return (
    <div style={{ width: '330px', height: '330px', margin: '0 auto', position: 'relative' }}>
      {chartData && (
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                  top: 0,
                  bottom: 20,
                  left: 20,
                  right: 20,
                },
              },
              elements: {
                arc: {
                  borderRadius: 20, // Zaokrąglenie segmentów
                },
              },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  font: {
                    family: 'Cormorant, serif', // Czcionka
                    
                    size: 14,
                    
                  },
                  usePointStyle: true, // Użycie kropek zamiast kwadratów w legendzie
                  color: '#333',
                },
              },
              tooltip: {
                callbacks: {
                    label: (tooltipItem) =>
                      `${tooltipItem.label.toUpperCase()}: ${tooltipItem.raw}%`, // Uppercase w tooltipach
                  },
                backgroundColor: '#C3937C',
                bodyColor: '#fff',
                titleColor: '#fff',
                cornerRadius: 10,
              },
            },
            cutout: '70%', // Styl doughnut
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 4000, // Czas animacji
            },
          }}
        />
      )}
    </div>
  );
};

export default AmazingPieChart;
