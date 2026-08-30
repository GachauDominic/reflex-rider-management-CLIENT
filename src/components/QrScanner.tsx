import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const CONFIRMATION_CODE_REGEX = /^REF-DEL-[A-F0-9]{8}-[A-F0-9]{4}$/;

/**
 * Scans a delivery's confirmationCode via the device camera. This is a
 * convenience layer over the same string a rider can type manually
 * (see ConfirmDeliveryModal's fallback input) — the backend treats both
 * identically and independently re-validates delivery id, rider
 * identity, and status regardless of how the code arrived (see
 * confirmationCode.ts).
 *
 * Camera access commonly fails (no permission, no HTTPS, no camera,
 * low-end device) — callers MUST pair this with a manual text input,
 * never rely on scanning being the only path to confirm a delivery.
 */
export function QrScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void;
  onError?: (message: string) => void;
}) {
  const elementId = useId().replace(/:/g, "-");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "failed">("starting");

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    scannerRef.current = scanner;
    let cancelled = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Only surface text that actually looks like a Reflex code —
          // a rider's phone can pick up any QR code pointed at it, not
          // just ones this app generated.
          const candidate = decodedText.trim().toUpperCase();
          if (CONFIRMATION_CODE_REGEX.test(candidate)) {
            onScan(candidate);
          }
        },
        () => {
          // Per-frame "no code found" callback — expected constantly
          // while the camera is pointed at anything else. Not an error.
        }
      )
      .then(() => {
        if (!cancelled) setStatus("scanning");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("failed");
        onError?.(err instanceof Error ? err.message : "Could not start the camera");
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // Already stopped/never started — nothing to clean up.
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onScan/onError are event callbacks, not reactive inputs to the scan session
  }, [elementId]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div id={elementId} className="w-full max-w-[280px] overflow-hidden rounded-box border border-base-300" />
      {status === "starting" && <p className="text-sm text-base-content/60">Requesting camera access…</p>}
      {status === "failed" && (
        <p className="text-sm text-warning">
          Camera unavailable — use the code field below instead.
        </p>
      )}
    </div>
  );
}
