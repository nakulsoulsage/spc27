'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['student-stats'],
    queryFn: () => api.get('/students/stats', accessToken!),
    enabled: !!accessToken,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{data.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Placed Students</CardDescription>
            <CardTitle className="text-3xl">{data.placed ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Placement %</CardDescription>
            <CardTitle className="text-3xl">
              {data.placementPercentage != null
                ? `${Number(data.placementPercentage).toFixed(1)}%`
                : '0%'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average CTC</CardDescription>
            <CardTitle className="text-3xl">
              {data.avgCTC != null ? `${Number(data.avgCTC).toFixed(1)} LPA` : '--'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch-wise Placements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.branchWise && data.branchWise.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.branchWise} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="branch" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Total Students" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="hsl(142, 71%, 45%)" name="Placed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No branch-wise data available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch-wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data.branchWise && data.branchWise.length > 0 ? (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground border-b pb-2">
                  <span>Branch</span>
                  <span className="text-center">Total</span>
                  <span className="text-center">Placed</span>
                  <span className="text-right">Rate</span>
                </div>
                {data.branchWise.map((b: any, idx: number) => {
                  const rate = b.count > 0 ? ((b.placed / b.count) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={idx} className="grid grid-cols-4 text-sm py-2 border-b last:border-0">
                      <span className="font-medium truncate">{b.branch}</span>
                      <span className="text-center">{b.count}</span>
                      <span className="text-center">{b.placed}</span>
                      <span className="text-right">
                        <Badge variant={parseFloat(rate) >= 50 ? 'success' : 'warning'} className="text-xs">
                          {rate}%
                        </Badge>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                No data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company-wise Placements</CardTitle>
        </CardHeader>
        <CardContent>
          {data.companyWise && data.companyWise.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left font-medium">Company</th>
                    <th className="p-3 text-center font-medium">Students Hired</th>
                    <th className="p-3 text-right font-medium">Average CTC</th>
                  </tr>
                </thead>
                <tbody>
                  {data.companyWise.map((c: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.company}</td>
                      <td className="p-3 text-center">{c.count}</td>
                      <td className="p-3 text-right">
                        {c.avgCTC != null ? `${Number(c.avgCTC).toFixed(1)} LPA` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No company data available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
