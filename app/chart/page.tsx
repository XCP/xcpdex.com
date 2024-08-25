import ApexCombinedChart from '@/components/apex-combined';

export default function Dashboard() {
  return (
    <div>
      <h1>Metrics Dashboard</h1>
      <ApexCombinedChart
        metricType="total_addresses"
        periodType="day"
      />
    </div>
  );
}
