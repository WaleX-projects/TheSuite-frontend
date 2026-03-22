import { useEffect, useState } from "react";
import { attendanceApi } from "@/lib/attendanceApi";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await attendanceApi.list();
        setRecords(Array.isArray(data) ? data : data.results || []);
      } catch { toast.error("Failed to load"); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="page-header">Attendance</h1><p className="page-subtitle">All attendance records</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.employee_name || r.employee}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.clock_in || "—"}</TableCell>
                  <TableCell>{r.clock_out || "—"}</TableCell>
                  <TableCell>{r.total_hours || "—"}</TableCell>
                  <TableCell><Badge variant={statusColor(r.status)}>{r.status}</Badge></TableCell>
                </TableRow>
              ))}
              {records.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No records"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
