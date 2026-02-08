import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload as UploadIcon, FileText, CheckCircle, AlertTriangle } from "lucide-react";

const REQUIRED_COLS = ["Product Name", "Date", "Quantity Sold", "Unit Price", "Current Stock", "Reorder Point"];

type ParsedRow = {
  "Product Name": string;
  Date: string;
  "Quantity Sold": string;
  "Unit Price": string;
  "Current Stock": string;
  "Reorder Point": string;
};

export default function UploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setErrors([]);
    setRows([]);

    Papa.parse<ParsedRow>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errs: string[] = [];
        const headers = results.meta.fields || [];
        const missing = REQUIRED_COLS.filter(c => !headers.includes(c));
        if (missing.length) {
          errs.push(`Missing columns: ${missing.join(", ")}`);
        }
        if (results.errors.length) {
          results.errors.slice(0, 3).forEach(e => errs.push(`Row ${e.row}: ${e.message}`));
        }
        if (errs.length) {
          setErrors(errs);
          return;
        }
        // Validate data types
        results.data.forEach((row, i) => {
          if (!row["Product Name"]?.trim()) errs.push(`Row ${i + 1}: Missing Product Name`);
          if (isNaN(Date.parse(row.Date))) errs.push(`Row ${i + 1}: Invalid date "${row.Date}"`);
          if (isNaN(Number(row["Quantity Sold"]))) errs.push(`Row ${i + 1}: Invalid Quantity Sold`);
          if (isNaN(Number(row["Unit Price"]))) errs.push(`Row ${i + 1}: Invalid Unit Price`);
        });
        if (errs.length > 5) {
          setErrors([...errs.slice(0, 5), `...and ${errs.length - 5} more errors`]);
          return;
        }
        if (errs.length) { setErrors(errs); return; }
        setRows(results.data);
      },
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith(".csv")) processFile(f);
    else toast({ title: "Invalid file", description: "Please upload a CSV file.", variant: "destructive" });
  }, [processFile, toast]);

  const handleUpload = async () => {
    if (!user || !rows.length) return;
    setUploading(true);
    try {
      const { data: upload, error: uploadErr } = await supabase
        .from("uploads")
        .insert({ user_id: user.id, file_name: file!.name, row_count: rows.length })
        .select()
        .single();

      if (uploadErr) throw uploadErr;

      const salesRows = rows.map(r => ({
        upload_id: upload.id,
        user_id: user.id,
        product_name: r["Product Name"].trim(),
        sale_date: new Date(r.Date).toISOString().split("T")[0],
        quantity_sold: Number(r["Quantity Sold"]),
        unit_price: Number(r["Unit Price"]),
        current_stock: Number(r["Current Stock"]),
        reorder_point: Number(r["Reorder Point"]),
      }));

      // Batch insert in chunks of 500
      for (let i = 0; i < salesRows.length; i += 500) {
        const { error } = await supabase.from("sales_data").insert(salesRows.slice(i, i + 500));
        if (error) throw error;
      }

      toast({ title: "Upload successful!", description: `${rows.length} rows imported.` });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Data</h1>
        <p className="text-muted-foreground">Import your sales and inventory CSV data</p>
      </div>

      {/* Drop zone */}
      <Card
        className={`cursor-pointer border-2 border-dashed transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("csv-input")?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UploadIcon className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">Drag & drop your CSV file here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
          <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
        </CardContent>
      </Card>

      {/* Expected format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Expected CSV Format</CardTitle>
          <CardDescription>Your CSV should have these columns:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_COLS.map(c => (
              <span key={c} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">{c}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Validation Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-destructive">
              {errors.map((e, i) => <li key={i}>• {e}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> Data Preview</CardTitle>
              <CardDescription>{rows.length} rows parsed from {file?.name}</CardDescription>
            </div>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : `Import ${rows.length} Rows`}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {REQUIRED_COLS.map(c => <TableHead key={c}>{c}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 20).map((row, i) => (
                    <TableRow key={i}>
                      {REQUIRED_COLS.map(c => <TableCell key={c}>{row[c as keyof ParsedRow]}</TableCell>)}
                    </TableRow>
                  ))}
                  {rows.length > 20 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">...and {rows.length - 20} more rows</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
