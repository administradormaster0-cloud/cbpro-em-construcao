import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CreditsSuccess() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold font-heading text-green-500">Payment Successful</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p>Your transaction has been completed successfully. The credits have been added to your account.</p>
          <Button className="w-full" asChild><Link to="/dashboard">Return to Dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
