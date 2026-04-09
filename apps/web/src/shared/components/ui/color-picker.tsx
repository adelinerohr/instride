import { Paintbrush } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { Button } from "./button";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function ColorPicker({
  background,
  setBackground,
  className,
}: {
  background: string;
  setBackground: (background: string) => void;
  className?: string;
}) {
  const solids = [
    "#E2E2E2",
    "#ff75c3",
    "#ffa647",
    "#ffe83f",
    "#9fff5b",
    "#70e2ff",
    "#cd93ff",
    "#09203f",
  ];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-[220px] justify-start text-left font-normal",
              !background && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <div className="flex w-full items-center gap-2">
          {background ? (
            <div
              className="size-4 rounded bg-cover! bg-center! transition-all"
              style={{ background }}
            ></div>
          ) : (
            <Paintbrush className="size-4" />
          )}
          <div className="flex-1 truncate">
            {background ? background : "Pick a color"}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-wrap gap-1">
          {solids.map((s) => (
            <div
              key={s}
              style={{ background: s }}
              className="size-6 cursor-pointer rounded-md active:scale-105"
              onClick={() => setBackground(s)}
            />
          ))}
        </div>
        <Input
          id="custom"
          value={background}
          className="col-span-2 h-8"
          onChange={(e) => setBackground(e.currentTarget.value)}
        />
      </PopoverContent>
    </Popover>
  );
}

function convertHexToRGBA(hexCode: string, opacity = 1) {
  let hex = hexCode.replace("#", "");

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  /* Backward compatibility for whole number based opacity values. */
  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100;
  }

  return `rgba(${r},${g},${b},${opacity})`;
}

export { ColorPicker, convertHexToRGBA };
