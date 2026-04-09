import { TrashIcon, UploadIcon } from "lucide-react";
import * as React from "react";

import { useFileUpload } from "@/shared/hooks/use-file-upload";
import { cn } from "@/shared/lib/utils";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type AvatarUploadProps = React.ComponentProps<"div"> & {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string>; // returns the new URL
  onRemove?: () => Promise<void>;
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
  placeholder?: React.ReactNode;
  disabled?: boolean;
  maxSize?: number;
  label?: string;
  hint?: string;
};

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

function AvatarUpload({
  className,
  currentUrl,
  maxSize = 1024 * 1024 * 5, // 5MB
  onUpload,
  onRemove,
  shape = "circle",
  size = "md",
  placeholder,
  disabled = false,
  label = "Upload your image",
  hint = "*.png, *.jpeg files up to 5 MB",
  ...props
}: AvatarUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentUrl ?? null
  );

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    onFilesAdded: async ([fileWithPreview]) => {
      const file = fileWithPreview.file as File;
      setPreviewUrl(fileWithPreview.preview ?? null);

      setUploading(true);
      try {
        const url = await onUpload(file);
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(currentUrl ?? null); // revert on error
      } finally {
        setUploading(false);
      }
    },
  });

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onRemove?.();
    setPreviewUrl(null);
  };

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative">
        <div
          className={cn(
            "aspect-square p-0.5 shrink-0 cursor-pointer border border-dashed border-gray-300 bg-muted hover:bg-muted/60",
            "flex items-center justify-center overflow-hidden hover:border-foreground",
            shape === "circle" ? "rounded-full" : "rounded-md",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            sizeClasses[size],
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/20",
            previewUrl && "border-solid"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input {...getInputProps()} className="sr-only" />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className={cn(
                "size-full object-cover",
                shape === "circle" ? "rounded-full" : "rounded-md"
              )}
            />
          ) : (
            <UploadIcon className="text-muted-foreground h-5 w-5" />
          )}
        </div>
        {previewUrl && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-1 -right-1 z-10 size-8 rounded-full bg-background opacity-100!"
                  onClick={handleRemove}
                />
              }
            >
              <TrashIcon className="size-4 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="right">Remove image</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );

  // return (
  //   <div
  //     className={cn("flex flex-col items-center gap-4", className)}
  //     {...props}
  //   >
  //     {/* Avatar Preview */}
  //     <div className="relative">
  //       <div
  //         className={cn(
  //           "group/avatar relative cursor-pointer overflow-hidden border border-dashed transition-colors",
  //           sizeClasses[size],
  //           shapeClass,
  //           isDragging
  //             ? "border-primary bg-primary/5"
  //             : "border-muted-foreground/25 hover:border-muted-foreground/20",
  //           previewUrl && "border-solid"
  //         )}
  //         onDragEnter={handleDragEnter}
  //         onDragLeave={handleDragLeave}
  //         onDragOver={handleDragOver}
  //         onDrop={handleDrop}
  //         onClick={openFileDialog}
  //       >
  //         <input {...getInputProps()} className="sr-only" />

  //         {previewUrl ? (
  //           <img
  //             src={previewUrl}
  //             alt="Avatar"
  //             className="h-full w-full object-cover"
  //           />
  //         ) : (
  //           <div className="flex h-full w-full items-center justify-center">
  //             {placeholder ?? (
  //               <UserIcon className="text-muted-foreground size-6" />
  //             )}
  //           </div>
  //         )}

  //         {/* uploading overlay */}
  //         {uploading && (
  //           <div className="absolute inset-0 flex items-center justify-center bg-black/40">
  //             <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
  //           </div>
  //         )}

  //         {/* hover overlay */}
  //         {!uploading && previewUrl && (
  //           <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
  //             <UploadIcon className="size-5 text-white opacity-0 transition-opacity hover:opacity-100" />
  //           </div>
  //         )}
  //       </div>

  //       {/* Remove Button - only show when file is uploaded */}
  //       {previewUrl && (
  //         <Button
  //           size="icon"
  //           variant="outline"
  //           onClick={handleRemove}
  //           className="absolute inset-e-0.5 top-0.5 z-10 size-6 rounded-full dark:bg-zinc-800 hover:dark:bg-zinc-700"
  //           aria-label="Remove avatar"
  //         >
  //           <XIcon className="size-3.5" />
  //         </Button>
  //       )}
  //     </div>

  //     {/* Upload Instructions */}
  //     <div className="space-y-0.5 text-center">
  //       <p className="text-sm font-medium">
  //         {previewUrl ? "Avatar uploaded" : "Upload avatar"}
  //       </p>
  //       <p className="text-muted-foreground text-xs">
  //         PNG, JPG up to {formatBytes(maxSize)}
  //       </p>
  //     </div>

  //     {/* Error Messages */}
  //     {errors.length > 0 && (
  //       <Alert variant="destructive" className="mt-5">
  //         <CircleAlertIcon />
  //         <AlertTitle>File upload error(s)</AlertTitle>
  //         <AlertDescription>
  //           {errors.map((error, index) => (
  //             <p key={index} className="last:mb-0">
  //               {error}
  //             </p>
  //           ))}
  //         </AlertDescription>
  //       </Alert>
  //     )}
  //   </div>
  // );
}

export { AvatarUpload };
