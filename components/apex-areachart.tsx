"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface AreaChartProps {
  pairSlug: string;
  interval: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ pairSlug, interval }) => {
  const lastUnderscoreIndex = pairSlug.lastIndexOf('_');
  const market = pairSlug.substring(0, lastUnderscoreIndex) + '/' + pairSlug.substring(lastUnderscoreIndex + 1);
  const [series, setSeries] = useState<any[]>([]);
  const [options, setOptions] = useState<any>({
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true,
      },
      toolbar: {
        autoSelected: 'zoom',
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    title: {
      text: market,
      align: 'left',
      style: {
        fontFamily: 'Inter, Arial, sans-serif',
        fontWeight: 'bold',
        fontSize: '16px'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      decimalsInFloat: 8,
      min: 0,
      forceNiceScale: true
    },
    xaxis: {
      type: 'datetime',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/ohlc/${pairSlug}?interval=${interval}`);
        const data = await response.json();

        if (Array.isArray(data.data)) {
          const formattedData = data.data.map((item: any) => {
            const ohlc = item.ohlc_data && item.ohlc_data[0];
            if (ohlc) {
              return {
                x: new Date(item.timestamp * 1000),
                y: parseFloat(ohlc.close),
              };
            } else {
              return null;
            }
          }).filter(Boolean);

          setSeries([{ name: pairSlug, data: formattedData }]);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pairSlug, interval]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="area" height={350} />
      </div>
    </div>
  );
};

export default AreaChart;
