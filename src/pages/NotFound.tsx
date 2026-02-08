import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PackageX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <Card className="w-full max-w-md overflow-hidden border-border/80 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <PackageX className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The page <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code> doesn't exist or was moved.
          </p>
          <Button asChild className="mt-8 gap-2 rounded-lg shadow-sm" size="lg">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
