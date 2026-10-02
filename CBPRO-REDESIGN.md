# CBPRO — reformulação visual

Pacote estático: `data/cbpro-release`.
Arquivo de publicação: `data/cbpro-release_20261001_110928.zip`.
Versão anterior: `data/cbpro-before-redesign`.

A versão React em src continha páginas incompletas (incluindo diretório de clubes e campeões). Esta entrega usa o aplicativo completo preservado no backup, com a integração Supabase atual de public/fc-cloud.js. Não executar o build Vite antigo para sobrescrever esta entrega: isso voltaria às páginas incompletas.

Arquivos de apresentação editáveis: data/cbpro-release/cbpro-design.css e cbpro-design.js. Marca em data/cbpro-release/brand. Aplicativo completo em js/cbpro-app-20261001.js; a alteração nesse bundle limita-se à marca, idioma padrão e referências de arquivos. Nenhuma migração de dados foi realizada.

Nova navegação global responsiva, capa CBPRO e atalhos para competir, encontrar time e organizar campeonatos. Notícias reposicionadas antes das competições, com expansão acessível. Telas completas de clubes, players, notícias, campeões, recrutamento, transferências, federações e gestão preservadas. Draft, games e gamebet retirados dos links e redirecionados para campeonatos. Fantasy preservado. Histórico e dados desses módulos não foram apagados.

Verificações: desktop 1440px e mobile 390px sem overflow horizontal ou erros JavaScript nas páginas inicial, clubes, campeões e login; imagens visíveis carregadas. Menu mobile abre/fecha por botão e Escape. Notícias expandem. Busca HYPE retorna três clubes. Detalhe do clube carrega elenco, títulos e histórico. Rota /draft redireciona. Login visual conferido; não foi efetuada autenticação de usuário nem operação de escrita no banco durante os testes.

Prévia temporária local foi usada apenas para validação. Produção permanece frontend estático Hostinger + backend Supabase.

## Revisão publicada em 01/10/2026
- Publicação Hostinger: cbpro-release_20261001_175457.zip; bundle cbpro-app-36daf9df6bc4.js.
- Supabase: consultas por ID usam índice existente; relações são carregadas em paralelo; cache de leituras públicas em memória por 30 segundos, sem persistir dados públicos localmente.
- Rankings atualizados no próprio Supabase pelo job cbpro-refresh-rankings a cada cinco minutos. Três execuções confirmadas como succeeded. SQL aplicado: supabase/cbpro-performance.sql. Reversão: data/cbpro-before-performance/database-functions.sql.
- Home: Amistosos e Draft não montam componentes; Fantasy removido da navegação, rotas redirecionadas para campeonatos. Dados históricos não foram apagados.
- Revisão de emblemas, Top Performance, Hall dos Campeões e painel do usuário. Modo claro/escuro com preferência persistida.
- Verificação publicada: estatísticas e troféus disponíveis em 4.870 ms, 42 requisições RPC, zero erros JavaScript; modo escuro e persistência aprovados. Esta medição depende de conexão e carga e não é garantia de tempo universal.
- Verificação de home desktop/celular, clubes, campeões e login: sem overflow ou imagens quebradas. Painel autenticado testado em desktop e celular; Fantasy ausente. Backend permanece Supabase, frontend Hostinger. Servidor de prévia é somente ferramenta de validação, não dependência da produção.

