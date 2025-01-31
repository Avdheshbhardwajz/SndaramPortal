import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { LogOut } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/Card";
import { Separator } from "../../../components/ui/separator";
import logo from "../../../assets/images/Logo-Full.svg";
import { CheckerLog } from "../../../components/CheckerLog";
import { TableContent } from "../components/TableContent";
import { CheckerNotificationIcon } from "../../../components/CheckerNotificationIcon";
import { RejectModal } from "../components/RejectModal";
import { useChecker } from "../hooks/useChecker";

export default function CheckerPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview"
  );
  const [groupView, setGroupView] = useState<"group" | "ungroup">("ungroup");
  const navigate = useNavigate();
  const firstName = localStorage.getItem("firstName") || "User";

  const {
    pendingChanges,
    groups,
    isLoading,
    selectedChanges,
    setSelectedChanges,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectReason,
    setRejectReason,
    handleApproveAll,
    handleRejectAll,
    handleApprove,
    handleReject,
    toggleChangeSelection,
    submitReject,
  } = useChecker();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <div className="ml-auto flex items-center space-x-4">
            <CheckerNotificationIcon />
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Hello, {firstName}</h1>
            <p className="text-muted-foreground">
              Summary of pending changes across all tables
            </p>
          </div>

          <Tabs
            defaultValue="overview"
            className="w-full"
            value={activeTab}
            onValueChange={(value: string) =>
              setActiveTab(value as "overview" | "history")
            }
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="mt-4">
                <div className="p-6">
                  <Tabs
                    defaultValue="ungroup"
                    onValueChange={(value: string) =>
                      setGroupView(value as "group" | "ungroup")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="ungroup">Ungroup</TabsTrigger>
                      <TabsTrigger value="group">Group</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="mt-6">
                    {isLoading ? (
                      <div>Loading...</div>
                    ) : groupView === "ungroup" ? (
                      <TableContent
                        tableName="Ungrouped"
                        tableChanges={pendingChanges.filter(
                          (change) =>
                            !groups.some((group) =>
                              group.table_list.includes(change.tableName)
                            )
                        )}
                        selectedChanges={selectedChanges}
                        setSelectedChanges={setSelectedChanges}
                        handleApproveAll={handleApproveAll}
                        handleRejectAll={handleRejectAll}
                        handleApprove={handleApprove}
                        handleReject={handleReject}
                        toggleChangeSelection={toggleChangeSelection}
                      />
                    ) : (
                      groups.map((group) => (
                        <div key={group.group_name} className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">
                            {group.group_name}
                          </h3>
                          <TableContent
                            tableName={group.group_name}
                            tableChanges={pendingChanges.filter((change) =>
                              group.table_list.includes(change.tableName)
                            )}
                            selectedChanges={selectedChanges}
                            setSelectedChanges={setSelectedChanges}
                            handleApproveAll={handleApproveAll}
                            handleRejectAll={handleRejectAll}
                            handleApprove={handleApprove}
                            handleReject={handleReject}
                            toggleChangeSelection={toggleChangeSelection}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="mt-4">
                <div className="p-6">
                  <CheckerLog checker={localStorage.getItem("token") || ""} />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
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
}
