/**
 * PeriodSelector
 * Dropdown to select analytics period: 7d, 30d, 90d, or custom range.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PeriodSelectorProps {
  currentLabel: string;
  onPeriodChange: (days: number, label: string) => void;
  onCustomRange: (from: Date, to: Date) => void;
}

const PERIODS = [
  { label: "7d", days: 7, display: "7 dias" },
  { label: "30d", days: 30, display: "30 dias" },
  { label: "90d", days: 90, display: "90 dias" },
];

export default function PeriodSelector({
  currentLabel,
  onPeriodChange,
  onCustomRange,
}: PeriodSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      onCustomRange(customFrom, customTo);
      setShowCalendar(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PERIODS.map((p) => (
        <Button
          key={p.label}
          size="sm"
          variant={currentLabel === p.label ? "default" : "outline"}
          onClick={() => onPeriodChange(p.days, p.label)}
        >
          {p.display}
        </Button>
      ))}

      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={currentLabel === "custom" ? "default" : "outline"}
            className="gap-1"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">De:</p>
              <Calendar
                mode="single"
                selected={customFrom}
                onSelect={setCustomFrom}
                locale={ptBR}
                className={cn("p-2 pointer-events-auto")}
                disabled={(date) => date > new Date()}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Até:</p>
              <Calendar
                mode="single"
                selected={customTo}
                onSelect={setCustomTo}
                locale={ptBR}
                className={cn("p-2 pointer-events-auto")}
                disabled={(date) => date > new Date() || (customFrom ? date < customFrom : false)}
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={!customFrom || !customTo}
              onClick={handleApplyCustom}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
