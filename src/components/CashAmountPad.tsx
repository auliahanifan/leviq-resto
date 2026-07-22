"use client";

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function CashAmountPad({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  function press(digit: string) {
    onChange(value === "0" || value === "" ? digit : value + digit);
  }

  function backspace() {
    onChange(value.slice(0, -1));
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => press(digit)}
          className="h-16 w-16 rounded-xl bg-zinc-100 text-2xl font-semibold active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
        >
          {digit}
        </button>
      ))}
      <div />
      <button
        type="button"
        onClick={() => press("0")}
        className="h-16 w-16 rounded-xl bg-zinc-100 text-2xl font-semibold active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
      >
        0
      </button>
      <button
        type="button"
        onClick={backspace}
        aria-label="Hapus"
        className="h-16 w-16 rounded-xl bg-zinc-100 text-xl font-semibold active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
      >
        ⌫
      </button>
    </div>
  );
}
