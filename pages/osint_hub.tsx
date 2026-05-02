import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ExternalLink, Shield, LogOut } from 'lucide-react';

type Item = { nome: string; url?: string | null; descricao?: string | null };
type Secao = { id: string; titulo: string; icone: string; subsecoes: { titulo: string; itens: Item[] }[] };

const SECOES: Secao[] = [
  { id: 'pesquisas-gerais', titulo: 'Pesquisas Gerais', icone: '🔍', subsecoes: [
    { titulo: 'Google', itens: [
      { nome: 'Google Search', url: 'https://www.google.com', descricao: 'Busca geral com operadores avançados' },
      { nome: 'Google Advanced', url: 'https://www.google.com/advanced_search', descricao: 'Interface amigável para buscas complexas' },
      { nome: 'Google Alerts', url: 'https://www.google.com/alerts', descricao: 'Alertas automáticos por email' },
      { nome: 'Google News', url: 'https://news.google.com', descricao: 'Agregador de notícias mundiais' },
      { nome: 'Google Imagens', url: 'https://images.google.com', descricao: 'Busca reversa de imagens' },
    ]},
    { titulo: 'Alternativas de Busca', itens: [
      { nome: 'DuckDuckGo', url: 'https://duckduckgo.com', descricao: 'Busca privada sem rastreamento' },
      { nome: 'Bing', url: 'https://www.bing.com', descricao: 'Motor da Microsoft, excelente para documentos Office' },
      { nome: 'Yandex', url: 'https://www.yandex.com', descricao: 'Motor russo, referência em reconhecimento facial' },
      { nome: 'Baidu', url: 'https://www.baidu.com', descricao: 'Principal motor da China' },
    ]},
    { titulo: 'Monitoramento Social', itens: [
      { nome: 'Talkwalker', url: 'https://www.talkwalker.com/alerts', descricao: 'Monitoramento de redes sociais e alertas' },
      { nome: 'Social Searcher', url: 'https://www.social-searcher.com', descricao: 'Motor de busca em tempo real para redes sociais' },
      { nome: 'Wayback Machine', url: 'https://web.archive.org', descricao: 'Snapshots históricos de qualquer site' },
    ]},
  ]},
  { id: 'certidoes', titulo: 'Certidões', icone: '📋', subsecoes: [
    { titulo: 'Pessoa Física', itens: [
      { nome: 'CPF — Situação Cadastral', url: 'https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp', descricao: 'Regularidade fiscal do CPF' },
      { nome: 'Débitos Federais — PF', url: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/PF/Emitir', descricao: 'Dívidas tributárias de pessoa física' },
    ]},
    { titulo: 'Pessoa Jurídica', itens: [
      { nome: 'CNPJ — Situação Cadastral', url: 'https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp', descricao: 'Comprovante de inscrição e situação cadastral' },
      { nome: 'Débitos Federais — PJ', url: 'https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/PJ/Emitir', descricao: 'Dívidas tributárias de CNPJ' },
    ]},
    { titulo: 'Certidões Especializadas', itens: [
      { nome: 'Protestos', url: 'https://www.protestoonline.com.br', descricao: 'Protestos em cartório — todos os estados' },
      { nome: 'Trabalhista', url: 'https://www.tst.jus.br/certidao', descricao: 'Débitos trabalhistas' },
      { nome: 'Eleitoral', url: 'https://www.tse.jus.br/eleitor/certidoes/certidao-de-quitacao-eleitoral', descricao: 'Regularidade eleitoral' },
      { nome: 'FGTS', url: 'https://consulta-crf.caixa.gov.br', descricao: 'Regularidade do empregador' },
      { nome: 'TCU — Inidôneos', url: 'https://contas.tcu.gov.br/ords/f?p=INABILITADOS:INICIO', descricao: 'Inidôneos e irregulares perante o TCU' },
    ]},
  ]},
  { id: 'seguranca-publica', titulo: 'Segurança Pública', icone: '🛡️', subsecoes: [
    { titulo: 'Antecedentes Criminais', itens: [
      { nome: 'Polícia Federal', url: 'https://www.gov.br/pf/pt-br/assuntos/antecedentes-criminais', descricao: 'Certidão de antecedentes — federal' },
      { nome: 'Polícias Civis Estaduais', url: 'https://www.gov.br/pt-br/servicos/emitir-certidao-de-antecedentes-criminais', descricao: 'Acesso às polícias civis de cada UF' },
    ]},
    { titulo: 'Mandados e Veículos', itens: [
      { nome: 'BNMP — CNJ', url: 'https://portalbnmp.cnj.jus.br', descricao: 'Banco Nacional de Monitoramento de Prisões' },
      { nome: 'Sinesp Cidadão', url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1', descricao: 'Veículos roubados, mandados, desaparecidos' },
    ]},
    { titulo: 'Estatísticas', itens: [
      { nome: 'Atlas da Violência', url: 'https://www.ipea.gov.br/atlasviolencia/', descricao: 'Séries históricas de violência no Brasil' },
      { nome: 'Monitor da Violência', url: 'https://g1.globo.com/monitor-da-violencia/', descricao: 'Dados em tempo real — G1/IPEA/FBSP' },
    ]},
  ]},
  { id: 'veiculos', titulo: 'Veículos', icone: '🚗', subsecoes: [
    { titulo: 'Consulta', itens: [
      { nome: 'Portal SENATRAN', url: 'https://portalservicos.senatran.serpro.gov.br/', descricao: 'Veículos, infrações e histórico de multas' },
      { nome: 'Detran — Consulta Geral', url: 'https://www.gov.br/pt-br/servicos/consultar-veiculo', descricao: 'Consultas estaduais de licenciamento por placa' },
      { nome: 'PRF — Multas', url: 'https://www.gov.br/prf/pt-br/servicos/consultas/consulta-de-auto-de-infracao', descricao: 'Multas por placa/CPF/CNPJ' },
    ]},
  ]},
  { id: 'voos', titulo: 'Voos e Aviação', icone: '✈️', subsecoes: [
    { titulo: 'Rastreamento', itens: [
      { nome: 'FlightRadar24', url: 'https://www.flightradar24.com', descricao: '180.000 voos em tempo real — cobertura global' },
      { nome: 'FlightAware', url: 'https://www.flightaware.com', descricao: 'Cobertura global, histórico de rotas' },
      { nome: 'RadarBox', url: 'https://www.radarbox.com', descricao: 'Rastreamento de aviões e helicópteros' },
      { nome: 'ANAC — Registro de Aeronaves', url: 'https://sistemas.anac.gov.br/aeronaves/cons_pa.asp', descricao: 'Proprietários e operadores de aeronaves brasileiras' },
    ]},
  ]},
  { id: 'navegacao', titulo: 'Navegação e Portos', icone: '🚢', subsecoes: [
    { titulo: 'Embarcações', itens: [
      { nome: 'MarineTraffic', url: 'https://www.marinetraffic.com', descricao: 'Posição, bandeira, velocidade e rota de embarcações' },
      { nome: 'VesselFinder', url: 'https://www.vesselfinder.com', descricao: 'Dados detalhados de embarcações em tempo real' },
    ]},
  ]},
  { id: 'telefonia', titulo: 'Sistema Telefônico', icone: '📞', subsecoes: [
    { titulo: 'Identificação de Operadoras', itens: [
      { nome: 'Consulta Número (ABR)', url: 'https://consultanumero.abrtelecom.com.br', descricao: 'Operadora por número — base oficial' },
      { nome: 'Qual Operadora', url: 'https://www.qualoperadora.net', descricao: 'Identifica a operadora atual (portabilidade)' },
      { nome: 'Truecaller', url: 'https://www.truecaller.com', descricao: 'Identifica o responsável pelo número' },
      { nome: 'Teleco', url: 'https://www.teleco.com.br', descricao: 'Códigos e informações técnicas de telecomunicações' },
    ]},
    { titulo: 'WhatsApp', itens: [
      { nome: 'Dono do Zap', url: 'https://donodozap.com', descricao: 'Proprietário da conta por número' },
      { nome: 'Sync.me', url: 'https://sync.me', descricao: 'Busca reversa de números e fotos de perfil' },
    ]},
  ]},
  { id: 'redes-sociais', titulo: 'Redes Sociais', icone: '📱', subsecoes: [
    { titulo: 'Busca de Perfis', itens: [
      { nome: 'Sherlock', url: 'https://sherlock-project.github.io/', descricao: 'Busca de usernames em 300+ plataformas' },
      { nome: 'IntelligenceX', url: 'https://intelx.io', descricao: 'Filtragens avançadas em redes sociais e leaks' },
    ]},
    { titulo: 'Facebook / Instagram', itens: [
      { nome: 'Find Facebook ID', url: 'https://findmyfbid.in', descricao: 'Converte URL de perfil para ID numérico' },
      { nome: 'Graph Tips', url: 'https://graph.tips', descricao: 'Posts, fotos, eventos via Facebook Graph' },
      { nome: 'Snapinsta', url: 'https://snapinsta.app', descricao: 'Download geral do Instagram' },
    ]},
    { titulo: 'Twitter / X', itens: [
      { nome: 'Advanced Search', url: 'https://twitter.com/search-advanced', descricao: 'Busca oficial avançada por data, usuário e termos' },
      { nome: 'Trends24 Brazil', url: 'https://trends24.in/brazil/', descricao: 'Trending topics brasileiros em tempo real' },
      { nome: 'All My Tweets', url: 'https://www.allmytweets.net', descricao: 'Lista todos os tweets de um usuário' },
    ]},
    { titulo: 'Identidades Investigativas (AVIs)', itens: [
      { nome: '4Devs', url: 'https://www.4devs.com.br/gerador_de_pessoas', descricao: 'Dados brasileiros fictícios (CPF, nome, endereço)' },
      { nome: 'Fake Name Generator', url: 'https://www.fakenamegenerator.com', descricao: 'Identidades completas para múltiplos países' },
      { nome: 'This Person Does Not Exist', url: 'https://this-person-does-not-exist.com', descricao: 'Fotos de pessoas inexistentes via IA' },
      { nome: 'ProtonMail', url: 'https://proton.me', descricao: 'Email seguro para AVIs — sem registro de IP' },
    ]},
  ]},
  { id: 'analise-imagens', titulo: 'Análise de Imagens', icone: '🖼️', subsecoes: [
    { titulo: 'Metadados EXIF', itens: [
      { nome: 'EXIF.tools', url: 'https://exif.tools', descricao: 'Metadados completos de imagens' },
      { nome: 'ExifTool', url: 'https://exiftool.org', descricao: 'Manipulação completa de metadados — padrão ouro' },
    ]},
    { titulo: 'Busca Reversa', itens: [
      { nome: 'Google Lens', url: 'https://lens.google.com', descricao: 'Busca reversa com IA' },
      { nome: 'TinEye', url: 'https://tineye.com', descricao: 'Encontra origem e versões da imagem' },
      { nome: 'Yandex Images', url: 'https://yandex.com/images/', descricao: 'Excelente para reconhecimento facial' },
    ]},
    { titulo: 'Reconhecimento Especializado', itens: [
      { nome: 'PimEyes', url: 'https://pimeyes.com', descricao: 'Reconhecimento facial avançado na internet' },
      { nome: 'FaceCheck ID', url: 'https://facecheck.id', descricao: 'Busca de pessoas por foto' },
      { nome: 'Plate Recognizer', url: 'https://platerecognizer.com', descricao: 'Placas de veículos em imagens e vídeos' },
    ]},
  ]},
  { id: 'dominios-web', titulo: 'Domínios e Sites', icone: '🌐', subsecoes: [
    { titulo: 'Whois', itens: [
      { nome: 'Registro.br', url: 'https://registro.br/2/whois', descricao: 'Domínios .br — proprietários e contatos' },
      { nome: 'WhoIs', url: 'https://www.whois.com', descricao: 'Domínios internacionais' },
      { nome: 'DomainTools', url: 'https://www.domaintools.com', descricao: 'Análise detalhada e histórico de registros' },
    ]},
    { titulo: 'Análise Técnica', itens: [
      { nome: 'DNS Dumpster', url: 'https://dnsdumpster.com', descricao: 'Mapeamento visual de DNS' },
      { nome: 'Shodan', url: 'https://www.shodan.io', descricao: 'Dispositivos conectados (IoT) e servidores expostos' },
      { nome: 'ViewDNS', url: 'https://viewdns.info', descricao: 'Múltiplas ferramentas DNS em um lugar' },
    ]},
    { titulo: 'Histórico e Segurança', itens: [
      { nome: 'Wayback Machine', url: 'https://web.archive.org', descricao: 'Snapshots históricos de qualquer site' },
      { nome: 'Malware Domain List', url: 'https://www.malwaredomainlist.com', descricao: 'Lista de domínios maliciosos conhecidos' },
    ]},
  ]},
  { id: 'emails', titulo: 'Análise de Emails', icone: '📧', subsecoes: [
    { titulo: 'Rastreamento e Domínios', itens: [
      { nome: 'MX Toolbox', url: 'https://mxtoolbox.com', descricao: 'Servidores MX, blacklists e verificação de email' },
      { nome: 'Hunter.io', url: 'https://hunter.io', descricao: 'Busca de emails corporativos por domínio' },
      { nome: 'G Suite Toolbox', url: 'https://toolbox.googleapps.com/apps/messageheader/', descricao: 'Análise completa de headers de email' },
    ]},
  ]},
  { id: 'geolocalizacao', titulo: 'Geolocalização', icone: '🌍', subsecoes: [
    { titulo: 'Imagens de Satélite', itens: [
      { nome: 'Google Earth', url: 'https://earth.google.com', descricao: 'Visão 3D mundial com histórico temporal' },
      { nome: 'Google Maps', url: 'https://maps.google.com', descricao: 'Street View e análise de endereços' },
      { nome: 'Sentinel Hub', url: 'https://www.sentinel-hub.com', descricao: 'Imagens de satélite atualizadas' },
      { nome: 'SunCalc', url: 'https://www.suncalc.org', descricao: 'Posição solar — útil para data/hora de imagens' },
    ]},
  ]},
  { id: 'poder-executivo', titulo: 'Poder Executivo', icone: '🏛️', subsecoes: [
    { titulo: 'Transparência', itens: [
      { nome: 'Portal Transparência', url: 'https://portaldatransparencia.gov.br', descricao: 'Servidores, orçamento, convênios, sanções' },
      { nome: 'Dados Abertos Gov', url: 'https://dados.gov.br', descricao: '+6.500 conjuntos de dados governamentais' },
      { nome: 'Acesso à Informação (LAI)', url: 'https://www.gov.br/acessoainformacao/pt-br', descricao: 'Pedidos via Lei de Acesso à Informação' },
    ]},
    { titulo: 'Licitações', itens: [
      { nome: 'Portal Nacional de Contratações Públicas', url: 'https://pncp.gov.br', descricao: 'Licitações públicas em âmbito nacional' },
      { nome: 'Painel de Preços', url: 'https://paineldeprecos.planejamento.gov.br', descricao: 'Compras públicas via COMPRASNET' },
    ]},
    { titulo: 'Publicações', itens: [
      { nome: 'Diário Oficial (DOU)', url: 'https://www.in.gov.br', descricao: 'Publicações de todos os entes da federação' },
      { nome: 'SICONV', url: 'https://www.transferegov.gov.br', descricao: 'Convênios federais com estados e municípios' },
    ]},
  ]},
  { id: 'poder-judiciario', titulo: 'Poder Judiciário', icone: '⚖️', subsecoes: [
    { titulo: 'Tribunais Superiores', itens: [
      { nome: 'STF', url: 'https://portal.stf.jus.br', descricao: 'Supremo Tribunal Federal' },
      { nome: 'STJ', url: 'https://www.stj.jus.br', descricao: 'Superior Tribunal de Justiça' },
      { nome: 'TST', url: 'https://www.tst.jus.br', descricao: 'Tribunal Superior do Trabalho' },
      { nome: 'TSE', url: 'https://www.tse.jus.br', descricao: 'Tribunal Superior Eleitoral' },
    ]},
    { titulo: 'Consulta Processual', itens: [
      { nome: 'JusBrasil', url: 'https://www.jusbrasil.com.br', descricao: 'Jurisprudência e diários oficiais unificados' },
      { nome: 'Escavador', url: 'https://www.escavador.com', descricao: 'Menções em diários oficiais e tribunais' },
      { nome: 'CNJ — Consulta Processual', url: 'https://www.cnj.jus.br', descricao: 'Busca unificada em todos os tribunais' },
    ]},
    { titulo: 'Dados Eleitorais', itens: [
      { nome: 'Divulgação de Candidaturas', url: 'https://divulgacandcontas.tse.jus.br', descricao: 'Candidatos, bens declarados e prestação de contas' },
      { nome: 'Filiação Partidária', url: 'https://www.tse.jus.br/eleitor/filiacao-partidaria/consulta-de-filiacao-partidaria', descricao: 'Filiação partidária por CPF ou nome' },
    ]},
  ]},
  { id: 'poder-legislativo', titulo: 'Poder Legislativo', icone: '📜', subsecoes: [
    { titulo: 'Federal', itens: [
      { nome: 'Câmara Federal', url: 'https://www.camara.leg.br', descricao: 'Deputados, gastos da cota parlamentar e votações' },
      { nome: 'Senado Federal', url: 'https://www12.senado.leg.br/transparencia', descricao: 'Senadores, atividades e transparência' },
    ]},
  ]},
  { id: 'frameworks', titulo: 'Frameworks OSINT', icone: '🔧', subsecoes: [
    { titulo: 'Plataformas', itens: [
      { nome: 'OSINT Framework', url: 'https://osintframework.com', descricao: 'Hub interativo com centenas de ferramentas' },
      { nome: 'Maltego Community', url: 'https://www.maltego.com', descricao: 'Análise de vínculos e grafos de relacionamento' },
      { nome: 'Spiderfoot', url: 'https://www.spiderfoot.net', descricao: 'Reconhecimento automatizado em 100+ fontes' },
      { nome: 'IntelligenceX', url: 'https://intelx.io', descricao: 'Busca em leaks, dark web e domínios' },
    ]},
  ]},
  { id: 'meio-ambiente', titulo: 'Meio Ambiente', icone: '🌿', subsecoes: [
    { titulo: 'Monitoramento Florestal', itens: [
      { nome: 'DETER — INPE', url: 'https://terrabrasilis.dpi.inpe.br/app/dashboard/alerts/legal/amazon/aggregated/', descricao: 'Alertas de desmatamento em tempo quase-real' },
      { nome: 'Queimadas INPE', url: 'https://queimadas.dgi.inpe.br/queimadas/portal', descricao: 'Focos de incêndio no Brasil' },
      { nome: 'MapBiomas', url: 'https://plataforma.mapbiomas.org', descricao: 'Cobertura e uso da terra — 1985 a atual' },
    ]},
    { titulo: 'Fiscalização IBAMA', itens: [
      { nome: 'Embargos IBAMA', url: 'https://servicos.ibama.gov.br/ctf/publico/areasembargadas/ConsultaPublicaAreasEmbargadas.php', descricao: 'Áreas embargadas pelo IBAMA' },
      { nome: 'CTF — Cadastro Técnico', url: 'https://servicos.ibama.gov.br/ctf/publico/mttr/ConsultaPublicaRegistroEmpreendimentos.php', descricao: 'Regularidade ambiental de empresas' },
    ]},
  ]},
];

const DORKS = [
  { operador: '"termo"', exemplo: '"João Silva"', funcao: 'Busca exata' },
  { operador: 'site:', exemplo: 'site:gov.br corrupção', funcao: 'Apenas no domínio' },
  { operador: 'filetype:', exemplo: 'relatório filetype:pdf', funcao: 'Tipo de arquivo' },
  { operador: 'intitle:', exemplo: 'intitle:transparência', funcao: 'Título da página' },
  { operador: 'inurl:', exemplo: 'inurl:admin', funcao: 'Na URL' },
  { operador: 'intext:', exemplo: 'intext:corrupção', funcao: 'No texto da página' },
  { operador: '-', exemplo: 'jaguar -carro', funcao: 'Exclui termo' },
  { operador: 'OR', exemplo: 'brasil OR brazil', funcao: 'Um ou outro' },
  { operador: 'cache:', exemplo: 'cache:exemplo.com', funcao: 'Versão em cache' },
  { operador: 'related:', exemplo: 'related:www.gov.br', funcao: 'Sites similares' },
];

export default function OsintHub() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('pesquisas-gerais');

  useEffect(() => {
    fetch('/api/session').then(r => {
      if (!r.ok) { router.push('/login'); return; }
      setAuthorized(true);
    });
  }, [router]);

  if (!authorized) return <div className="min-h-screen bg-[#0f172a]" />;

  const filtered = SECOES.map(s => ({
    ...s,
    subsecoes: s.subsecoes.map(sub => ({
      ...sub,
      itens: sub.itens.filter(i =>
        !search ||
        i.nome.toLowerCase().includes(search.toLowerCase()) ||
        (i.descricao || '').toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(sub => !search || sub.itens.length > 0),
  })).filter(s => !search || s.subsecoes.length > 0);

  const active = filtered.find(s => s.id === activeSection) || filtered[0];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 font-sans flex flex-col">
      <div className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-sky-400" />
          <span className="font-black text-sky-400 uppercase tracking-widest text-sm">Intel Hub OSINT</span>
          <span className="text-slate-600 text-xs font-mono">V3</span>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Pesquisar ferramenta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-sky-500 w-64"
          />
          <button onClick={() => { localStorage.removeItem('mad_access_token'); router.push('/'); }} className="flex items-center gap-2 text-slate-500 hover:text-red-500 text-sm font-bold uppercase">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        <nav className="w-64 min-w-[16rem] bg-slate-900/50 border-r border-slate-800 py-4 overflow-y-auto sticky top-[57px] h-[calc(100vh-57px)]">
          {SECOES.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setSearch(''); }}
              className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-all ${activeSection === s.id ? 'bg-sky-500/10 text-sky-400 border-r-2 border-sky-400' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'}`}
            >
              <span>{s.icone}</span> {s.titulo}
            </button>
          ))}
          <div className="px-5 py-3 mt-2 border-t border-slate-800">
            <button
              onClick={() => { setActiveSection('dorks'); setSearch(''); }}
              className={`w-full text-left text-sm font-bold flex items-center gap-3 transition-all py-2 ${activeSection === 'dorks' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-200'}`}
            >
              <span>📝</span> Operadores Google
            </button>
          </div>
        </nav>

        <main className="flex-1 p-10 overflow-y-auto">
          {activeSection === 'dorks' ? (
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">📝 Operadores Google (Dorks)</h2>
              <div className="overflow-hidden border border-slate-800 rounded-2xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-sky-400 uppercase text-xs font-black">
                    <tr><th className="px-6 py-4 text-left">Operador</th><th className="px-6 py-4 text-left">Exemplo</th><th className="px-6 py-4 text-left">Função</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {DORKS.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-mono text-sky-300 font-bold">{d.operador}</td>
                        <td className="px-6 py-4 font-mono text-slate-400 text-xs">{d.exemplo}</td>
                        <td className="px-6 py-4 text-slate-400">{d.funcao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              {(search ? filtered : active ? [active] : []).map(secao => (
                <div key={secao.id} className="mb-12">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                    {secao.icone} {secao.titulo}
                  </h2>
                  {secao.subsecoes.map((sub, si) => (
                    <div key={si} className="mb-8">
                      <h3 className="text-xs font-black text-sky-500 uppercase tracking-widest mb-4">{sub.titulo}</h3>
                      <div className="overflow-hidden border border-slate-800 rounded-2xl">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-900 text-slate-500 uppercase text-xs font-bold">
                            <tr><th className="px-6 py-3 text-left">Ferramenta</th><th className="px-6 py-3 text-left">Descrição</th><th className="px-6 py-3 text-right">Link</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {sub.itens.map((item, ii) => (
                              <tr key={ii} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-bold text-slate-200">{item.nome}</td>
                                <td className="px-6 py-4 text-slate-500">{item.descricao}</td>
                                <td className="px-6 py-4 text-right">
                                  {item.url && (
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-300 font-bold text-xs uppercase">
                                      Acessar <ExternalLink size={12} />
                                    </a>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <a href="https://marcus.aleks.nom.br" className="mad-signature" aria-label="built by mad"><img src="/favicon.png" width={16} height={16} alt="MAD" />built by mad</a>
    </div>
  );
}
