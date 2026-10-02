import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Regulamentos() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold font-heading">Platform Regulations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Rules & Conduct</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert">
          <p>Read the official rules for tournaments, matchmaking, and general conduct on the platform.</p>
        </CardContent>
      </Card>
    </div>
  );
}
