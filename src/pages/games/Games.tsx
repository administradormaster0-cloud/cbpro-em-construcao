import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Games() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold font-heading">Supported Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['EA FC 24', 'eFootball', 'UFL', 'FIFA 23'].map(game => (
          <Card key={game} className="hover:border-primary cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle>{game}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-muted-foreground">Game Image</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
