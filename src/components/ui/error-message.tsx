import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
