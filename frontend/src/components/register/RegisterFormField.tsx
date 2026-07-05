"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

interface RegisterFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  icon: any;
}

const RegisterFormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  icon,
}: RegisterFormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }: { field: any; fieldState: any }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-slate-300">{label}</FormLabel>
          <FormControl>
            <div className="group">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                  <HugeiconsIcon icon={icon} size={18} />
                </div>
                <Input
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  value={type === "file" ? "" : (field.value as string) || ""}
                  onChange={(e) => {
                    if (type === "file") {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                    } else {
                      field.onChange(e.target.value);
                    }
                  }}
                  className={cn(
                    "pl-10 h-11 rounded-lg border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white focus-visible:ring-blue-600 transition-all",
                    fieldState.error && "border-red-500 focus-visible:ring-red-500",
                    type === "file" && "cursor-pointer"
                  )}
                />
              </div>
              {type === "file" && field.value instanceof File && (
                <div className="mt-2 flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm">
                    <HugeiconsIcon icon={icon} size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate">
                      {field.value.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Ready to upload
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      field.onChange(undefined);
                    }}
                    className="ml-auto p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors group/btn"
                    title="Remove file"
                  >
                    <div className="flex items-center gap-1">

                      <HugeiconsIcon icon={Cancel01Icon} size={18} />
                    </div>
                  </button>
                </div>
              )}
            </div>


          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default RegisterFormField;
