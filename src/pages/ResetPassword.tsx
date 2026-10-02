import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  return (
    <div className="container mx-auto p-6 max-w-md space-y-6">
      <h1 className="text-3xl font-bold font-heading text-center">Reset Password</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Enter your new password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="New password" />
          <Input type="password" placeholder="Confirm new password" />
          <Button className="w-full">Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
