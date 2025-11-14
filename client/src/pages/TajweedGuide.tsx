import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TajweedGuide() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Tajweed Guide</h1>
            <Link href="/">
              <Button variant="outline" size="sm">Back</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Tajweed Guide</CardTitle>
            <CardDescription>Explore tajweed rules, color-coded text, and examples.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">For the full official guide, open the resource below:</p>
            <a href="https://alquran.cloud/tajweed-guide" target="_blank" rel="noreferrer" className="underline text-primary">https://alquran.cloud/tajweed-guide</a>
            <div className="mt-4">
              <iframe title="Tajweed Guide" src="https://alquran.cloud/tajweed-guide" className="w-full h-[600px] rounded border" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
