# FC Clubs — publicação em nuvem

Verificado em 30/09/2026.

Frontend: https://navajowhite-alpaca-413377.hostingersite.com
Backend: Supabase `fpnzjhbdtcvglhmxvvzt`, conta administradormaster0@gmail.com.

## Execução

Hostinger Single serve HTML, JavaScript, CSS e imagens estáticas. A Edge Function `fc-api` executa as regras de negócio e consulta o Postgres no Supabase. Nenhum servidor Node local ou SQLite local participa das requisições publicadas. Os scripts locais são ferramentas de desenvolvimento, implantação e verificação.

Foram migrados 155.921 registros e 1.485 imagens em 22 buckets. A contagem de registros corresponde à migração inicial; alterações posteriores podem mudar o total. Os hashes de origem e a conferência de tamanho remoto constam nos relatórios de migração.

As gravações usam revisão otimista e operação idempotente, com confirmação no Supabase antes da resposta. O adaptador em Edge reexecuta leituras para hidratar dados sob demanda e aplica as gravações somente ao final. Tabelas internas e funções SQL de serviço não estão acessíveis anonimamente.

## Login e e-mail

Supabase Auth valida senha ou código por e-mail em `/login-code`. O código tem oito dígitos, uso único e validade de dez minutos. Cadastro exige confirmação; recuperação e troca de e-mail têm modelos em português. Senha e código são formas alternativas de login, não um segundo fator obrigatório.

SMTP Brevo gratuito configurado: 300 mensagens/dia no plano escolhido e limite de 30/h no Supabase. Respostas chegam ao Gmail administradormaster0@gmail.com. Brevo pode reescrever o remetente para seu domínio autenticado. SMTP envia mensagens; não cria caixa postal própria. A chave criada tem validade de um ano e regra de expiração por inatividade.

O endereço do site e os redirecionamentos permitidos no Supabase apontam para o domínio temporário da Hostinger. Ao adquirir domínio, atualizar essas duas configurações. Não há localhost nas URLs de autenticação de produção.

Entrega real, confirmação de cadastro, código de login de uso único e recuperação de senha foram testados. Um teste foi classificado como spam; entrega na caixa principal não é garantida.

## Edge Functions e EA

Funções publicadas: `fc-api`, `search-users`, `search-tournament-entrants`, `search-ea-clubs`.

A busca EA chama a API da EA por HTTP a partir do Postgres Supabase e agrega resultados de três plataformas. Isso evita a dependência do computador local. Foi validada com resultados reais de Arsenal. A disponibilidade continua dependendo da EA; indisponibilidade retorna erro explícito, sem inventar resultados.

O frontend usa `/functions/v1/fc-api/invoke/<nome>` para funções e `/functions/v1/fc-api/rest/v1/...` para dados. Autenticação e leitura de arquivos públicos usam os serviços nativos do Supabase.

## Validação e limites

79 testes passaram e o build foi concluído. Verificação remota confirmou autenticação administrativa, relações, gravação e exclusão de registro temporário, bloqueio de escrita anônima, proteção de dados privados, busca de participantes, busca EA e cabeçalhos de navegador. Login por senha, dashboard e lista administrativa com 1.188 equipes foram conferidos no site publicado, com a porta local 3000 desligada.

Não está correto declarar toda a plataforma 100% funcional: pagamentos (Stripe/Pix), geração por IA e OAuth externo não foram configurados. As assinaturas de atualização automática do aplicativo original precisam de adaptação ao armazenamento genérico; não foram validadas como realtime nesta publicação. Isso é separado da busca EA ao vivo, que foi validada.

## Manutenção

- `npm test` e `npm run build` validam regras e geram o painel.
- `node scripts/build-cloud-backend.mjs` gera os módulos Edge.
- `node scripts/deploy-cloud-backend.mjs` aplica SQL e publica `fc-api`.
- `node scripts/deploy-ea-function.mjs` publica a busca EA independente.
- `node scripts/build-hostinger.mjs` prepara `data/hostinger-release` para upload no public_html.
- `node scripts/verify-edge-cutover.mjs` verifica o backend publicado.

Credenciais permanecem em arquivos `.env.*.local` ignorados e configurações protegidas. Não publicar esses arquivos. Não usar o antigo `supabase:stage` para substituir o armazenamento ativo.

Evidências: `data/edge-cutover-verification.json`, `runtime-migration-report.json`, `supabase-media-report.json`, `auth-flows-verification.json` e `email-delivery-verification.json`.
