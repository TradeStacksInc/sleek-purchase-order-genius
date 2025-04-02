
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  ClipboardPlus, 
  ClipboardList, 
  Activity,
  ChevronLeft,
  Truck,
  FileText,
  Droplet,
  Settings,
  BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-20 flex flex-col bg-white w-64 shadow-md transition-transform duration-300 ease-in-out",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-lg text-sidebar-foreground">PO System</h2>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-sidebar-foreground">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-6">
        <nav className="px-2 space-y-1">
          <NavItem to="/" icon={<BarChart className="h-5 w-5" />} text="Dashboard" />
          <NavItem to="/create" icon={<ClipboardPlus className="h-5 w-5" />} text="Create New PO" />
          <NavItem to="/orders" icon={<ClipboardList className="h-5 w-5" />} text="Orders" />
          <NavItem to="/assign-driver" icon={<Truck className="h-5 w-5" />} text="Assign Driver" />
          <NavItem to="/delivery-log" icon={<FileText className="h-5 w-5" />} text="Delivery Log" />
          <NavItem to="/offload-log" icon={<Droplet className="h-5 w-5" />} text="Offload Log" />
          <NavItem to="/logs" icon={<Activity className="h-5 w-5" />} text="Activity Log" />
          
          <div className="pt-4 pb-2">
            <div className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Management
            </div>
          </div>
          
          <NavItem to="/manage-trucks" icon={<Truck className="h-5 w-5" />} text="Truck Management" />
          <NavItem to="/analytics" icon={<BarChart2 className="h-5 w-5" />} text="Analytics" />
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-sidebar-foreground/60">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
      isActive 
        ? "bg-primary text-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    {icon}
    <span className="ml-3">{text}</span>
  </NavLink>
);

export default Sidebar;
