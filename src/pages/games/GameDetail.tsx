import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GameDetail() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Game Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Active tournaments and ladders for this game.</p>
        </CardContent>
      </Card>
    </div>
  );
}
