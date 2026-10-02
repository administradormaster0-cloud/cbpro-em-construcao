import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FantasyPublicLeague() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Public League View</h1>
      <Card>
        <CardHeader>
          <CardTitle>League Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Anyone can view these public standings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
