import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type PdfLineItem = {
  name: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type PdfCustomer = {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
};

type PdfBusiness = {
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  website: string;
};

export type PdfDocumentData = {
  kind: "quotation" | "receipt";
  number: string;
  status: string;
  issueDate: string;
  validUntil?: string | null;
  orderNumber?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  customer: PdfCustomer;
  business: PdfBusiness;
  items: PdfLineItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string | null;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const colors = {
  ink: rgb(0.145, 0.161, 0.137),
  muted: rgb(0.467, 0.482, 0.439),
  primary: rgb(0.4, 0.455, 0.361),
  accent: rgb(0.776, 0.655, 0.482),
  border: rgb(0.902, 0.886, 0.851),
  soft: rgb(0.941, 0.933, 0.906),
  surface: rgb(1, 1, 1),
  success: rgb(0.31, 0.471, 0.349),
  warning: rgb(0.725, 0.522, 0.239),
};

function ascii(value: string | null | undefined) {
  if (!value) return "";
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function money(value: number, currency: string) {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `${currency} ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = ascii(text);
  if (font.widthOfTextAtSize(clean, size) <= maxWidth) return clean;
  let result = clean;
  while (result.length > 1 && font.widthOfTextAtSize(`${result}...`, size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.trim()}...`;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = ascii(text).replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      let chunk = "";
      for (const char of word) {
        if (font.widthOfTextAtSize(chunk + char, size) > maxWidth) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

type Fonts = { regular: PDFFont; bold: PDFFont };

function text(
  page: PDFPage,
  value: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = colors.ink,
) {
  page.drawText(ascii(value), { x, y, size, font, color });
}

function drawFooter(page: PDFPage, fonts: Fonts, number: string, pageNumber: number) {
  const y = 32;
  page.drawLine({
    start: { x: MARGIN, y: y + 14 },
    end: { x: PAGE_WIDTH - MARGIN, y: y + 14 },
    thickness: 0.6,
    color: colors.border,
  });
  text(
    page,
    `${number}  |  Page ${pageNumber}`,
    MARGIN,
    y,
    8,
    fonts.regular,
    colors.muted,
  );
  const brand = "SilkSoul - Botanical haircare";
  const width = fonts.regular.widthOfTextAtSize(brand, 8);
  text(page, brand, PAGE_WIDTH - MARGIN - width, y, 8, fonts.regular, colors.muted);
}

function drawTableHeader(page: PDFPage, y: number, fonts: Fonts) {
  page.drawRectangle({
    x: MARGIN,
    y: y - 8,
    width: CONTENT_WIDTH,
    height: 24,
    color: colors.soft,
  });
  text(page, "ITEM", MARGIN + 8, y, 8, fonts.bold, colors.muted);
  text(page, "QTY", MARGIN + 336, y, 8, fonts.bold, colors.muted);
  text(page, "UNIT PRICE", MARGIN + 388, y, 8, fonts.bold, colors.muted);
  text(page, "LINE TOTAL", MARGIN + 466, y, 8, fonts.bold, colors.muted);
  return y - 24;
}

function drawRow(page: PDFPage, y: number, item: PdfLineItem, fonts: Fonts, currency: string) {
  text(page, fit(item.name, fonts.bold, 9, 300), MARGIN + 8, y, 9, fonts.bold);
  if (item.sku) {
    text(page, fit(item.sku, fonts.regular, 7.5, 290), MARGIN + 8, y - 11, 7.5, fonts.regular, colors.muted);
  }
  text(page, String(item.quantity), MARGIN + 340, y, 9, fonts.regular);
  text(page, money(item.unitPrice, currency), MARGIN + 388, y, 9, fonts.regular);
  const total = money(item.lineTotal, currency);
  const width = fonts.regular.widthOfTextAtSize(total, 9);
  text(page, total, PAGE_WIDTH - MARGIN - 8 - width, y, 9, fonts.regular);
  page.drawLine({
    start: { x: MARGIN, y: y - 18 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 18 },
    thickness: 0.4,
    color: colors.border,
  });
  return y - 30;
}

function drawTotals(page: PDFPage, y: number, data: PdfDocumentData, fonts: Fonts) {
  const x = MARGIN + 300;
  const valueX = PAGE_WIDTH - MARGIN - 8;
  const rows: [string, string, boolean][] = [
    ["Subtotal", money(data.subtotal, data.currency), false],
    ...(data.discount > 0
      ? ([["Discount", `-${money(data.discount, data.currency)}`, false]] as [string, string, boolean][])
      : []),
    ["Delivery", data.delivery === 0 ? "Free" : money(data.delivery, data.currency), false],
    ...(data.tax > 0 ? ([["Tax", money(data.tax, data.currency), false]] as [string, string, boolean][]) : []),
    ["Total", money(data.total, data.currency), true],
  ];

  for (const [label, value, strong] of rows) {
    if (strong) {
      page.drawLine({
        start: { x, y: y + 9 },
        end: { x: PAGE_WIDTH - MARGIN - 8, y: y + 9 },
        thickness: 0.8,
        color: colors.border,
      });
    }
    text(page, label, x, y, strong ? 11 : 9, strong ? fonts.bold : fonts.regular, strong ? colors.ink : colors.muted);
    const width = (strong ? fonts.bold : fonts.regular).widthOfTextAtSize(value, strong ? 11 : 9);
    text(page, value, valueX - width, y, strong ? 11 : 9, strong ? fonts.bold : fonts.regular);
    y -= strong ? 18 : 15;
  }

  return y - 8;
}

export async function renderPdf(data: PdfDocumentData): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(`${data.kind === "quotation" ? "Quotation" : "Receipt"} ${data.number}`);
  document.setAuthor("SilkSoul");
  document.setSubject(data.kind === "quotation" ? "Quotation" : "Payment receipt");
  document.setCreator("SilkSoul Studio");

  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const fonts: Fonts = { regular, bold };

  let logo: Awaited<ReturnType<typeof document.embedJpg>> | null = null;
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "images", "logo.jpeg"));
    logo = await document.embedJpg(bytes);
  } catch {
    logo = null;
  }

  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageNumber = 1;

  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 7, width: PAGE_WIDTH, height: 7, color: colors.primary });

  const top = PAGE_HEIGHT - MARGIN;
  if (logo) {
    page.drawImage(logo, { x: MARGIN, y: top - 46, width: 46, height: 46 });
  }
  const brandX = logo ? MARGIN + 56 : MARGIN;
  text(page, data.business.name, brandX, top - 18, 19, bold);
  text(page, "Botanical haircare", brandX, top - 32, 8, regular, colors.primary);
  if (data.business.website) {
    text(page, data.business.website, brandX, top - 44, 7.5, regular, colors.muted);
  }

  const title = data.kind === "quotation" ? "QUOTATION" : "RECEIPT";
  const titleWidth = bold.widthOfTextAtSize(title, 22);
  text(page, title, PAGE_WIDTH - MARGIN - titleWidth, top - 20, 22, bold, colors.primary);
  const status = data.kind === "receipt" ? `PAYMENT ${data.paymentStatus ?? "unpaid"}`.toUpperCase() : data.status.toUpperCase();
  const statusColor = status.includes("PAID") && !status.includes("UNPAID") ? colors.success : colors.warning;
  const statusWidth = bold.widthOfTextAtSize(status, 8);
  text(page, status, PAGE_WIDTH - MARGIN - statusWidth, top - 36, 8, bold, statusColor);

  page.drawLine({
    start: { x: MARGIN, y: top - 62 },
    end: { x: PAGE_WIDTH - MARGIN, y: top - 62 },
    thickness: 1,
    color: colors.border,
  });

  let y = top - 82;
  text(page, "PREPARED FOR", MARGIN, y, 7.5, bold, colors.muted);
  text(page, "DOCUMENT", MARGIN + 300, y, 7.5, bold, colors.muted);
  y -= 15;
  text(page, fit(data.customer.name, bold, 10, 260), MARGIN, y, 10, bold);
  text(page, `Number: ${data.number}`, MARGIN + 300, y, 9, regular);
  y -= 13;
  text(page, fit(data.customer.phone, regular, 9, 260), MARGIN, y, 9, regular, colors.muted);
  text(page, `Issued: ${dateLabel(data.issueDate)}`, MARGIN + 300, y, 9, regular, colors.muted);
  y -= 12;
  if (data.customer.email) {
    text(page, fit(data.customer.email, regular, 8.5, 260), MARGIN, y, 8.5, regular, colors.muted);
  }
  if (data.kind === "quotation" && data.validUntil) {
    text(page, `Valid until: ${dateLabel(data.validUntil)}`, MARGIN + 300, y, 9, regular, colors.muted);
  }
  if (data.kind === "receipt" && data.orderNumber) {
    text(page, `Order: ${data.orderNumber}`, MARGIN + 300, y, 9, regular, colors.muted);
  }
  y -= 12;
  if (data.customer.address) {
    const address = [data.customer.address, data.customer.city, data.customer.postalCode]
      .filter(Boolean)
      .join(", ");
    text(page, fit(address, regular, 8.5, 260), MARGIN, y, 8.5, regular, colors.muted);
  }
  if (data.kind === "receipt" && data.paymentMethod) {
    const method = data.paymentMethod.replaceAll("_", " ").toUpperCase();
    text(page, `Payment method: ${method}`, MARGIN + 300, y, 9, regular, colors.muted);
  }

  y -= 34;
  y = drawTableHeader(page, y, fonts);

  for (const item of data.items) {
    if (y < 140) {
      drawFooter(page, fonts, data.number, pageNumber);
      page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageNumber += 1;
      page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 7, width: PAGE_WIDTH, height: 7, color: colors.primary });
      text(page, `${data.business.name} - ${data.number}`, MARGIN, PAGE_HEIGHT - MARGIN, 10, bold, colors.primary);
      text(page, "Continued", PAGE_WIDTH - MARGIN - 48, PAGE_HEIGHT - MARGIN, 8, regular, colors.muted);
      y = drawTableHeader(page, PAGE_HEIGHT - MARGIN - 24, fonts);
    }
    y = drawRow(page, y, item, fonts, data.currency);
  }

  if (y < 190) {
    drawFooter(page, fonts, data.number, pageNumber);
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber += 1;
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 7, width: PAGE_WIDTH, height: 7, color: colors.primary });
    text(page, `${data.business.name} - ${data.number}`, MARGIN, PAGE_HEIGHT - MARGIN, 10, bold, colors.primary);
    y = PAGE_HEIGHT - MARGIN - 40;
  }

  y = drawTotals(page, y, data, fonts);

  if (data.notes) {
    y -= 8;
    text(page, "NOTES", MARGIN, y, 7.5, bold, colors.muted);
    y -= 14;
    const lines = wrap(data.notes, regular, 8.5, CONTENT_WIDTH - 10);
    for (const line of lines.slice(0, 8)) {
      if (y < 90) break;
      text(page, line, MARGIN, y, 8.5, regular, colors.muted);
      y -= 12;
    }
  }

  y = Math.min(y, 116);
  const disclaimer =
    data.kind === "quotation"
      ? "This quotation is not proof of payment. Prices are valid until the stated date and subject to product availability."
      : data.paymentStatus === "paid"
        ? "This receipt records a payment marked as paid against the order above."
        : "This receipt reflects the payment status shown above. Cash-on-delivery orders remain unpaid until cash is collected.";
  const disclaimerLines = wrap(disclaimer, regular, 8, CONTENT_WIDTH - 10);
  for (const line of disclaimerLines) {
    text(page, line, MARGIN, y, 8, regular, colors.muted);
    y -= 11;
  }

  text(
    page,
    `Questions? ${data.business.email}  |  ${data.business.phone}`,
    MARGIN,
    Math.max(y - 4, 58),
    8,
    regular,
    colors.primary,
  );

  for (let index = 0; index < document.getPageCount(); index += 1) {
    if (index === pageNumber - 1) continue;
    drawFooter(document.getPage(index), fonts, data.number, index + 1);
  }
  drawFooter(page, fonts, data.number, pageNumber);

  return document.save();
}
