import { createPortal } from "react-dom";

export default function LoadingOverlay({
  message = "Actualizando información...",
  blockUI = false, 
}) {
  return createPortal(
    <div
      className={[
        "fixed inset-0 z-[9999] grid place-items-center",
        blockUI ? "bg-black/40 backdrop-blur-sm" : "bg-black/30 backdrop-blur-[1px] pointer-events-none",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div
        className="rounded-2xl px-8 py-6 shadow-2xl bg-[rgba(17,24,39,0.92)] text-white pointer-events-auto"
      >
        <div className="text-center">
          <div className="mb-3 text-lg font-semibold">{message}</div>
          <div className="h-1.5 w-56 overflow-hidden rounded bg-white/20">
            <div className="h-full w-1/3 animate-[loader_1.2s_linear_infinite] bg-white/70" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>,
    document.body
  );
}
