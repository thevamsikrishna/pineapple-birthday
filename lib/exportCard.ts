/**
 * Client-side birthday card export: draws a 1080×1350 card on a canvas and triggers a PNG
 * download. No server, no upload, no tracking.
 */
export interface CardCopy {
  title: string;
  body: string;
  signature: string;
}

export function drawCard(canvas: HTMLCanvasElement, copy: CardCopy) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#16152E");
  sky.addColorStop(0.55, "#3b2f6e");
  sky.addColorStop(1, "#8f7be3");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // stars
  for (let i = 0; i < 160; i++) {
    const x = (i * 613) % W;
    const y = (i * 379) % (H * 0.7);
    const r = 1 + ((i * 7) % 3);
    ctx.globalAlpha = 0.35 + ((i * 13) % 10) / 15;
    ctx.fillStyle = i % 3 ? "#FFF5DF" : "#D8CDFB";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 10, W / 2, H * 0.42, 420);
  glow.addColorStop(0, "rgba(255,215,94,0.35)");
  glow.addColorStop(1, "rgba(255,215,94,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // pineapple
  ctx.save();
  ctx.translate(W / 2, H * 0.36);
  for (const a of [-44, -18, 8, 34]) {
    ctx.save();
    ctx.rotate((a * Math.PI) / 180);
    ctx.fillStyle = "#8FD2AF";
    ctx.beginPath();
    ctx.moveTo(0, -120);
    ctx.bezierCurveTo(-30, -190, -14, -250, 10, -290);
    ctx.bezierCurveTo(44, -240, 34, -180, 0, -120);
    ctx.fill();
    ctx.restore();
  }
  const body = ctx.createLinearGradient(0, -140, 0, 120);
  body.addColorStop(0, "#FFE58F");
  body.addColorStop(1, "#F2B443");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, -10, 120, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(217,154,44,0.7)";
  ctx.lineWidth = 3;
  for (let d = -400; d < 400; d += 34) {
    ctx.beginPath();
    ctx.moveTo(d - 300, -300);
    ctx.lineTo(d + 300, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(d + 300, -300);
    ctx.lineTo(d - 300, 300);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  // card panel
  const panelY = H * 0.56;
  roundRect(ctx, 90, panelY, W - 180, H - panelY - 90, 44);
  ctx.fillStyle = "rgba(255,245,223,0.96)";
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#29223D";
  ctx.font = "600 72px Fraunces, 'Cormorant Garamond', Georgia, serif";
  wrapText(ctx, copy.title, W / 2, panelY + 120, W - 320, 80);
  ctx.font = "400 36px 'Nunito Sans', 'DM Sans', system-ui, sans-serif";
  ctx.fillStyle = "#4a4262";
  wrapText(ctx, copy.body, W / 2, panelY + 250, W - 300, 52);
  ctx.font = "italic 500 40px Fraunces, Georgia, serif";
  ctx.fillStyle = "#29223D";
  ctx.fillText(copy.signature, W / 2, H - 170);
  ctx.font = "700 22px 'Nunito Sans', system-ui, sans-serif";
  ctx.fillStyle = "#9c87e8";
  ctx.fillText("04 · 02 · 1999  ·  PINEAPPLEVERSE", W / 2, H - 120);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

export async function downloadCard(copy: CardCopy, filename = "happy-birthday-pineapple.png"): Promise<boolean> {
  if (typeof document === "undefined") return false;
  try {
    if ("fonts" in document) await (document as Document & { fonts: FontFaceSet }).fonts.ready;
  } catch {
    /* fonts are optional */
  }
  const canvas = document.createElement("canvas");
  drawCard(canvas, copy);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}
