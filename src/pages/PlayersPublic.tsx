import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlayersPublic() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-3xl text-[#0A2560]">Jogadores</h1>
      <Card>
        <CardHeader>
          <CardTitle>Diretório de jogadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#3A4566]">Quem está inscrito no circuito.</p>
        </CardContent>
      </Card>
    </div>
  );
}