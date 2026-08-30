import { QRCodeSVG } from "qrcode.react";

/**
 * The QR encodes the delivery's confirmationCode — the same string a
 * rider can type manually via ConfirmDeliveryForm. The backend treats
 * both paths identically (see confirmationCode.ts: "the code itself is
 * not a security boundary"), so this is purely a handoff convenience,
 * not a distinct auth mechanism.
 */
export function ConfirmationQr({ code, size = 160 }: { code: string; size?: number }) {
  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-box border border-base-300 bg-base-100 p-4">
      <QRCodeSVG value={code} size={size} bgColor="transparent" fgColor="#12131a" level="M" />
      <p className="font-mono text-xs tracking-wide text-base-content/70">{code}</p>
    </div>
  );
}
