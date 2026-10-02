import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TorneioFacilCriar() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Create Easy Tournament</h1>
      <Card>
        <CardHeader>
          <CardTitle>Setup Bracket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Create a small bracket for your friends with one click.</p>
          <Button>Generate Bracket</Button>
        </CardContent>
      </Card>
    </div>
  );
}
