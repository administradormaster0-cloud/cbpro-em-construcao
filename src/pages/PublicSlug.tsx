import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicSlug() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Dynamic Entity Viewer</h1>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">This page dynamically resolves slugs to Teams, Players, or Federations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
