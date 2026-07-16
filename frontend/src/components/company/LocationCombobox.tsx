"use client";

import React, { useState, useMemo, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Search01Icon, 
  Tick02Icon, 
  UnfoldMoreIcon,
  Location01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import majorCities from "@/data/major-cities.json";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Clear search query when popover closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between border-gray-200 bg-white hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500 transition-all text-gray-900 dark:text-gray-300 dark:bg-slate-900 px-3 py-2 text-left font-normal text-xs/relaxed whitespace-nowrap outline-none cursor-pointer",
            className
          )}
          onClick={(e) => {
            if (disabled) e.preventDefault();
          }}
        >
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            className="ml-2 h-4 w-4 shrink-0 opacity-50 text-gray-500"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--anchor-width] p-0 bg-white dark:bg-slate-900 shadow-md ring-1 ring-foreground/10 border border-gray-100 dark:border-slate-800 rounded-lg overflow-hidden isolate z-50">
        <div className="flex items-center border-b border-gray-100 dark:border-slate-800 px-3 h-10 gap-2">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-full w-full bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground text-gray-900 dark:text-gray-300 border-none"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-gray-100 dark:hover:bg-slate-800 text-left text-gray-900 dark:text-gray-300 transition-colors",
                  option.value === value && "bg-blue-50/50 dark:bg-blue-950/20 font-medium"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {option.value === value && (
                  <HugeiconsIcon icon={Tick02Icon} className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface LocationComboboxProps {
  form: UseFormReturn<any>;
}

export const LocationCombobox: React.FC<LocationComboboxProps> = ({ form }) => {
  // Extract unique states sorted alphabetically
  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(new Set(majorCities.map((item) => item.state)));
    return uniqueStates
      .sort((a, b) => a.localeCompare(b))
      .map((state) => ({ value: state, label: state }));
  }, []);

  const selectedState = form.watch("state");

  // Get cities for selected state sorted alphabetically
  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    const filtered = majorCities.filter((item) => item.state === selectedState);
    const uniqueCities = Array.from(new Set(filtered.map((item) => item.city)));
    return uniqueCities
      .sort((a, b) => a.localeCompare(b))
      .map((city) => ({ value: city, label: city }));
  }, [selectedState]);

  return (
    <>
      {/* State Selection */}
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              State
            </FormLabel>
            <FormControl>
              <Combobox
                options={stateOptions}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Reset city selection to avoid invalid combinations
                  form.setValue("city", "");
                  form.trigger("state");
                  form.trigger("city");
                }}
                placeholder="Select state..."
                searchPlaceholder="Search state..."
                emptyMessage="No states found."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City Selection */}
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold mb-1 dark:text-gray-300">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              City
            </FormLabel>
            <FormControl>
              <Combobox
                options={cityOptions}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  form.trigger("city");
                }}
                placeholder={selectedState ? "Select city..." : "Select state first"}
                searchPlaceholder="Search city..."
                emptyMessage="No cities found."
                disabled={!selectedState}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
