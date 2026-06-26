import { BarChart3, CalendarDays, Gauge, Landmark, LineChart, NotebookPen, Settings, WalletCards } from "lucide-react";

export const appNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/journal", label: "Trade Journal", icon: NotebookPen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/psychology", label: "Psychology", icon: LineChart },
  { href: "/payouts", label: "Payouts", icon: WalletCards },
  { href: "/settings", label: "Settings", icon: Settings }
];
