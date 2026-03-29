import { useEffect, useState } from "react";
import axios from "axios";
import { departmentApi ,positionApi } from "@/lib/employeesApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


// ================= COMPONENT =================
export default function OrganizationPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  const [deptName, setDeptName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // ================= FETCH =================
  const fetchDepartments = async () => {
  try {
    const res = await departmentApi.list();
    console.log("data-----test",res.data);
    // 🔥 FIX HERE
    setDepartments(res.data.results || res.data);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
  }
};

  const fetchPositions = async () => {
  try {
    const res = await positionApi.list();
    console.log("position",res.data);
    // 🔥 FIX HERE
    setPositions(res.data.results || res.data);
  } catch (error) {
    console.error("Failed to fetch positions:", error);
  }
};

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);

  // ================= CREATE =================
  const handleCreateDepartment = async () => {
    if (!deptName) return;

    try {
      await departmentApi.create({ name: deptName });
      setDeptName("");
      fetchDepartments();
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleCreatePosition = async () => {
    if (!positionTitle || !selectedDept) return;

    try {
      await positionApi.create({
        title: positionTitle,
        department: selectedDept,
      });

      setPositionTitle("");
      setSelectedDept("");
      fetchPositions();
    } catch (error) {
      console.error("Failed to create position:", error);
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Organization</h1>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        {/* ================= DEPARTMENTS ================= */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Departments</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>+ Add Department</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="Department name"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                    />

                    <Button onClick={handleCreateDepartment}>
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-3 border rounded-xl"
                  >
                    {dept.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= POSITIONS ================= */}
        <TabsContent value="positions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positions</CardTitle>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>+ Add Position</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Position</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <Input
                      placeholder="Position title"
                      value={positionTitle}
                      onChange={(e) =>
                        setPositionTitle(e.target.value)
                      }
                    />

                    <select
                      className="w-full border rounded-md p-2"
                      value={selectedDept}
                      onChange={(e) =>
                        setSelectedDept(e.target.value)
                      }
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>

                    <Button onClick={handleCreatePosition}>
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-3 border rounded-xl"
                  >
                    <div className="font-medium">{pos.title}</div>
                    <div className="text-sm text-gray-500">
                      {pos.department_name || pos.department}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}