"use client";

import { Delete } from "lucide-react";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

type PinPadProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
};

export function PinPad({ value, onChange, length = 4 }: PinPadProps) {
  function press(digit: string) {
    if (value.length < length) onChange(value + digit);
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-primary ${
              i < value.length ? "bg-primary" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {DIGITS.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => press(digit)}
            className="h-20 w-20 rounded-2xl bg-surface text-2xl font-semibold active:bg-border"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => press("0")}
          className="h-20 w-20 rounded-2xl bg-surface text-2xl font-semibold active:bg-border"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          aria-label="Hapus"
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface active:bg-border"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
