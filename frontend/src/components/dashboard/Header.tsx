import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.png";
import { UserMenu } from "./UserMenu";
import { NotificationIcon } from "./NotificationIcon";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
}) => (
  <header className="sticky top-0 z-30 bg-white shadow-md ">
    <div className="flex h-16 items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hover:bg-gray-100"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </Button>
        <img src={logo} alt="Sundaram Logo" className="h-12" />
      </div>
      <div className="flex items-center gap-4">
        <NotificationIcon />
        <UserMenu handleLogout={handleLogout} />
      </div>
    </div>
  </header>
);
