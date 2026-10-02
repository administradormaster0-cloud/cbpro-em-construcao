import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CreditsCanceled() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold font-heading text-red-500">Payment Canceled</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p>Your transaction was canceled. No charges were made.</p>
          <Button className="w-full" variant="outline" asChild><Link to="/dashboard">Return to Dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
