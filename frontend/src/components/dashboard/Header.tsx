import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.png";
import { UserMenu } from "./UserMenu";
import { NotificationIcon } from "./NotificationIcon";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export const Header = ({
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
}: HeaderProps) => (
  <header className="bg-white shadow-md p-4 flex items-center justify-between w-full">
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-4"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <img src={logo} alt="Sundaram Logo" className="w-[50%] mr-2" />
    </div>
    <div className="flex items-center space-x-4">
      <NotificationIcon />
      <UserMenu handleLogout={handleLogout} />
    </div>
  </header>
);
