import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";

// ── Command Palette (Task 5) ──────────────────────────────────────────────────
import {
  CommandPaletteProvider,
  CommandPalette,
  useCommandPalette,
  registerDefaultMockCommands
} from "@features/command-palette";

/**
 * Mocks Registration — registers default command logic temporarily.
 * Must run inside <CommandPaletteProvider> to access the registry via hook.
 */
function CommandRegistrar() {
  const { registry } = useCommandPalette();

  useEffect(() => {
    // Đăng ký toàn bộ commands giả lập (mocks) mà không xâm phạm feature khác
    registerDefaultMockCommands(registry, router.navigate);
  }, [registry]);

  return null; // Component này chỉ chạy logic, không render UI
}

export default function App() {
  return (
    <CommandPaletteProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
      {/* Khởi chạy Logic đăng ký command */}
      <CommandRegistrar />
      {/* Hiển thị Giao diện Command Palette */}
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
