import { Briefcase, Building2, CreditCard, LayoutDashboard, Settings, Users, CheckSquare, Target, Wallet, FolderKanban, ShieldCheck, Mail, Zap, LibraryBig } from "lucide-react";

export type Workspace = "sales" | "delivery" | "finance" | "directory" | "settings" | "inbox" | "dashboard";

export interface NavItem {
  name: string;
  href: string;
  icon: any; // Lucide icon
  exact?: boolean;
}

export interface NavGroup {
  name?: string;
  items: NavItem[];
}

export interface WorkspaceConfig {
  id: Workspace;
  name: string;
  icon: any;
  defaultPath: string;
  requiredRole?: string; // e.g., 'admin', 'finance'
  groups: NavGroup[];
}

export const workspacesConfig: Record<Workspace, WorkspaceConfig> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    defaultPath: "/dashboard",
    groups: [
      {
        items: [
          { name: "Executive Overview", href: "/dashboard", icon: LayoutDashboard },
        ]
      }
    ]
  },
  sales: {
    id: "sales",
    name: "Sales",
    icon: Target,
    defaultPath: "/sales/leads",
    groups: [
      {
        items: [
          { name: "Website Leads", href: "/sales/leads", icon: Zap },
          { name: "Pipeline", href: "/sales/pipeline", icon: Target },
          { name: "Proposals", href: "/sales/proposals", icon: Mail },
        ]
      }
    ]
  },
  delivery: {
    id: "delivery",
    name: "Delivery",
    icon: CheckSquare,
    defaultPath: "/delivery/projects",
    groups: [
      {
        items: [
          { name: "Projects", href: "/delivery/projects", icon: FolderKanban },
          { name: "Reviews Queue", href: "/delivery/reviews", icon: ShieldCheck },
        ]
      }
    ]
  },
  finance: {
    id: "finance",
    name: "Finance",
    icon: Wallet,
    defaultPath: "/finance",
    requiredRole: "admin", // Assuming only admin/finance roles can see this
    groups: [
      {
        items: [
          { name: "Invoices", href: "/finance", icon: CreditCard },
          { name: "Payments", href: "/finance/payments", icon: Wallet },
        ]
      }
    ]
  },
  directory: {
    id: "directory",
    name: "Directory",
    icon: Building2,
    defaultPath: "/directory/organizations",
    groups: [
      {
        items: [
          { name: "Organizations", href: "/directory/organizations", icon: Building2 },
          { name: "Contacts", href: "/directory/contacts", icon: Users },
        ]
      }
    ]
  },
  inbox: {
    id: "inbox",
    name: "Inbox",
    icon: Mail,
    defaultPath: "/inbox",
    groups: [
      {
        items: [
          { name: "Notifications", href: "/inbox", icon: Mail },
        ]
      }
    ]
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: Settings,
    defaultPath: "/settings/services",
    requiredRole: "admin",
    groups: [
      {
        name: "System",
        items: [
          { name: "Services Catalog", href: "/settings/services", icon: LibraryBig },
          { name: "Automations", href: "/settings/automations", icon: Zap },
        ]
      }
    ]
  }
};

export const WORKSPACE_LIST = Object.values(workspacesConfig);
