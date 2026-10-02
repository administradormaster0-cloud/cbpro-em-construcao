import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DeleteAccount() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6">
      <h1 className="text-3xl font-bold font-heading text-red-500">Delete Account</h1>
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
          <Button variant="destructive" className="w-full">Permanently Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
