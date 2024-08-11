"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ApexChartProps {
  pairName: string;
}

const ApexChart: React.FC<ApexChartProps> = ({ pairName }) => {
  const [series, setSeries] = useState<any[]>([]);
  const [options, setOptions] = useState<any>({
    chart: {
      type: 'candlestick',
      height: 350,
      zoom: {
        enabled: true,
        type: 'xy',  
        autoScaleYaxis: false,  
      }
    },
    title: {
      text: 'XCP/BTC Trade History',
      align: 'left'
    },
    xaxis: {
      type: 'datetime'
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      decimalsInFloat: 2,
      min: 0,
      forceNiceScale: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/ohlc/${pairName}?interval=1M`);
        const data = await response.json();

        if (Array.isArray(data.data)) {
          const formattedData = data.data.map((item: any) => {
            const ohlc = item.ohlc_data && item.ohlc_data[0]; // Check if ohlc_data exists and access the first item
            if (ohlc) {
              return {
                x: new Date(item.timestamp * 1000), // assuming the timestamp is in seconds
                y: [
                  parseFloat(ohlc.open),
                  parseFloat(ohlc.high),
                  parseFloat(ohlc.low),
                  parseFloat(ohlc.close)
                ]
              };
            } else {
              return null; // Return null for items with no valid OHLC data
            }
          }).filter(Boolean); // Remove null entries from the array

          setSeries([{ data: formattedData }]);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [pairName]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={options} series={series} type="candlestick" height={350} />
      </div>
    </div>
  );
};

export default ApexChart;
