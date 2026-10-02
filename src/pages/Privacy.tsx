import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold font-heading">Privacy Policy</h1>
      <Card>
        <CardContent className="pt-6 prose prose-invert">
          <p>We respect your privacy. This document outlines how we handle your data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
