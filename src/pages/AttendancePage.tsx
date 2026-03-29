import { useEffect, useState } from "react";
import { attendanceApi } from "@/lib/attendanceApi";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "present": return "default" as const;
    case "late": return "secondary" as const;
    case "absent": return "destructive" as const;
    default: return "secondary" as const;
  }
};

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= FILTERS =================
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ================= PAGINATION =================
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [count, setCount] = useState(0);

  // ================= LOAD =================
  const load = async () => {
    try {
      const { data } = await attendanceApi.list({
        page,
        page_size: pageSize,
        search,
        status,
        start_date: startDate,
        end_date: endDate
      });

      setRecords(data.results || []);
      setCount(data.count || 0);

    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    load();
  }, [page, search, status, startDate, endDate]);

  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="page-header">Attendance</h1>
        <p className="page-subtitle">All attendance records</p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">

        {/* SEARCH NAME */}
        <Input
          placeholder="Search employee..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        {/* STATUS */}
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>

        {/* DATE FILTER */}
        <Input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPage(1);
            setStartDate(e.target.value);
          }}
        />

        <Input
          type="date"
          value={endDate}
          onChange={(e) => {
            setPage(1);
            setEndDate(e.target.value);
          }}
        />

      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {records.map((r, i) => (
                <TableRow key={r.id ?? i}>
                  <TableCell>{r.employee_name ?? "Unknown"}</TableCell>

                  <TableCell>
                    {new Date(r.date).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    {r.clock_in_time || "_"}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusColor(r.status)}>
                      {r.status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    {loading ? "Loading..." : "No records found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex justify-between items-center">

        <p className="text-sm">
          Page {page} of {totalPages || 1}
        </p>

        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Prev
          </Button>

          <Button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>

      </div>

    </div>
  );
}