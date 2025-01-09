import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationDrawer } from "./NotificationDrawer";

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
      </Button>
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
