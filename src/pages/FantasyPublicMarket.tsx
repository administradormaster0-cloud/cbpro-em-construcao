import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FantasyPublicMarket() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Public Player Market</h1>
      <Card>
        <CardHeader>
          <CardTitle>Market Watch</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Track player prices and ownership percentages globally.</p>
        </CardContent>
      </Card>
    </div>
  );
}
