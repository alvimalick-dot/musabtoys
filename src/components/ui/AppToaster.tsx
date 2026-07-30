"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      offset={72}
      toastOptions={{
        className: "font-sans",
      }}
    />
  );
}
