"use client";

import { useMemo } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { DayAvailability } from "@/lib/types";

type DateSelectorProps = {
  days: DayAvailability[];
  selectedDate?: string;
  onSelect: (date: string) => void;
  loading?: boolean;
  monthDate: Date;
  monthOptions: Array<{
    label: string;
    active: boolean;
    onSelect: () => void;
  }>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DateSelector({
  days,
  selectedDate,
  onSelect,
  loading,
  monthDate,
  monthOptions,
  onPrevMonth,
  onNextMonth,
}: DateSelectorProps) {
  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const monthTitle = capitalize(format(monthDate, "MMMM yyyy", { locale: es }));
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const leadingBlanks = (getDay(monthStart) + 6) % 7;
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...eachDayOfInterval({ start: monthStart, end: monthEnd }),
  ];
  const trailingBlanks = (7 - (cells.length % 7)) % 7;
  const paddedCells = [...cells, ...Array.from({ length: trailingBlanks }, () => null)];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Selecciona la fecha
          </h2>
          <p className="text-text-secondary">Cargando disponibilidad...</p>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-bg-tertiary animate-pulse h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Selecciona la fecha
        </h2>
        <p className="text-text-secondary">Elige el día que mejor te convenga</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {monthOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={option.onSelect}
              className={[
                "px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all",
                option.active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-text-secondary border border-border hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary">{monthTitle}</h3>
        <p className="text-sm text-text-secondary">Puedes rotar entre este mes y los dos siguientes</p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-text-muted uppercase tracking-wide">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-1">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {paddedCells.map((cell, index) => {
          if (!cell) {
            return <div key={`blank-${index}`} className="h-24 rounded-xl border border-dashed border-border/60 bg-white/40" />;
          }

          const day = dayMap.get(format(cell, "yyyy-MM-dd"));
          if (!day) {
            return <div key={format(cell, "yyyy-MM-dd")} className="h-24 rounded-xl border border-dashed border-border/60 bg-white/40" />;
          }

          const isSelected = selectedDate === day.date;
          const isDisabled = !day.available;

          return (
            <button
              key={day.date}
              onClick={() => !isDisabled && onSelect(day.date)}
              disabled={isDisabled}
              className={`relative p-3 rounded-xl border-2 text-center transition-all min-h-24 ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-lg"
                  : isDisabled
                  ? "border-border bg-bg-tertiary text-text-muted cursor-not-allowed"
                  : "border-border bg-white hover:border-primary"
              }`}
            >
              <div
                className={`text-xs font-medium uppercase ${
                  isSelected ? "text-white/80" : "text-text-muted"
                }`}
              >
                {day.label.split(" ")[0]}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  isSelected ? "text-white" : isDisabled ? "text-text-muted" : "text-text-primary"
                }`}
              >
                {day.label.split(" ")[1]}
              </div>
              <div className="mt-2 flex justify-center">
                {isDisabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase">
                    <X className="w-3 h-3" /> Cerrado
                  </span>
                ) : day.status === "few" ? (
                  <span
                    className={`text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-warning"
                    }`}
                  >
                    Pocos
                  </span>
                ) : day.status === "full" ? (
                  <span
                    className={`text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-error"
                    }`}
                  >
                    Lleno
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-success"
                    }`}
                  >
                    <Check className="w-3 h-3" /> {day.slotsCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          Pocos turnos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-error" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}
