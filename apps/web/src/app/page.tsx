import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Separator,
} from "@repo/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Basic RAG</CardTitle>
            <Badge variant="outline">Base UI</Badge>
          </div>
          <CardDescription>
            Frontend workspace initialized with Inter font & Base UI components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Query Python Backend
            </label>
            <Input placeholder="Ask a question about your documents..." />
          </div>
          <Separator />
          <div className="flex gap-2">
            <Button variant="default" className="flex-1">
              Ask Question
            </Button>
            <Button variant="outline">Upload Doc</Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-center">
          Connected to Python RAG Pipeline
        </CardFooter>
      </Card>
    </main>
  );
}
