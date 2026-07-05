"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Briefcase02Icon,
  InformationCircleIcon,
  Menu01Icon,
  UserCircleIcon,
  Sun01Icon,
  Moon01Icon,
  ComputerIcon,
  Logout01Icon,
  UserIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "@/components/theme-provider";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: any;
}

// ─── Configuration ───────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home01Icon },
  { label: "Jobs", href: "/jobs", icon: Briefcase02Icon },
  { label: "About", href: "/about", icon: InformationCircleIcon },
];

const MOBILE_EXTRA_ITEMS: NavItem[] = [
  { label: "Profile", href: "/profile", icon: UserCircleIcon },
  { label: "Settings", href: "/settings", icon: Settings02Icon },
  { label: "logout", href: "", icon: Logout01Icon },
];

// ─── Components ──────────────────────────────────────────────────────────────

const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-0 text-xl font-bold tracking-tight select-none"
    aria-label="HireHeaven - Home"
  >
    <span className="text-blue-600">Hire</span>
    <span className="text-red-500">Heaven</span>
  </Link>
);

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun01Icon },
  { value: "dark" as const, label: "Dark", icon: Moon01Icon },
  { value: "system" as const, label: "System", icon: ComputerIcon },
];

function ThemeToggle({ align = "end" }: { align?: "start" | "end" }) {
  const { theme, setTheme } = useTheme();

  const activeIcon =
    theme === "dark" ? Moon01Icon : theme === "light" ? Sun01Icon : ComputerIcon;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          />
        }
      >
        <HugeiconsIcon icon={activeIcon} size={20} />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-36 p-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl"
      >
        <div className="flex flex-col gap-0.5">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2.5",
                theme === opt.value
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              )}
            >
              <HugeiconsIcon icon={opt.icon} size={15} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Main Navbar Component
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800/80"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">

          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Desktop navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    active
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <HugeiconsIcon icon={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Actions & Mobile Nav */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">

              {/* Theme Toggle (Desktop) */}
              <ThemeToggle align="end" />

              {isAuthenticated ? (
                /* User Avatar with Popover */
                <Popover>
                  <PopoverTrigger
                    nativeButton={false}
                    render={
                      <Avatar className="h-9 w-9 border border-gray-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500/30 dark:hover:ring-blue-400/20 transition-all select-none">
                        <AvatarImage src={user?.profile_pic} alt={user?.name} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    }
                  />
                  <PopoverContent
                    align="end"
                    className="w-56 p-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl"
                  >
                    {/* User info header */}
                    <div className="px-3 py-2.5 border-b border-gray-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">{user?.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <HugeiconsIcon icon={UserIcon} size={16} />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <HugeiconsIcon icon={Settings02Icon} size={16} />
                        Settings
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-slate-800 mx-1 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={Logout01Icon} size={16} />
                        Logout
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                /* Sign In Button */
                <Link href="/login">
                  <Button className="bg-[#0f172a] hover:bg-[#1e293b] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white border-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    <HugeiconsIcon icon={UserIcon} size={18} />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden flex items-center gap-1">
              {/* Theme Toggle (Mobile) */}
              <ThemeToggle align="end" />

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                      aria-label="Open Menu"
                    />
                  }
                >
                  <HugeiconsIcon icon={Menu01Icon} size={24} />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] p-0 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800"
                >
                  <SheetHeader className="p-6 border-b border-gray-100 dark:border-slate-800 text-left">
                    <SheetTitle
                      render={
                        <div className="flex items-center">
                          <Logo />
                        </div>
                      }
                    />
                  </SheetHeader>
                  <div className="flex flex-col gap-1 p-4">
                    {NAV_ITEMS.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            active
                              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                              : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <HugeiconsIcon icon={item.icon} size={20} />
                          {item.label}
                        </Link>
                      );
                    })}

                    <div className="my-2 h-px bg-gray-100 dark:bg-slate-800" />

                    {isAuthenticated ? (
                      MOBILE_EXTRA_ITEMS.map((item) => {
                        if (item.label.toLowerCase() === "logout") {
                          return (
                            <button
                              key={item.label}
                              onClick={() => { handleLogout(); setIsOpen(false); }}
                              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full text-left cursor-pointer"
                            >
                              <HugeiconsIcon icon={item.icon} size={20} />
                              <span className="capitalize">{item.label}</span>
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <HugeiconsIcon icon={item.icon} size={20} />
                            {item.label}
                          </Link>
                        );
                      })
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                      >
                        <HugeiconsIcon icon={UserIcon} size={20} />
                        Sign In
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}