import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { RejectModal } from "../components/RejectModal";
import { ArrowRight } from "lucide-react";
import { CheckerLog } from "@/components/CheckerLog";
import { GroupView } from "../components/GroupView";
import { useChecker } from "../hooks/useChecker";
import { fetchGroupList } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { TableContent } from "../components/TableContent";

interface TableSummary {
  name: string;
  count: number;
  changes: Array<{
    request_id: string;
    old_data: Record<string, unknown>;
    new_data: Record<string, unknown>;
  }>;
}

// Function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const CheckerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [groupView, setGroupView] = useState<"group" | "ungroup">("ungroup");
  const [tableSummaries, setTableSummaries] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<
    Record<string, boolean>
  >({});
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") || "User";
  const token = localStorage.getItem("token");
  const decodedToken = token ? decodeJWT(token) : null;
  const userId = decodedToken?.user_id || "";
  const role = "Checker";
  const { toast } = useToast();

  const {
    pendingChanges,
    isLoading,
    rejectReason,
    setRejectReason,
    isRejectModalOpen,
    setIsRejectModalOpen,
    submitReject,
    handleApprove,
    handleReject,
    handleApproveAll,
    handleRejectAll,
  } = useChecker();

  useEffect(() => {
    if (pendingChanges.length > 0) {
      // Group changes by table name
      const tableGroups = pendingChanges.reduce<Record<string, TableSummary>>(
        (acc, change) => {
          if (!acc[change.tableName]) {
            acc[change.tableName] = {
              name: change.tableName,
              count: 0,
              changes: [],
            };
          }

          // Count changes by comparing oldValues and newValues
          const changedFields = Object.keys(change.newValues || {}).filter(
            (key) => {
              return (
                String(change.oldValues?.[key]) !==
                String(change.newValues?.[key])
              );
            }
          );

          acc[change.tableName].count += changedFields.length;
          acc[change.tableName].changes.push({
            request_id: change.request_id,
            old_data: change.oldValues || {},
            new_data: change.newValues || {},
          });

          return acc;
        },
        {}
      );

      setTableSummaries(Object.values(tableGroups));
    }
  }, [pendingChanges]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchGroupList();
        if (!response.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load groups",
          });
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load groups",
        });
      }
    };

    if (groupView === "group") {
      loadGroups();
    }
  }, [groupView, toast]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const totalPendingChanges = tableSummaries.reduce(
    (sum, table) => sum + table.count,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <Header firstName={firstName} role={role} onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="text-2xl font-medium mb-1">
              Hello, <span className="text-[#FF6B00]">{firstName}</span>
            </h1>
            <p className="text-gray-600 text-sm">
              Summary of pending changes across all tables
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Pending reviews :</span>
            <span className="text-[#FF6B00] font-medium">
              {totalPendingChanges.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <div className="border-b border-gray-200">
            <TabsList className="mb-0 bg-transparent gap-8">
              <TabsTrigger
                value="overview"
                className="pb-4 px-0 data-[state=active]:text-[#FF6B00] data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="pb-4 px-0 data-[state=active]:text-[#FF6B00] data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B00] rounded-none"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          {activeTab === "overview" && (
            <div className="flex gap-2 mt-6 mb-8">
              <button
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  groupView === "ungroup"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
                onClick={() => setGroupView("ungroup")}
              >
                Ungroup
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  groupView === "group"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
                onClick={() => setGroupView("group")}
              >
                Group
              </button>
            </div>
          )}

          <TabsContent value="overview" className="mt-0">
            {groupView === "ungroup" ? (
              selectedTable ? (
                <TableContent
                  tableName={selectedTable}
                  pendingChanges={pendingChanges}
                  selectedChanges={selectedChanges}
                  setSelectedChanges={setSelectedChanges}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  handleApproveAll={handleApproveAll}
                  handleRejectAll={handleRejectAll}
                  onBack={() => setSelectedTable(null)}
                />
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {tableSummaries.filter((table) => table.count > 0).length ===
                  0 ? (
                    <div className="col-span-3 h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-gray-600 text-lg mb-2">
                          No Changes Available
                        </p>
                        <p className="text-gray-500 text-sm">
                          There are no pending changes in any table
                        </p>
                      </div>
                    </div>
                  ) : (
                    tableSummaries
                      .filter((table) => table.count > 0)
                      .map((table) => (
                        <Card
                          key={table.name}
                          onClick={() => setSelectedTable(table.name)}
                          className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {table.name}
                              </h3>
                              <div className="text-[#FF6B00] font-medium mt-1">
                                {String(table.count).padStart(2, "0")}
                              </div>
                            </div>
                            <ArrowRight className="text-gray-400 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </Card>
                      ))
                  )}
                </div>
              )
            ) : (
              <GroupView
                tableSummaries={tableSummaries.reduce((acc, table) => {
                  acc[table.name] = table;
                  return acc;
                }, {} as Record<string, TableSummary>)}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <CheckerLog checker={userId} />
          </TabsContent>
        </Tabs>
      </div>

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
        }}
        onSubmit={submitReject}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CheckerPage;
