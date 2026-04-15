import { Loader2Icon } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2Icon className="size-16 animate-spin text-secondary" />
    </div>
  );
}
