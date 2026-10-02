import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StripeConnectReturn() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold font-heading">Stripe Connected</h1>
      <Card>
        <CardContent className="pt-6">
          <p>Your Stripe account has been linked successfully. You can now receive payouts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
