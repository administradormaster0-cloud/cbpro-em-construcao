# CBPRO — versão em construção

Este repositório contém a nova versão que está sendo desenvolvida, separada do site atualmente publicado na Hostinger. Ainda não é uma entrega concluída.

## Abrir a versão exata

Requer Node.js 24 ou superior.

```sh
npm run preview:construction
```

Abra http://127.0.0.1:5191/. O frontend preservado está em `data/cbpro-reconstruction`. Ele usa o projeto Supabase existente; a disponibilidade dos dados depende desse serviço.

## Código e validação

- `src/reconstruction`: páginas e estilos da reconstrução.
- `server`, `cloud`, `supabase/functions/fc-api`: implementação local e Supabase do backend.
- `supabase/migrations`: alterações do banco versionadas.
- `tests` e `scripts`: verificações e ferramentas de construção.
- `data/cbpro-release/js`: entrada original utilizada pelo gerador de módulos.

```sh
npm ci
npm test
npm run validate:construction
```

O comando padrão `npm run build` refere-se ao aplicativo Vite anterior e não substitui o frontend preservado acima. Alguns scripts históricos ainda dependem de caminhos e ferramentas locais; não execute scripts de implantação ou importação sem revisar suas configurações.

## Estado desta cópia

97 testes do backend passaram na origem. Permanecem pendentes a disponibilidade e velocidade do Supabase, a validação real de todos os fluxos dos painéis, leilões e integrações externas de pagamentos, IA e emails. A nova versão não foi publicada na Hostinger.

Senhas, tokens privados, arquivos de ambiente reais, bases de dados e backups de usuários não estão incluídos. As chaves públicas anon presentes no frontend são configurações públicas do cliente.

![Tela inicial atual](docs/home-construction.png)
