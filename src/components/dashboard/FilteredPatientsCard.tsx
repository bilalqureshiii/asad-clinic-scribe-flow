
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from 'lucide-react';

type TimeFilter = 'day' | 'week' | 'month' | 'year';

interface FilteredPatientsCardProps {
  timeFilter: TimeFilter;
  setTimeFilter: (value: TimeFilter) => void;
  filteredCount: number;
}

const FilteredPatientsCard: React.FC<FilteredPatientsCardProps> = ({
  timeFilter,
  setTimeFilter,
  filteredCount
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtered Patients</CardTitle>
          <Select
            value={timeFilter}
            onValueChange={(value) => setTimeFilter(value as TimeFilter)}
          >
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center">
          <p className="text-3xl font-bold text-clinic-teal">{filteredCount}</p>
          <CalendarDays className="ml-2 h-4 w-4 text-muted-foreground" />
          <span className="ml-1 text-xs text-muted-foreground">
            {timeFilter === 'day' ? 'Last 24hrs' :
             timeFilter === 'week' ? 'Last 7 days' :
             timeFilter === 'month' ? 'Last 30 days' : 'Last 365 days'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilteredPatientsCard;
