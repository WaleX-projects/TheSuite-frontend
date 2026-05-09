import { useEffect, useState, useCallback, useMemo } from "react";
import { payrollApi } from "@/lib/payrollApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
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

import {
  Search,
  Plus,
  Loader2,
  DollarSign,
} from "lucide-react";

import { toast } from "sonner";

type PayrollInput = {
  id: string;
  employee: string;
  employee_name: string;

  month: string;
  year: number;

  basic_salary: number;
  allowance: number;
  bonus: number;
  deductions: number;

  net_salary: number;

  status: "draft" | "processed";
};

export default function PayrollInputsPage() {
  const [data, setData] = useState<PayrollInput[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await payrollApi.listInputs();
      setData(res.data?.results || res.data || []);
    } catch {
      toast.error("Failed to load payroll inputs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.employee_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesMonth =
        monthFilter === "all" ||
        item.month === monthFilter;

      const matchesYear =
        yearFilter === "all" ||
        item.year.toString() === yearFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [data, search, monthFilter, yearFilter]);

  const months = useMemo(() => {
    return [...new Set(data.map((d) => d.month))];
  }, [data]);

  const years = useMemo(() => {
    return [...new Set(data.map((d) => d.year.toString()))].sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [data]);

  const format = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value);

  const summary = useMemo(() => {
    const total = data.length;

    const draft = data.filter((d) => d.status === "draft").length;
    const processed = data.filter((d) => d.status === "processed").length;

    const payroll = data.reduce((sum, d) => sum + d.net_salary, 0);

    return { total, draft, processed, payroll };
  }, [data]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <DollarSign className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Payroll Inputs
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage employee salary components before payroll
            </p>
          </div>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Input
        </Button>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold">{summary.draft}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Processed</p>
            <p className="text-2xl font-bold">{summary.processed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Payroll</p>
            <p className="text-lg font-bold">{format(summary.payroll)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Inputs</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>Allowance</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.employee_name}
                    </TableCell>

                    <TableCell>
                      {item.month} {item.year}
                    </TableCell>

                    <TableCell>{format(item.basic_salary)}</TableCell>
                    <TableCell>{format(item.allowance)}</TableCell>
                    <TableCell>{format(item.deductions)}</TableCell>

                    <TableCell className="font-semibold">
                      {format(item.net_salary)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          item.status === "processed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No payroll inputs found
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