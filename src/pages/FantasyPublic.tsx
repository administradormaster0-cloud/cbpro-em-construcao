import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FantasyPublic() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Fantasy Overview</h1>
      <Card>
        <CardHeader>
          <CardTitle>Global Fantasy Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Public view of the fantasy ecosystem.</p>
        </CardContent>
      </Card>
    </div>
  );
}
