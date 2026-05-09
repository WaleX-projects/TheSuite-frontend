import { useEffect, useState, useMemo, useCallback } from "react";
import { leaveApi } from "@/lib/leaveApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CalendarRange } from "lucide-react";
import { toast } from "sonner";

type LeaveBalance = {
  id: string;
  employee: string;
  employee_name: string;
  leave_type: string;
  leave_type_name: string;
  year: number;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
};

const balanceBadge = (days: number) => {
  if (days <= 3) return "destructive";
  if (days <= 7) return "secondary";
  return "default";
};

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

  const fetchBalances = useCallback(async () => {
    setLoading(true);

    try {
      const res = await leaveApi.listBalances();

      setBalances(res.data?.results || res.data || []);
    } catch (error) {
      toast.error("Failed to load leave balances");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const leaveTypes = useMemo(() => {
    const unique = [...new Set(balances.map((b) => b.leave_type_name))];
    return unique;
  }, [balances]);

  const years = useMemo(() => {
    const unique = [...new Set(balances.map((b) => b.year.toString()))];
    return unique.sort((a, b) => Number(b) - Number(a));
  }, [balances]);

  const filteredBalances = useMemo(() => {
    return balances.filter((item) => {
      const matchesSearch =
        item.employee_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.leave_type_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesYear =
        yearFilter === "all" ||
        item.year.toString() === yearFilter;

      const matchesType =
        leaveTypeFilter === "all" ||
        item.leave_type_name === leaveTypeFilter;

      return matchesSearch && matchesYear && matchesType;
    });
  }, [balances, search, yearFilter, leaveTypeFilter]);

  const summary = useMemo(() => {
    const totalEmployees = new Set(
      balances.map((b) => b.employee)
    ).size;

    const allocated = balances.reduce(
      (sum, item) => sum + Number(item.allocated_days),
      0
    );

    const used = balances.reduce(
      (sum, item) => sum + Number(item.used_days),
      0
    );

    const pending = balances.reduce(
      (sum, item) => sum + Number(item.pending_days),
      0
    );

    return {
      totalEmployees,
      allocated,
      used,
      pending,
    };
  }, [balances]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <CalendarRange className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Leave Balances
          </h1>
          <p className="text-sm text-muted-foreground">
            Track employee leave allocations and usage
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Total Employees
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.totalEmployees}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Allocated Days
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.allocated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Used Days
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.used}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Pending Days
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.pending}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder="Search employee or leave type..."
                className="pl-10"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <Select
              value={leaveTypeFilter}
              onValueChange={setLeaveTypeFilter}
            >
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Leave Types
                </SelectItem>

                {leaveTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={yearFilter}
              onValueChange={setYearFilter}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Year" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Years
                </SelectItem>

                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year}
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Employee Leave Balances (
            {filteredBalances.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Remaining</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredBalances.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.employee_name}
                    </TableCell>

                    <TableCell>
                      {item.leave_type_name}
                    </TableCell>

                    <TableCell>
                      {item.year}
                    </TableCell>

                    <TableCell>
                      {item.allocated_days}
                    </TableCell>

                    <TableCell>
                      {item.used_days}
                    </TableCell>

                    <TableCell>
                      {item.pending_days}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={balanceBadge(
                          item.remaining_days
                        )}
                      >
                        {item.remaining_days} days
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredBalances.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-14 text-muted-foreground"
                    >
                      No leave balances found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}