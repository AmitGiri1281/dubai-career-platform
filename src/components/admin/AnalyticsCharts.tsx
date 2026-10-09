"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  topCategories: { name: string; count: number }[];
  jobsByDay: { day: string; count: number }[];
  inquiriesTrend: { day: string; count: number }[];
}

export default function AnalyticsCharts({
  topCategories,
  jobsByDay,
  inquiriesTrend,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Top categories</h3>
        {topCategories.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Last 14 days</h3>
        {jobsByDay.length === 0 && inquiriesTrend.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={mergeSeries(jobsByDay, inquiriesTrend)}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="jobs"
                name="Jobs"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="inquiries"
                name="Inquiries"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function mergeSeries(
  a: { day: string; count: number }[],
  b: { day: string; count: number }[]
) {
  const map = new Map<string, { day: string; jobs: number; inquiries: number }>();
  a.forEach((r) =>
    map.set(r.day, { day: r.day, jobs: r.count, inquiries: 0 })
  );
  b.forEach((r) => {
    const existing = map.get(r.day);
    if (existing) existing.inquiries = r.count;
    else map.set(r.day, { day: r.day, jobs: 0, inquiries: r.count });
  });
  return Array.from(map.values()).sort((x, y) => x.day.localeCompare(y.day));
}