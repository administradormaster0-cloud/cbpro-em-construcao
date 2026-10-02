import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TorneioFacil() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Easy Tournaments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quick Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Join instantly generated bracket tournaments for quick fun.</p>
          <Button>Join Next Bracket</Button>
        </CardContent>
      </Card>
    </div>
  );
}
