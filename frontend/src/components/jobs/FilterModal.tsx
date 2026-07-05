"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  FilterIcon, 
  Search01Icon, 
  Location01Icon,
  Cancel01Icon
} from "@hugeicons/core-free-icons";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: { title: string; location: string }) => void;
  onClear: () => void;
  initialFilters: { title: string; location: string };
}

const locations = [
  "All Locations",
  "Delhi",
  "Mumbai",
  "Banglore",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Chennai",
  "Remote"
];

const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onClose, 
  onApply, 
  onClear,
  initialFilters 
}) => {
  const [title, setTitle] = useState(initialFilters.title);
  const [location, setLocation] = useState(initialFilters.location);

  const handleApply = () => {
    onApply({ title, location });
    onClose();
  };

  const handleClear = () => {
    setTitle("");
    setLocation("All Locations");
    onClear();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border border-gray-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-slate-900">
        <DialogHeader className="p-6 border-b border-gray-50 dark:border-slate-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HugeiconsIcon icon={FilterIcon} size={24} className="text-blue-600 dark:text-blue-400" />
            Filter Jobs
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <HugeiconsIcon icon={Search01Icon} size={18} />
              Search by job title
            </label>
            <Input 
              placeholder="Enter job title or company name" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              Location
            </label>
            <Select onValueChange={(val) => setLocation(val || "All Locations")} value={location}>
              <SelectTrigger className="h-12 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 transition-all text-gray-900 dark:text-white dark:bg-slate-950">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl max-h-[300px]">
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc} className="rounded-lg focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer py-2.5">
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-col gap-3 sm:flex-col">
            <Button 
                onClick={handleApply}
                className="w-full h-12 bg-gray-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white hover:bg-gray-800 rounded-xl font-bold transition-all"
            >
                Apply Filters
            </Button>
            <Button 
                variant="ghost" 
                onClick={handleClear}
                className="w-full h-12 text-gray-500 dark:text-slate-450 hover:text-red-500 dark:hover:text-red-405 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-semibold transition-all border border-dashed border-gray-200 dark:border-slate-800"
            >
                Clear All
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
