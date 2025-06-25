import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const websites = [
  { value: "medium", label: "Medium" },
  { value: "wix", label: "Wix" },
  { value: "devto", label: "Dev.to" },
];

interface WebsiteSelectorProps {
  onWebsiteSelect: (websites: string[]) => void; // Changed to array
  selectedWebsites: string[]; // Changed to array
}

const WebsiteSelector = ({
  onWebsiteSelect,
  selectedWebsites,
}: WebsiteSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Display selected websites or placeholder
  const selectedLabels = websites
    .filter((website) => selectedWebsites.includes(website.value))
    .map((website) => website.label)
    .join(", ") || "Select websites";

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Select Websites</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedLabels}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]">
          <Command>
            <CommandInput placeholder="Search websites..." />
            <CommandList>
              <CommandEmpty>No website found.</CommandEmpty>
              <CommandGroup>
                {websites.map((website) => (
                  <CommandItem
                    key={website.value}
                    value={website.value}
                    onSelect={() => {
                      // Toggle selection
                      const newSelected = selectedWebsites.includes(website.value)
                        ? selectedWebsites.filter((w) => w !== website.value)
                        : [...selectedWebsites, website.value];
                      onWebsiteSelect(newSelected);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWebsites.includes(website.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {website.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default WebsiteSelector;


