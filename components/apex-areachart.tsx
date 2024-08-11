"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface AreaChartProps {
  pairName: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ pairName }) => {
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
      text: 'Stock Price Movement',
      align: 'left',
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
      title: {
        text: 'Price',
      },
    },
    xaxis: {
      type: 'datetime',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.xcp.io/api/v1/ohlc/${pairName}?interval=1M`);
        const data = await response.json();

        if (Array.isArray(data.data)) {
          const formattedData = data.data.map((item: any) => {
            const ohlc = item.ohlc_data && item.ohlc_data[0];
            if (ohlc) {
              return {
                x: new Date(item.timestamp * 1000), // assuming the timestamp is in seconds
                y: parseFloat(ohlc.close), // Using the close price for the area chart
              };
            } else {
              return null;
            }
          }).filter(Boolean); // Remove null entries from the array

          setSeries([{ name: pairName, data: formattedData }]);
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
        <ReactApexChart options={options} series={series} type="area" height={350} />
      </div>
    </div>
  );
};

export default AreaChart;
