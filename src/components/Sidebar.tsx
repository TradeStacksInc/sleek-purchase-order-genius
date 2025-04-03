
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  ClipboardPlus, 
  ClipboardList, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Truck,
  FileText,
  Droplet,
  Settings,
  BarChart2,
  DollarSign,
  Database,
  Fuel,
  Users,
  Shield,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [openSections, setOpenSections] = useState({
    operations: true,
    inventory: true,
    financials: true,
    staff: true,
    management: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Toggle button for closed sidebar */}
      {!open && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setOpen(true)} 
          className="fixed top-20 left-4 z-30 shadow-md rounded-full bg-white hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-white w-64 shadow-md transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <h2 className="font-semibold text-lg text-sidebar-foreground">Fuel Station</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-sidebar-foreground">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1 py-6">
          <nav className="px-2 space-y-1">
            <NavItem to="/" icon={<BarChart className="h-5 w-5" />} text="Dashboard" />
            
            {/* Operations Section */}
            <CollapsibleSection 
              title="Operations" 
              isOpen={openSections.operations}
              onToggle={() => toggleSection('operations')}
            >
              <NavItem to="/create" icon={<ClipboardPlus className="h-5 w-5" />} text="Create New PO" />
              <NavItem to="/orders" icon={<ClipboardList className="h-5 w-5" />} text="Orders" />
              <NavItem to="/assign-driver" icon={<Truck className="h-5 w-5" />} text="Assign Driver" />
              <NavItem to="/delivery-log" icon={<FileText className="h-5 w-5" />} text="Delivery Log" />
              <NavItem to="/offload-log" icon={<Droplet className="h-5 w-5" />} text="Offload Log" />
            </CollapsibleSection>
            
            {/* Inventory Management Section */}
            <CollapsibleSection 
              title="Inventory Management" 
              isOpen={openSections.inventory}
              onToggle={() => toggleSection('inventory')}
            >
              <NavItem to="/tank-management" icon={<Database className="h-5 w-5" />} text="Tank Management" />
              <NavItem to="/dispenser-management" icon={<Fuel className="h-5 w-5" />} text="Dispenser Management" />
            </CollapsibleSection>
            
            {/* Financial Section */}
            <CollapsibleSection 
              title="Financials" 
              isOpen={openSections.financials}
              onToggle={() => toggleSection('financials')}
            >
              <NavItem to="/analytics" icon={<BarChart2 className="h-5 w-5" />} text="Financial Dashboard" />
              <NavItem to="/price-management" icon={<Tag className="h-5 w-5" />} text="Price Management" />
              <NavItem to="/sales-recording" icon={<DollarSign className="h-5 w-5" />} text="Sales Recording" />
            </CollapsibleSection>
            
            {/* Staff & Security Section */}
            <CollapsibleSection 
              title="Staff & Security" 
              isOpen={openSections.staff}
              onToggle={() => toggleSection('staff')}
            >
              <NavItem to="/staff-management" icon={<Users className="h-5 w-5" />} text="Staff Management" />
              <NavItem to="/logs" icon={<Activity className="h-5 w-5" />} text="Activity Log" />
              <NavItem to="/fraud-detection" icon={<Shield className="h-5 w-5" />} text="Fraud Detection" />
            </CollapsibleSection>
            
            {/* Management Section */}
            <CollapsibleSection 
              title="Management" 
              isOpen={openSections.management}
              onToggle={() => toggleSection('management')}
            >
              <NavItem to="/manage-trucks" icon={<Truck className="h-5 w-5" />} text="Truck Management" />
              <NavItem to="/gps-tracking" icon={<Truck className="h-5 w-5" />} text="GPS Tracking" />
            </CollapsibleSection>
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
    </>
  );
};

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  isOpen, 
  onToggle, 
  children 
}) => {
  return (
    <div className="pt-4 pb-2">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider flex items-center justify-between cursor-pointer hover:text-sidebar-foreground/80 transition-colors">
            {title}
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-1">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>
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
      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
      isActive 
        ? "bg-primary text-primary-foreground shadow-sm" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    {icon}
    <span className="ml-3">{text}</span>
  </NavLink>
);

export default Sidebar;
