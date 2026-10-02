import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Checkout() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6">
      <h1 className="text-3xl font-bold font-heading text-center">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between font-medium">
            <span>Premium Plan</span>
            <span>$9.99</span>
          </div>
          <Button className="w-full">Proceed to Payment</Button>
        </CardContent>
      </Card>
    </div>
  );
}
