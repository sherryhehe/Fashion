# TimeFilter Component

A reusable time filter component for dashboard analytics and data filtering.

## Features

- **Four time periods**: ALL, 1M (Last Month), 6M (Last 6 Months), 1Y (Last Year)
- **Active state management**: Shows which filter is currently selected
- **Callback support**: Notifies parent components when filter changes
- **Accessibility**: Includes tooltips with full descriptions
- **Smooth animations**: Visual feedback on button clicks
- **TypeScript support**: Fully typed with TypeScript interfaces

## Usage

### Basic Usage

```tsx
import TimeFilter, { TimeFilterOption } from '@/components/ui/TimeFilter';

function MyComponent() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('1Y');

  const handleFilterChange = (filter: TimeFilterOption) => {
    setTimeFilter(filter);
    // Handle the filter change (API calls, data updates, etc.)
  };

  return (
    <div>
      <h4>Analytics</h4>
      <TimeFilter 
        defaultValue="1Y"
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
```

### Advanced Usage

```tsx
function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('1Y');
  const [chartData, setChartData] = useState(null);

  const handleFilterChange = async (filter: TimeFilterOption) => {
    setTimeFilter(filter);
    
    // Example: Fetch data based on time filter
    const dateRange = getDateRangeFromFilter(filter);
    const data = await fetchAnalyticsData(dateRange);
    setChartData(data);
  };

  const getDateRangeFromFilter = (filter: TimeFilterOption) => {
    const now = new Date();
    switch (filter) {
      case 'ALL':
        return { start: null, end: null };
      case '1M':
        return { 
          start: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
          end: now 
        };
      case '6M':
        return { 
          start: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
          end: now 
        };
      case '1Y':
        return { 
          start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          end: now 
        };
    }
  };

  return (
    <div>
      <TimeFilter 
        defaultValue={timeFilter}
        onFilterChange={handleFilterChange}
        className="ms-auto"
      />
      {chartData && <Chart data={chartData} />}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `TimeFilterOption` | `'1Y'` | Initial selected filter |
| `onFilterChange` | `(filter: TimeFilterOption) => void` | `undefined` | Callback when filter changes |
| `className` | `string` | `''` | Additional CSS classes |

## Types

```tsx
export type TimeFilterOption = 'ALL' | '1M' | '6M' | '1Y';
```

## Implementation Notes

- The component maintains its own internal state for the active filter
- Visual feedback includes button scaling animation on click
- Bootstrap classes are used for styling (`btn-outline-light`, `active`)
- Tooltips show full descriptions (e.g., "Last Month" for "1M")

## Integration Examples

### With Charts
```tsx
// Update ApexCharts or other chart libraries
const updateChart = (filter: TimeFilterOption) => {
  const options = {
    chart: { /* chart config */ },
    series: getDataForPeriod(filter),
    xaxis: { /* axis config */ }
  };
  chart.updateOptions(options);
};
```

### With API Calls
```tsx
const fetchData = async (filter: TimeFilterOption) => {
  const params = new URLSearchParams();
  if (filter !== 'ALL') {
    params.append('period', filter);
  }
  const response = await fetch(`/api/analytics?${params}`);
  return response.json();
};
```

### With URL Parameters
```tsx
const updateURL = (filter: TimeFilterOption) => {
  const url = new URL(window.location);
  url.searchParams.set('period', filter);
  window.history.pushState({}, '', url);
};
```
