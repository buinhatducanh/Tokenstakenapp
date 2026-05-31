export type CsvRow = Record<string, string | number>;

export const exportToCsv = (filename: string, rows: CsvRow[]) => {
  if (typeof document === "undefined") {
    throw new Error("CSV export is only supported in the browser");
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const csv = [headers.join(",")]
    .concat(rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

