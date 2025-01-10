import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDrawer } from "./NotificationDrawer";
import { Badge } from "@/components/ui/badge";

export function NotificationIcon() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Bell className="h-5 w-5" />
        <Badge 
          variant="default" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 hover:bg-red-600"
        >
          3
        </Badge>
      </Button>
      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}
