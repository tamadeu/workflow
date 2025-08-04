import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, Ticket, Users, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomMenuProps {
  onMenuToggle: () => void;
}

export default function BottomMenu({ onMenuToggle }: BottomMenuProps) {
  const [location] = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      testId: "bottom-nav-dashboard"
    },
    {
      name: "Chamados",
      href: "/my-tickets",
      icon: Ticket,
      testId: "bottom-nav-tickets"
    },
    {
      name: "Novo",
      href: "/new-ticket",
      icon: Plus,
      testId: "bottom-nav-new",
      isCenter: true
    },
    {
      name: "Clientes",
      href: "/clients",
      icon: Users,
      testId: "bottom-nav-clients"
    },
    {
      name: "Menu",
      href: "#",
      icon: Menu,
      testId: "bottom-nav-menu",
      isMenu: true
    }
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.isMenu) {
      onMenuToggle();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-pb">
      <div className="grid grid-cols-5 h-16 items-center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href !== "#" && location === item.href;
          
          if (item.isCenter) {
            return (
              <div key={item.name} className="flex justify-center">
                <Link href={item.href}>
                  <Button
                    data-testid={item.testId}
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary-600 shadow-lg"
                    size="sm"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </Button>
                </Link>
              </div>
            );
          }

          return item.isMenu ? (
            <div key={item.name} className="flex justify-center">
              <button
                data-testid={item.testId}
                onClick={() => handleMenuClick(item)}
                className="flex flex-col items-center justify-center py-2 px-2"
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 mb-1",
                    "text-gray-500"
                  )} 
                />
                <span className={cn(
                  "text-xs text-center",
                  "text-gray-500"
                )}>
                  {item.name}
                </span>
              </button>
            </div>
          ) : (
            <div key={item.name} className="flex justify-center">
              <Link href={item.href}>
                <button
                  data-testid={item.testId}
                  className="flex flex-col items-center justify-center py-2 px-2"
                >
                  <Icon 
                    className={cn(
                      "w-5 h-5 mb-1",
                      isActive ? "text-primary" : "text-gray-500"
                    )} 
                  />
                  <span className={cn(
                    "text-xs text-center",
                    isActive ? "text-primary font-medium" : "text-gray-500"
                  )}>
                    {item.name}
                  </span>
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}