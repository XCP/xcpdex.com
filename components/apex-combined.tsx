"use client";

import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

interface MetricData {
  period_start: string;
  period_end: string;
  metric_value: number;
}

interface ChartData {
  total: number[];
  cumulative: number[];
  categories: string[];
}

interface MetricsChartProps {
  metricType: string;
  periodType: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

const ApexCombinedChart: React.FC<MetricsChartProps> = ({ metricType, periodType, startDate, endDate }) => {
  const [chartData, setChartData] = useState<ChartData>({ total: [], cumulative: [], categories: [] });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const params = new URLSearchParams({
          metric_type: metricType,
          period_type: periodType,
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        });

        // Fetch total metric data
        const totalResponse = await fetch(`https://api.xcp.io/api/v1/metrics?${params.toString()}`);
        const totalData: MetricData[] = await totalResponse.json();

        // Prepare arrays for total metric data
        const totalValues: number[] = [];
        const categories: string[] = [];
        totalData.forEach((item) => {
          totalValues.push(item.metric_value);
          categories.push(item.period_start);
        });

        // If metricType is "total_assets", also fetch cumulative data
        let cumulativeValues: number[] = [];
        const cumulativeParams = new URLSearchParams({
          metric_type: `${metricType}_cum`,
          period_type: periodType,
          ...(startDate && { start_date: startDate }),
          ...(endDate && { end_date: endDate }),
        });
        const cumulativeResponse = await fetch(`https://api.xcp.io/api/v1/metrics?${cumulativeParams.toString()}`);
        const cumulativeData: MetricData[] = await cumulativeResponse.json();

        cumulativeData.forEach((item) => {
          cumulativeValues.push(item.metric_value);
        });

        // Update the chart data state
        setChartData({
          total: totalValues,
          cumulative: cumulativeValues,
          categories,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMetrics();
  }, [metricType, periodType, startDate, endDate]);

  const options = {
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      categories: chartData.categories,
      type: 'datetime',
    },
    yaxis: [
      {
        title: {
          text: 'Total',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Cumulative',
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      position: 'top',
    },
  };

  const series = [
    {
      name: 'Total',
      type: 'column',
      data: chartData.total,
    },
    {
      name: 'Cumulative',
      type: 'line',
      data: chartData.cumulative,
    },
  ];

  return (
    <div>
      <ReactApexChart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default ApexCombinedChart;
