"use client";

import React, { useRef, useEffect, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

// Define the prop types
interface ChartProps {
  pairName: string;
  initialInterval?: string;
  autosize?: boolean;
  chartOptions?: object;
  seriesOptions?: object;
  timeScaleOptions?: object;
  priceScaleOptions?: object;
  volumeSeriesOptions?: object;
}

const intervals = ['1d', '1w', '1m', '1y'];

const ChartComponent: React.FC<ChartProps> = ({
  pairName,
  initialInterval = '1D',
  autosize = true,
  chartOptions = {},
  seriesOptions = {},
  timeScaleOptions = {},
  priceScaleOptions = {},
  volumeSeriesOptions = {},
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<'Candlestick'> | null>(null);
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<'Histogram'> | null>(null);

  const fetchData = async (pairName: string, interval: string) => {
    try {
      const response = await fetch(`https://api.xcp.io/api/v1/ohlc/${pairName}?interval=${interval}`);
      const data = await response.json();
      if (!Array.isArray(data.data)) {
        throw new Error('API response data is not an array');
      }
      return data.data;
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      return [];
    }
  };

  const addSeriesAndData = (data: any[], type: string) => {
    if (!chart) return;

    const seriesConstructor = `add${type.charAt(0).toUpperCase() + type.slice(1)}Series` as keyof IChartApi;
    const newCandlestickSeries = chart[seriesConstructor](seriesOptions) as ISeriesApi<'Candlestick'>;
    const newVolumeSeries = chart.addHistogramSeries(volumeSeriesOptions);

    const formattedData = data.map((item) => {
      if (item.ohlc_data && item.ohlc_data.length > 0) {
        const ohlc = item.ohlc_data[0];
        return {
          open: parseFloat(ohlc.open),
          high: parseFloat(ohlc.high),
          low: parseFloat(ohlc.low),
          close: parseFloat(ohlc.close),
          time: item.timestamp,
        };
      } else {
        return { time: item.timestamp };
      }
    });

    const volumeData = data.map((item) => {
      if (item.ohlc_data && item.ohlc_data.length > 0) {
        const ohlc = item.ohlc_data[0];
        const color = parseFloat(ohlc.close) >= parseFloat(ohlc.open) ? '#26a69a' : '#ef5350';
        return {
          value: parseFloat(ohlc.volume),
          time: item.timestamp,
          color,
        };
      } else {
        return { time: item.timestamp, value: 0 };
      }
    });

    newCandlestickSeries.setData(formattedData);
    newVolumeSeries.setData(volumeData);

    setCandlestickSeries(newCandlestickSeries);
    setVolumeSeries(newVolumeSeries);
  };

  const setChartInterval = async (interval: string) => {
    const rawData = await fetchData(pairName, interval);
    if (candlestickSeries && volumeSeries) {
      const formattedData = rawData.map((item) => {
        if (item.ohlc_data && item.ohlc_data.length > 0) {
          const ohlc = item.ohlc_data[0];
          return {
            open: parseFloat(ohlc.open),
            high: parseFloat(ohlc.high),
            low: parseFloat(ohlc.low),
            close: parseFloat(ohlc.close),
            time: item.timestamp,
          };
        } else {
          return { time: item.timestamp };
        }
      });

      const volumeData = rawData.map((item) => {
        if (item.ohlc_data && item.ohlc_data.length > 0) {
          const ohlc = item.ohlc_data[0];
          const color = parseFloat(ohlc.close) >= parseFloat(ohlc.open) ? '#26a69a' : '#ef5350';
          return {
            value: parseFloat(ohlc.volume),
            time: item.timestamp,
            color,
          };
        } else {
          return { time: item.timestamp, value: 0 };
        }
      });

      candlestickSeries.setData(formattedData);
      volumeSeries.setData(volumeData);
      chart?.timeScale().fitContent();
    }
  };

  useEffect(() => {
    const initializeChart = async () => {
      const rawData = await fetchData(pairName, initialInterval);
      const newChart = createChart(chartContainerRef.current as HTMLDivElement, chartOptions);
      setChart(newChart);

      addSeriesAndData(rawData, 'candlestick');

      if (priceScaleOptions) {
        newChart.priceScale().applyOptions(priceScaleOptions);
      }

      if (timeScaleOptions) {
        newChart.timeScale().applyOptions(timeScaleOptions);
      }

      window.addEventListener('resize', () => {
        if (autosize && chartContainerRef.current) {
          const dimensions = chartContainerRef.current.getBoundingClientRect();
          newChart.resize(dimensions.width, dimensions.height);
        }
      });

      return () => {
        window.removeEventListener('resize', () => {});
        newChart.remove();
      };
    };

    initializeChart();
  }, [pairName, initialInterval, chartOptions, priceScaleOptions, timeScaleOptions]);

  return (
    <div>
      <div ref={buttonsContainerRef} className="buttons-container">
        {intervals.map((interval) => (
          <button key={interval} onClick={() => setChartInterval(interval)}>
            {interval}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="chart-container"></div>
      <div ref={tooltipRef} className="tooltip"></div>
    </div>
  );
};

export default ChartComponent;
