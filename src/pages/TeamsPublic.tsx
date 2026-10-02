import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamsPublic() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-3xl text-[#0A2560]">Times</h1>
      <Card>
        <CardHeader>
          <CardTitle>Diretório de times</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#3A4566]">Clubes ativos do circuito.</p>
        </CardContent>
      </Card>
    </div>
  );
}