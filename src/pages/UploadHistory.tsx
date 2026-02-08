import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type UploadRow = Tables<"uploads">;

export default function UploadHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("uploads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setUploads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("uploads").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in-fade">
        <div className="h-10 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-xl border bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Upload History</h1>
        <p className="mt-0.5 text-muted-foreground">View and manage your past data uploads</p>
      </div>

      {uploads.length === 0 ? (
        <Card className="overflow-hidden border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <History className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold">No uploads yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Your upload history will appear here after you import a CSV.</p>
            <Button className="mt-6 rounded-lg" asChild>
              <a href="/upload">Upload data</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Past Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.file_name}</TableCell>
                    <TableCell>{u.row_count}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
