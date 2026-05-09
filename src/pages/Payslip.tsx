import { useEffect, useState, useMemo, useCallback } from "react";
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
  Receipt,
  Search,
  Download,
  Eye,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

type Payslip = {
  id: string;
  employee: string;
  employee_name: string;
  payroll_month: string;
  payroll_year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  net_salary: number;
  status: "paid" | "pending";
  created_at: string;
};

const statusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

export default function PayslipPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayslips = useCallback(async () => {
    setLoading(true);

    try {
      const res = await payrollApi.listPayslips();

      setPayslips(
        res.data?.results || res.data || []
      );
    } catch (error) {
      toast.error(
        "Failed to load payslips"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [fetchPayslips]);

  const months = useMemo(() => {
    return [
      ...new Set(
        payslips.map(
          (p) => p.payroll_month
        )
      ),
    ];
  }, [payslips]);

  const years = useMemo(() => {
    return [
      ...new Set(
        payslips.map((p) =>
          p.payroll_year.toString()
        )
      ),
    ].sort(
      (a, b) =>
        Number(b) - Number(a)
    );
  }, [payslips]);

  const filteredPayslips =
    useMemo(() => {
      return payslips.filter(
        (item) => {
          const matchesSearch =
            item.employee_name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesMonth =
            monthFilter === "all" ||
            item.payroll_month ===
              monthFilter;

          const matchesYear =
            yearFilter === "all" ||
            item.payroll_year.toString() ===
              yearFilter;

          const matchesStatus =
            statusFilter === "all" ||
            item.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesMonth &&
            matchesYear &&
            matchesStatus
          );
        }
      );
    }, [
      payslips,
      search,
      monthFilter,
      yearFilter,
      statusFilter,
    ]);

  const summary = useMemo(() => {
    const total = payslips.length;

    const paid =
      payslips.filter(
        (p) => p.status === "paid"
      ).length;

    const pending =
      payslips.filter(
        (p) =>
          p.status === "pending"
      ).length;

    const payroll =
      payslips.reduce(
        (sum, item) =>
          sum +
          Number(
            item.net_salary
          ),
        0
      );

    return {
      total,
      paid,
      pending,
      payroll,
    };
  }, [payslips]);

  const formatCurrency = (
    value: number
  ) =>
    new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
      }
    ).format(value);

  const handleDownload = async (
    id: string
  ) => {
    try {
      await payrollApi.downloadPayslip(
        id
      );

      toast.success(
        "Payslip download started"
      );
    } catch {
      toast.error(
        "Failed to download payslip"
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Receipt className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Payslips
          </h1>

          <p className="text-sm text-muted-foreground">
            View employee salary
            slips and payroll
            history
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Total Payslips
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Paid
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.paid}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Pending
            </p>
            <p className="text-3xl font-bold mt-2">
              {summary.pending}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Net Payroll
            </p>
            <p className="text-xl font-bold mt-2">
              {formatCurrency(
                summary.payroll
              )}
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
                placeholder="Search employee..."
                className="pl-10"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            <Select
              value={monthFilter}
              onValueChange={
                setMonthFilter
              }
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Month" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Months
                </SelectItem>

                {months.map(
                  (month) => (
                    <SelectItem
                      key={month}
                      value={month}
                    >
                      {month}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={yearFilter}
              onValueChange={
                setYearFilter
              }
            >
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Year" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Years
                </SelectItem>

                {years.map(
                  (year) => (
                    <SelectItem
                      key={year}
                      value={year}
                    >
                      {year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={
                setStatusFilter
              }
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Status
                </SelectItem>

                <SelectItem value="paid">
                  Paid
                </SelectItem>

                <SelectItem value="pending">
                  Pending
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payslip Records (
            {
              filteredPayslips.length
            }
            )
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Employee
                  </TableHead>
                  <TableHead>
                    Month
                  </TableHead>
                  <TableHead>
                    Year
                  </TableHead>
                  <TableHead>
                    Basic
                  </TableHead>
                  <TableHead>
                    Deductions
                  </TableHead>
                  <TableHead>
                    Net Salary
                  </TableHead>
                  <TableHead>
                    Status
                  </TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPayslips.map(
                  (item) => (
                    <TableRow
                      key={item.id}
                    >
                      <TableCell className="font-medium">
                        {
                          item.employee_name
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.payroll_month
                        }
                      </TableCell>

                      <TableCell>
                        {
                          item.payroll_year
                        }
                      </TableCell>

                      <TableCell>
                        {formatCurrency(
                          item.basic_salary
                        )}
                      </TableCell>

                      <TableCell>
                        {formatCurrency(
                          item.deductions +
                            item.tax
                        )}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {formatCurrency(
                          item.net_salary
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={statusVariant(
                            item.status
                          )}
                        >
                          {
                            item.status
                          }
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDownload(
                                item.id
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}

                {filteredPayslips.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-14 text-muted-foreground"
                    >
                      No payslips
                      found.
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