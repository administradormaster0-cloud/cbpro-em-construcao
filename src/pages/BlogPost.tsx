import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BlogPost() {
  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <h1 className="text-4xl font-bold font-heading">News Article Title</h1>
      <p className="text-muted-foreground">Published on Oct 1, 2026 by Admin</p>
      <div className="prose prose-invert max-w-none mt-8">
        <p>This is the content of the blog post. It contains news about tournaments, patch notes, or community highlights.</p>
      </div>
    </div>
  );
}
