import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const dataDir = path.join(process.cwd(), "public", "data");

  try {
    const selic = JSON.parse(fs.readFileSync(path.join(dataDir, "selic.json"), "utf-8"));
    const ptax  = JSON.parse(fs.readFileSync(path.join(dataDir, "ptax.json"),  "utf-8"));
    const ipca  = JSON.parse(fs.readFileSync(path.join(dataDir, "ipca.json"),  "utf-8"));

    const wb = new ExcelJS.Workbook();
    wb.creator = "Portal Marcus Aleks — Calculadora de Fluxo Indexado";
    wb.created = new Date();

    // ── Estilos ────────────────────────────────────────────────────────────
    const headerFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FF94A3B8" }, name: "Courier New", size: 10 };
    const dataFont:   Partial<ExcelJS.Font> = { name: "Courier New", size: 10 };

    function styleHeader(row: ExcelJS.Row) {
      row.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.border = { bottom: { style: "thin", color: { argb: "FF334155" } } };
      });
    }

    function addFooter(ws: ExcelJS.Worksheet, source: string, lastUpdated: string, baseDate: string, baseValue: number) {
      ws.addRow([]);
      ws.addRow([`Base: ${baseDate} = ${baseValue.toFixed(8)}`])
        .getCell(1).font = { italic: true, color: { argb: "FF64748B" }, size: 9 };
      ws.addRow([`Fonte: ${source}`])
        .getCell(1).font = { italic: true, color: { argb: "FF475569" }, size: 9 };
      ws.addRow([`Atualizado em: ${new Date(lastUpdated).toLocaleString("pt-BR")}`])
        .getCell(1).font = { italic: true, color: { argb: "FF475569" }, size: 9 };
    }

    // ── Aba SELIC ──────────────────────────────────────────────────────────
    const wsSelic = wb.addWorksheet("SELIC");
    wsSelic.columns = [
      { header: "Data",            key: "date",        width: 14 },
      { header: "Taxa Diária (%)", key: "taxa_diaria", width: 18 },
      { header: "Número-Índice",   key: "indice",      width: 20 },
      { header: "Tipo",            key: "tipo",        width: 12 },
    ];
    styleHeader(wsSelic.getRow(1));

    for (const e of selic.data) {
      const row = wsSelic.addRow({ date: e.date, taxa_diaria: e.taxa_diaria, indice: e.indice, tipo: e.tipo ?? "historico" });
      row.getCell("date").font        = dataFont;
      row.getCell("taxa_diaria").font = dataFont;
      row.getCell("taxa_diaria").numFmt = "0.000000";
      row.getCell("indice").font      = dataFont;
      row.getCell("indice").numFmt    = "0.00000000";
      row.getCell("tipo").font = {
        ...dataFont,
        color: (e.tipo === "projecao") ? { argb: "FFFBBF24" } : { argb: "FF34D399" },
      };
    }
    addFooter(wsSelic, selic.source, selic.last_updated, selic.base_date, selic.base_value);

    // ── Aba PTAX ───────────────────────────────────────────────────────────
    const wsPTAX = wb.addWorksheet("PTAX");
    wsPTAX.columns = [
      { header: "Data",              key: "date",    width: 14 },
      { header: "Cotação (BRL/USD)", key: "cotacao", width: 20 },
      { header: "Número-Índice",     key: "indice",  width: 20 },
    ];
    styleHeader(wsPTAX.getRow(1));

    for (const e of ptax.data) {
      const row = wsPTAX.addRow({ date: e.date, cotacao: e.cotacao, indice: e.indice });
      row.getCell("date").font    = dataFont;
      row.getCell("cotacao").font = dataFont;
      row.getCell("cotacao").numFmt = "0.0000";
      row.getCell("indice").font  = dataFont;
      row.getCell("indice").numFmt = "0.00000000";
    }
    addFooter(wsPTAX, ptax.source, ptax.last_updated, ptax.base_date, ptax.base_value);

    // ── Aba IPCA ───────────────────────────────────────────────────────────
    const wsIPCA = wb.addWorksheet("IPCA");
    wsIPCA.columns = [
      { header: "Data (competência)", key: "date",         width: 20 },
      { header: "Valor Mensal (%)",   key: "valor_mensal", width: 18 },
      { header: "Número-Índice",      key: "indice",       width: 20 },
      { header: "Tipo",               key: "tipo",         width: 12 },
    ];
    styleHeader(wsIPCA.getRow(1));

    for (const e of ipca.data) {
      const row = wsIPCA.addRow({ date: e.date, valor_mensal: e.valor_mensal, indice: e.indice, tipo: e.tipo });
      row.getCell("date").font        = dataFont;
      row.getCell("valor_mensal").font = dataFont;
      row.getCell("valor_mensal").numFmt = "0.00";
      row.getCell("indice").font      = dataFont;
      row.getCell("indice").numFmt    = "0.00000000";
      row.getCell("tipo").font = {
        ...dataFont,
        color: e.tipo === "projecao" ? { argb: "FFFBBF24" } : { argb: "FF34D399" },
      };
    }
    addFooter(wsIPCA, ipca.source, ipca.last_updated, ipca.base_date, ipca.base_value);

    // ── Gerar e enviar ─────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="numeros-indice-${timestamp}.xlsx"`);
    res.send(Buffer.from(buffer));

  } catch (e: any) {
    res.status(500).json({ error: `Falha ao gerar Excel: ${e.message}` });
  }
}
