import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CheckerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Check if we're on a table detail page
  const isTableDetail = currentPath.includes("/checker/table/");

  // Determine active tab
  const activeTab = currentPath === "/checker/history" ? "history" : "overview";

  return (
    <Layout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto">
        <div className="space-y-8 p-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A237E]">
              Hello,{" "}
              <span className="text-[#00BFA5]">
                {localStorage.getItem("firstName") || "Checker"}
              </span>
            </h1>
            {!isTableDetail && (
              <p className="text-[#212121] mt-2">
                Summary of pending changes across all tables
              </p>
            )}
          </div>

          {/* Only show tabs on main pages */}
          {!isTableDetail && (
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={(value) =>
                navigate(value === "history" ? "/checker/history" : "/checker")
              }
            >
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className={!isTableDetail ? "mt-6" : ""}>
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckerPage;
