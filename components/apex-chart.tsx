"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ApexChartProps {
  pairSlug: string;
  interval: string;
}

const ApexChart: React.FC<ApexChartProps> = ({ pairSlug, interval }) => {
  const market = pairSlug.replace('_', '/');
  const [series, setSeries] = useState<any[]>([]);
  const [options, setOptions] = useState<any>({
    chart: {
      type: 'candlestick',
      height: 350,
      zoom: {
        enabled: true,
        type: 'xy',  
        autoScaleYaxis: false,  
      },
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
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      decimalsInFloat: 8,
      min: 0,
      forceNiceScale: true
    }
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
                y: [
                  parseFloat(ohlc.open),
                  parseFloat(ohlc.high),
                  parseFloat(ohlc.low),
                  parseFloat(ohlc.close)
                ]
              };
            } else {
              return null;
            }
          }).filter(Boolean);

          setSeries([{ data: formattedData }]);
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
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
    </div>
  );
};

export default ApexChart;