## Carregamento público preparado no Supabase — 01/10/2026
- Release final: cbpro-release_20261001_181657.zip.
- Cache por rota (home, times, jogadores, campeões, ranking), atualizado no Supabase pelo cron cbpro-refresh-public-snapshot a cada minuto. Dados vêm de funções públicas existentes, não de dados privados de login.
- Tabela cbpro_public_route_snapshots protegida por RLS, sem acesso direto anon/authenticated. API somente leitura cbpro_get_public_snapshot(text). Função de refresh sem permissão pública.
- Cópia dos snapshots públicos no bucket Supabase cbpro-public-cache; pg_net publica os objetos com credencial protegida no Vault. Sem permissões públicas de escrita. Implantação via scripts/install-cache-publisher.py. SQL de estrutura: supabase/cbpro-public-cache-publisher.sql e supabase/cbpro-public-snapshot.sql.
- O navegador começa a busca durante a leitura do HTML e usa a primeira entrega válida entre RPC e Storage. Cache temporário apenas em memória; dados de autenticação não passam pelo snapshot. Snapshot com mais de três minutos é descartado. Filtros sem correspondência usam consulta normal. Após alterações o snapshot é ignorado por um minuto na sessão.
- Consultas HEAD solicitam somente contagem, evitando milhares de registros completos. Pacote home reduziu de 1.136.133 para 176.399 bytes antes da compressão HTTP.
- Testes publicados finais da home: 1.500 ms e 2.556 ms, estatísticas e troféus disponíveis, sem erros JavaScript. Os tempos variam por conexão, cache e processamento; menos de dois segundos não é garantido. Modo escuro, persistência, ausência de Fantasy e redirecionamento confirmados. Busca de clubes, navegação e menu mobile verificados na prévia.
- Nenhum serviço local é necessário na produção. Frontend Hostinger, preparação, banco e arquivos públicos Supabase.

## Visual dos rankings, buscas e navegação — 01/10/2026
- Release: cbpro-release_20261001_184508.zip. Aplicativo e chunks versionados r20261001b; módulos anteriores preservados para compatibilidade com páginas já abertas.
- Melhores times: pódio com líder central, medalhas de classificação, emblemas inteiros e destaque de ELO. Ícones: líder em painel principal e quatro painéis de jogadores, nomes sem corte, retratos com contraste e estatísticas maiores. Revisados em claro, escuro e celular, sem overflow.
- Times e players: filtro implícito pelo game do perfil removido. Agora todos os games significa realmente todos os games; seleção manual continua disponível. Busca de times ignora sufixo genérico eSports quando existem outras palavras. DTR Esports e Vortex Esports encontrados; DTR_Mattz encontrado em teste autenticado no site publicado.
- Respostas antigas de buscas não sobrescrevem buscas mais recentes; resultados existentes permanecem durante atualização. Índices trigram para nome/tag de time e handle/platform_handle de jogador aplicados no Supabase: supabase/cbpro-search-indexes.sql.
- Renovação/login da sessão não invalida o snapshot público. Invalidação limitada a alterações de dados. Teste autenticado confirmou cache mantido após chamada ao endpoint de renovação e nenhuma falha JavaScript.
- Campeonatos incluídos nos snapshots do Supabase. Menu público usa o roteador existente, sem recarga integral, e prepara dados ao passar o cursor/focar links. Na home, páginas principais também são preparadas em segundo plano, somente em memória.
- Medição publicada com snapshot preparado: Campeonatos em 170 ms após clique. Primeira abertura continua variável: 2.4 s para Campeonatos e 3.2 s para Campeões em uma rodada anterior, sem erros. Não há garantia de tempo universal ou carregamento instantâneo da primeira visita.
- Reversão de apresentação disponível em data/cbpro-before-rank-polish; SQL adicionado também copiado para BACKUP-2026-10-01.

### Validação final da navegação
- Release final desta revisão: cbpro-release_20261001_184935.zip.
- Ordenação de relacionamentos (tiers(rank)) deixou de ser encaminhada como coluna direta ao SQL; snapshots usam a ordenação compatível. Eliminada a consulta rejeitada de tournament_allowed_tiers.
- No site publicado, após preparar os snapshots: Campeonatos apareceu em 137 ms após clique e Hall dos Campeões em 148 ms, sem erros JavaScript. Consulta de diagnóstico do Hall não encontrou solicitações adicionais fc_public_select após a preparação. Estes tempos medem navegação com dados preparados, não a primeira visita fria.
- Bundle atual: js/cbpro-app-36daf9df6bc4.r20261001b.js. O arquivo sem r20261001b permanece como compatibilidade da publicação anterior. Edições futuras devem partir da versão ativa; a reconstrução src original não contém todas as telas.
