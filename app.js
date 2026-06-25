'use strict';

const STORAGE_KEY = 'paoa_lab_v1';
const APP_VERSION = '1.9.0';
const MEAT_CUTS_SOURCE_URL = 'https://nepa.unicamp.br/publicacoes/tabela-taco-pdf/';

const MEAT_CUTS = [
  { id: 'acem', nome: 'Acém bovino', comGordura: 5.9, semGordura: 6.1, fonteCom: 'TACO: acém moído, cru', fonteSem: 'TACO: acém sem gordura, cru' },
  { id: 'fraldinha', nome: 'Fraldinha / flanco bovino', comGordura: 16.1, semGordura: 6.2, fonteCom: 'TACO: fraldinha com gordura, crua', fonteSem: 'TACO: flanco sem gordura, cru' },
  { id: 'peito_bovino', nome: 'Peito bovino', comGordura: null, semGordura: 20.4, fonteSem: 'TACO: peito sem gordura, cru' },
  { id: 'alcatra', nome: 'Miolo de alcatra bovina', comGordura: null, semGordura: 7.8, fonteSem: 'TACO: miolo de alcatra sem gordura, cru' },
  { id: 'coxao_mole', nome: 'Coxão mole bovino', comGordura: null, semGordura: 8.7, fonteSem: 'TACO: coxão mole sem gordura, cru' },
  { id: 'coxao_duro', nome: 'Coxão duro bovino', comGordura: null, semGordura: 6.2, fonteSem: 'TACO: coxão duro sem gordura, cru' },
  { id: 'patinho', nome: 'Patinho bovino', comGordura: null, semGordura: 4.5, fonteSem: 'TACO: patinho sem gordura, cru' },
  { id: 'lagarto', nome: 'Lagarto bovino', comGordura: 5.2, semGordura: null, fonteCom: 'TACO: lagarto, cru; a tabela não especifica retirada de gordura' },
  { id: 'maminha', nome: 'Maminha bovina', comGordura: 7, semGordura: null, fonteCom: 'TACO: maminha, crua; a tabela não especifica retirada de gordura' },
  { id: 'musculo', nome: 'Músculo bovino', comGordura: null, semGordura: 5.5, fonteSem: 'TACO: músculo sem gordura, cru' },
  { id: 'paleta', nome: 'Paleta bovina', comGordura: 7.5, semGordura: 5.7, fonteCom: 'TACO: paleta com gordura, crua', fonteSem: 'TACO: paleta sem gordura, crua' },
  { id: 'contrafile', nome: 'Contrafilé bovino', comGordura: 12.8, semGordura: 6, fonteCom: 'TACO: contrafilé com gordura, cru', fonteSem: 'TACO: contrafilé sem gordura, cru' },
  { id: 'file_mignon', nome: 'Filé mignon bovino', comGordura: null, semGordura: 5.6, fonteSem: 'TACO: filé mignon sem gordura, cru' },
  { id: 'picanha', nome: 'Picanha bovina', comGordura: 14.7, semGordura: 4.7, fonteCom: 'TACO: picanha com gordura, crua', fonteSem: 'TACO: picanha sem gordura, crua' },
  { id: 'costela_bovina', nome: 'Costela bovina', comGordura: 31.8, semGordura: null, fonteCom: 'TACO: costela, crua; a tabela não especifica retirada de gordura' },
  { id: 'cupim', nome: 'Cupim bovino', comGordura: 15.3, semGordura: null, fonteCom: 'TACO: cupim, cru; a tabela não especifica retirada de gordura' },
  { id: 'pernil_suino', nome: 'Pernil suíno', comGordura: 11.1, semGordura: null, fonteCom: 'TACO: porco, pernil, cru' },
  { id: 'lombo_suino', nome: 'Lombo suíno', comGordura: 8.8, semGordura: null, fonteCom: 'TACO: porco, lombo, cru' },
  { id: 'peito_frango', nome: 'Peito de frango', comGordura: 6.7, semGordura: 3, fonteCom: 'TACO: peito de frango com pele, cru', fonteSem: 'TACO: peito de frango sem pele, cru' },
  { id: 'coxa_frango', nome: 'Coxa de frango', comGordura: 9.8, semGordura: 4.9, fonteCom: 'TACO: coxa de frango com pele, crua', fonteSem: 'TACO: coxa de frango sem pele, crua' },
  { id: 'sobrecoxa_frango', nome: 'Sobrecoxa de frango', comGordura: 20.9, semGordura: 9.6, fonteCom: 'TACO: sobrecoxa de frango com pele, crua', fonteSem: 'TACO: sobrecoxa de frango sem pele, crua' },
  { id: 'gordura_bovina', nome: 'Gordura bovina adicionada', comGordura: 100, semGordura: null, fonteCom: 'Gordura de formulação; ajustar conforme análise ou ficha técnica' },
  { id: 'toucinho_suino', nome: 'Toucinho suíno', comGordura: 60.3, semGordura: null, fonteCom: 'TACO: toucinho, cru' },
  { id: 'outro', nome: 'Outro corte ou matéria-prima', comGordura: 0, semGordura: 0, fonteCom: 'Informe o teor analisado ou consultado', fonteSem: 'Informe o teor analisado ou consultado' }
];

const TYPES = [
  { value: 'materia_prima_carnea', label: 'Matéria-prima cárnea', subtipos: [], exemplos: 'carne bovina, frango, pernil, toucinho, pele suína' },
  { value: 'basico_nao_carneo', label: 'Ingredientes básicos não cárneos', subtipos: [], exemplos: 'água, gelo, sal, açúcar, dextrose' },
  { value: 'condimento_especiaria', label: 'Condimentos e especiarias', subtipos: ['naturais', 'frescos', 'desidratados', 'em pó', 'moídos', 'extratos'], exemplos: 'alho em pó, cebola, pimenta-do-reino preta moída, pimenta branca moída, páprica, noz-moscada moída' },
  { value: 'funcional_nao_aditivo', label: 'Ingredientes funcionais não aditivos', subtipos: ['proteínas', 'amidos/farinhas', 'fibras', 'hidrocoloides usados como ingrediente', 'lácteos', 'ovos'], exemplos: 'proteína de soja, fécula, amido, farinha de rosca, leite em pó, ovo' },
  { value: 'aditivo_alimentar', label: 'Aditivos alimentares', subtipos: ['conservadores', 'antioxidantes', 'estabilizantes', 'emulsificantes', 'espessantes', 'corantes', 'reguladores de acidez', 'realçadores de sabor', 'aromatizantes'], exemplos: 'nitrito, nitrato, eritorbato, fosfato, corante, glutamato' },
  { value: 'coadjuvante_tecnologia', label: 'Coadjuvantes de tecnologia', subtipos: [], exemplos: 'enzimas, agentes de cura/processo, nitrogênio/CO2' },
  { value: 'cultura_fermento', label: 'Culturas e fermentos', subtipos: [], exemplos: 'culturas para salame, fermentação/maturação' },
  { value: 'envoltorio_apresentacao', label: 'Envoltórios e insumos de apresentação', subtipos: ['envoltório comestível', 'envoltório não comestível', 'embalagem', 'clips', 'barbante', 'rótulo'], exemplos: 'tripa natural, tripa de colágeno, embalagem a vácuo' },
  { value: 'mistura_comercial', label: 'Misturas/preparados comerciais', subtipos: ['mistura de cura', 'blend de condimentos', 'preparado funcional'], exemplos: 'condimento para linguiça, sal de cura, mix para hambúrguer' }
];

const LEGACY_TYPE_MAP = {
  carne: 'materia_prima_carnea',
  gordura: 'materia_prima_carnea',
  agua: 'basico_nao_carneo',
  sal: 'basico_nao_carneo',
  condimento: 'condimento_especiaria',
  carboidrato: 'funcional_nao_aditivo',
  proteina_nao_carnea: 'funcional_nao_aditivo',
  aditivo: 'aditivo_alimentar',
  lacteo: 'funcional_nao_aditivo',
  outro: 'funcional_nao_aditivo'
};

const DEFAULT_RULES = [
  { id: 'regra_entrada', numero: '01', titulo: 'Entrada no laboratório', texto: 'Usar jaleco claro fechado, touca sanfonada, calçado fechado e mãos higienizadas antes de iniciar a prática.' },
  { id: 'regra_higiene', numero: '02', titulo: 'Higiene e EPI', texto: 'Manter luvas limpas, prender cabelos sob a touca e evitar adornos, relógios, perfumes fortes ou objetos soltos.' },
  { id: 'regra_bancada', numero: '03', titulo: 'Bancada e utensílios', texto: 'Sanitizar superfícies, separar utensílios por etapa e manter apenas o material necessário sobre a bancada.' },
  { id: 'regra_temperatura', numero: '04', titulo: 'Temperatura e matéria-prima', texto: 'Controlar tempo fora de refrigeração, pesar rapidamente e registrar qualquer alteração observada no produto.' },
  { id: 'regra_equipamentos', numero: '05', titulo: 'Equipamentos', texto: 'Operar moedor, cutter, embutidora e demais equipamentos apenas com autorização e supervisão do professor ou técnico.' },
  { id: 'regra_encerramento', numero: '06', titulo: 'Encerramento', texto: 'Identificar amostras, descartar resíduos corretamente, lavar utensílios e deixar a bancada pronta para a próxima turma.' }
];

const IMAGE_MIGRATIONS = {
  'assets/hamburguer-bovino.png': 'assets/hamburguer-bovino.jpg',
  'assets/linguica-frescal.png': 'assets/linguica-frescal.jpg'
};

const PRODUCT_CATEGORIES = [
  {
    id: 'reestruturados',
    titulo: 'Produtos Reestruturados',
    resumo: 'Produtos reestruturados usam cortes moídos ou fragmentados, sal, água/gelo e trabalho mecânico para reorganizar proteínas e formar uma matriz coesa.',
    topicos: [
      'Extração de proteínas miofibrilares e formação de liga',
      'Distribuição de gordura e impacto em suculência, maciez e rendimento',
      'Modelagem em porções padronizadas e avaliação de perda por cocção',
      'Formulações podem ser calculadas sobre a massa cárnea ou sobre 100% do produto final'
    ],
    perguntas: [
      'O que muda na textura quando a gordura é reduzida?',
      'Por que sal e mistura mecânica ajudam na coesão?',
      'Como interpretar percentuais sobre massa cárnea em vez de produto final?'
    ],
    produtos: ['prod_hamburguer', 'prod_kafta', 'prod_almondega'],
    insumos: ['ing_carne_bovina_magra', 'ing_gordura_bovina', 'ing_sal', 'ing_agua_gelada', 'ing_alho_po', 'ing_farinha_rosca']
  },
  {
    id: 'embutidos',
    titulo: 'Produtos Embutidos',
    etiqueta: 'Processos cárneos',
    resumo: 'Produtos embutidos organizam massa cárnea, gordura, condimentos e envoltório para padronizar formato, calibre, textura e conservação.',
    topicos: [
      'Moagem, mistura e controle de temperatura da massa',
      'Função do envoltório natural ou artificial na forma, mordida e aparência',
      'Diferenças entre embutidos frescos, cozidos, curados e dessecados',
      'Controle de bolsas de ar, distribuição de gordura e conservação refrigerada'
    ],
    perguntas: [
      'Como a granulometria muda a aparência e a mordida do produto?',
      'Por que o produto frescal exige atenção maior à refrigeração?',
      'Que falhas de processo aparecem durante o embutimento?'
    ],
    produtos: ['prod_linguica_frescal', 'prod_salsicha'],
    insumos: ['ing_pernil_suino', 'ing_toucinho_suino', 'ing_sal', 'ing_agua_gelada', 'ing_tripa_suina', 'ing_paprica_doce']
  },
  {
    id: 'emulsionados',
    titulo: 'Produtos Emulsionados',
    resumo: 'Produtos emulsionados dependem de trituração fina, gelo, sal e proteínas solubilizadas para estabilizar água, gordura e fase cárnea em uma massa homogênea.',
    topicos: [
      'Controle de temperatura durante cutterização ou processamento fino',
      'Papel do sal, gelo e fosfatos na extração proteica e estabilidade',
      'Formação de emulsão cárnea, textura fina e perda de gordura por cocção',
      'Relação entre produto emulsionado, embutimento e tratamento térmico'
    ],
    perguntas: [
      'O que acontece quando a massa aquece demais durante a emulsificação?',
      'Como gelo, gordura e proteína influenciam estabilidade e textura?',
      'Por que alguns produtos podem pertencer a mais de uma categoria?'
    ],
    produtos: ['prod_pate', 'prod_salsicha'],
    insumos: ['ing_pernil_suino', 'ing_toucinho_suino', 'ing_agua_gelada', 'ing_sal', 'ing_fosfato', 'ing_amido', 'ing_leite_po']
  }
];

const DEFAULT_DB = {
  app_id: 'paoa_lab',
  version: APP_VERSION,
  configs: { ultimoProdutoAula: 'prod_hamburguer', produtoSelecionado: '', filtroInsumo: 'todos', periodoAtivoId: 'periodo_demo', periodos: [], regrasLaboratorio: clone(DEFAULT_RULES), conteudosTeoricos: [] },
  produtos: [
    {
      id: 'prod_hamburguer',
      nome: 'Hambúrguer bovino',
      categoria: 'Produto cárneo reestruturado',
      categoriaId: 'reestruturados',
      categoriaIds: ['reestruturados'],
      especie: 'bovina',
      tipo: 'hamburguer',
      descricao: 'Produto cárneo industrializado obtido de carne moída, com ou sem tecido adiposo e ingredientes, moldado e submetido a processo tecnológico adequado.',
      objetivo: 'Compreender o efeito da gordura, do sal, da água gelada e do trabalho mecânico na formação da textura, suculência e rendimento do hambúrguer.',
      parametros: {
        gorduraMax: 25,
        proteinaMin: 15,
        carbMax: 3,
        proteinaNaoCarneaMax: 4,
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/hamburguer-bovino.jpg'],
      fluxo: [
        'Recepção e seleção da matéria-prima refrigerada',
        'Pesagem dos insumos conforme a formulação',
        'Moagem da carne e da gordura',
        'Mistura com sal, água gelada e condimentos',
        'Trabalho mecânico para melhorar a extração proteica e a liga',
        'Moldagem em porções padronizadas',
        'Congelamento ou cocção conforme o objetivo da prática',
        'Avaliação de rendimento, textura, suculência e aparência'
      ],
      pontos: [
        'Manter carne e gordura refrigeradas durante a manipulação',
        'Conferir se a soma da formulação está em 100%',
        'Controlar o teor de gordura da formulação',
        'Evitar excesso de água livre',
        'Registrar peso antes e depois da cocção',
        'Conferir limites legais quando houver proteína não cárnea ou carboidratos'
      ],
      equipamentos: [
        'Balança semianalítica ou balança de bancada',
        'Moedor de carne',
        'Bacias ou bowls de aço inox',
        'Modelador de hambúrguer',
        'Papel filme ou papel manteiga para separação das unidades',
        'Chapa, frigideira ou grill para cocção experimental',
        'Termômetro tipo espeto',
        'Luvas, touca, avental e superfície higienizada'
      ],
      perguntas: [
        'Qual foi o papel do sal na formação da textura?',
        'Como a gordura influenciou a suculência e a maciez?',
        'A formulação atende aos parâmetros legais de gordura, proteína e carboidratos?',
        'O que mudaria se fosse usado outro corte ou outra espécie animal?'
      ]
    },
    {
      id: 'prod_kafta',
      nome: 'Kafta bovina',
      categoria: 'Produto cárneo reestruturado moldado',
      categoriaId: 'reestruturados',
      categoriaIds: ['reestruturados'],
      especie: 'bovina',
      tipo: 'geral',
      descricao: 'Preparação cárnea reestruturada, condimentada e moldada em formato alongado, útil para discutir liga, modelagem, padronização de porções e estabilidade durante cocção.',
      objetivo: 'Avaliar como condimentos, teor de gordura, mistura mecânica e moldagem influenciam coesão, aparência, rendimento e estabilidade da kafta.',
      parametros: {
        gorduraMax: '',
        proteinaMin: '',
        carbMax: '',
        proteinaNaoCarneaMax: '',
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/kafta-bovina.jpg'],
      fluxo: [
        'Seleção da carne e gordura sob refrigeração',
        'Moagem da matéria-prima na granulometria definida',
        'Pesagem dos condimentos conforme a formulação',
        'Mistura até distribuição uniforme e boa coesão da massa',
        'Moldagem em espetos ou porções alongadas padronizadas',
        'Pesagem antes da cocção para cálculo de rendimento',
        'Cocção experimental em chapa, forno ou grelha',
        'Avaliação de perda por cocção, estabilidade, textura e aparência'
      ],
      pontos: [
        'Manter a massa fria para evitar perda de definição e exsudação de gordura',
        'Padronizar peso e formato das porções',
        'Evitar excesso de condimentos secos que fragilizem a coesão',
        'Registrar peso antes e depois da cocção',
        'Observar rachaduras, desprendimento do espeto e perda de suculência'
      ],
      equipamentos: [
        'Balança de bancada',
        'Moedor de carne',
        'Bowls de aço inox',
        'Espetos ou moldes alongados',
        'Espátulas e bandejas',
        'Chapa, forno ou grelha para cocção experimental',
        'Termômetro tipo espeto',
        'Papel filme para padronização e descanso da massa'
      ],
      perguntas: [
        'Como a intensidade da mistura alterou a coesão da kafta?',
        'O formato alongado aumenta ou reduz a perda por cocção?',
        'Quais condimentos interferem mais na percepção sensorial?',
        'Que ajustes fariam a formulação ficar mais estável sem perder suculência?'
      ]
    },
    {
      id: 'prod_almondega',
      nome: 'Almôndega bovina',
      categoria: 'Produto cárneo reestruturado moldado',
      categoriaId: 'reestruturados',
      categoriaIds: ['reestruturados'],
      especie: 'bovina',
      tipo: 'geral',
      descricao: 'Produto cárneo moldado em porções esféricas, adequado para estudar liga, ingredientes de estrutura, perda por cocção, padronização e rendimento.',
      objetivo: 'Compreender o papel de ingredientes ligantes, gordura, mistura e padronização de tamanho na textura, rendimento e aparência da almôndega.',
      parametros: {
        gorduraMax: '',
        proteinaMin: '',
        carbMax: '',
        proteinaNaoCarneaMax: '',
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/almondega-bovina.jpg'],
      fluxo: [
        'Recepção e manutenção da carne refrigerada',
        'Moagem da carne e da gordura',
        'Pesagem dos ingredientes secos e úmidos',
        'Mistura até obtenção de massa coesa e homogênea',
        'Modelagem em unidades com peso padronizado',
        'Pesagem inicial das unidades',
        'Cocção experimental em forno, chapa ou molho padronizado',
        'Cálculo de rendimento e avaliação de textura, cor e formato'
      ],
      pontos: [
        'Controlar o tamanho das unidades para comparar rendimento',
        'Evitar mistura insuficiente, que causa desmanche na cocção',
        'Evitar mistura excessiva, que pode endurecer a textura',
        'Observar efeito de ligantes como ovo e farinha de rosca',
        'Registrar perda de massa e aparência final'
      ],
      equipamentos: [
        'Balança de bancada',
        'Moedor de carne',
        'Bowls de aço inox',
        'Colher dosadora ou porcionador',
        'Bandejas',
        'Forno, chapa ou panela para cocção experimental',
        'Termômetro tipo espeto',
        'Papel filme ou recipiente tampado para descanso'
      ],
      perguntas: [
        'Qual foi a função do ovo ou do ingrediente ligante na estrutura?',
        'Como o tamanho da almôndega altera tempo de cocção e rendimento?',
        'A formulação ficou mais macia ou mais firme do que o esperado?',
        'Que alteração faria sentido para reduzir desmanche sem deixar a textura seca?'
      ]
    },
    {
      id: 'prod_linguica_frescal',
      nome: 'Linguiça frescal suína',
      categoria: 'Embutido cárneo fresco',
      categoriaId: 'embutidos',
      categoriaIds: ['embutidos'],
      especie: 'suína',
      tipo: 'linguica_frescal',
      descricao: 'Produto cárneo fresco, moído, condimentado e embutido em envoltório natural ou artificial, mantido sob refrigeração e sem tratamento térmico no processamento.',
      objetivo: 'Relacionar granulometria, teor de gordura, sal, gelo e embutimento com textura, rendimento, aparência e controle higiênico-sanitário da linguiça frescal.',
      parametros: {
        gorduraMax: 30,
        proteinaMin: 12,
        carbMax: '',
        proteinaNaoCarneaMax: 2.5,
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/linguica-frescal.jpg'],
      fluxo: [
        'Recepção da carne suína, gordura e tripas sob refrigeração',
        'Toalete, corte e padronização dos pedaços para moagem',
        'Moagem da carne e do toucinho na granulometria definida',
        'Pesagem dos condimentos, sal e água gelada',
        'Mistura até distribuição uniforme dos ingredientes',
        'Hidratação e preparo das tripas naturais quando utilizadas',
        'Embutimento sem excesso de ar e torção em gomos padronizados',
        'Embalagem, identificação e conservação refrigerada',
        'Avaliação de rendimento, aparência, coesão e perda por cocção'
      ],
      pontos: [
        'Trabalhar com matéria-prima fria e utensílios higienizados',
        'Evitar aquecimento da massa durante moagem e mistura',
        'Controlar teor de gordura para não ultrapassar o limite do produto frescal',
        'Não utilizar CMS em linguiça frescal',
        'Evitar bolsas de ar e falhas de enchimento no embutimento',
        'Manter o produto refrigerado até a cocção experimental'
      ],
      equipamentos: [
        'Balança de bancada',
        'Moedor de carne',
        'Misturador manual ou bowls de aço inox',
        'Embutidora ou ensacadeira',
        'Tripa suína natural hidratada',
        'Barbante culinário ou amarrador',
        'Agulha fina para retirada de ar',
        'Bandejas, filme plástico e termômetro'
      ],
      perguntas: [
        'Como a granulometria altera textura e aparência?',
        'Qual é o efeito do teor de gordura sobre suculência e perda por cocção?',
        'Como o gelo ajuda no controle de temperatura e distribuição dos condimentos?',
        'Quais diferenças tecnológicas existem entre linguiça frescal, cozida e dessecada?',
        'A formulação atende aos limites de gordura e proteína previstos para linguiças frescais?'
      ]
    },
    {
      id: 'prod_pate',
      nome: 'Patê cárneo',
      categoria: 'Produto cárneo emulsionado/pastoso',
      categoriaId: 'emulsionados',
      categoriaIds: ['emulsionados'],
      especie: 'suína',
      tipo: 'geral',
      descricao: 'Produto cárneo de textura fina e espalhável, adequado para discutir trituração, emulsificação, tratamento térmico, envase e estabilidade de massa pastosa.',
      objetivo: 'Compreender como matéria-prima cárnea, gordura, água/gelo, sal, amido e processamento fino interferem na textura, estabilidade, rendimento e segurança do patê.',
      parametros: {
        gorduraMax: '',
        proteinaMin: '',
        carbMax: '',
        proteinaNaoCarneaMax: '',
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/pate-carneo.jpg'],
      fluxo: [
        'Recepção e seleção da matéria-prima refrigerada',
        'Pesagem de carnes, gordura, água/gelo, sal e ingredientes secos',
        'Pré-cominuição ou moagem da matéria-prima',
        'Processamento fino em cutter ou processador com adição gradual de gelo',
        'Ajuste de condimentos e ingredientes de estabilidade',
        'Envase em potes ou formas adequadas',
        'Tratamento térmico conforme objetivo da prática',
        'Resfriamento rápido, identificação e avaliação de textura, aparência e espalhabilidade'
      ],
      pontos: [
        'Manter a massa fria durante a trituração fina',
        'Adicionar gelo de forma controlada para evitar aquecimento',
        'Observar separação de gordura ou água livre',
        'Padronizar peso de envase para comparar rendimento',
        'Monitorar tempo e temperatura do tratamento térmico',
        'Resfriar rapidamente após o processamento térmico'
      ],
      equipamentos: [
        'Balança de bancada',
        'Moedor, cutter ou processador de alimentos',
        'Bowls de aço inox',
        'Espátulas de silicone',
        'Potes ou formas para envase',
        'Banho-maria, panela ou forno para tratamento térmico',
        'Termômetro tipo espeto',
        'Bandejas e filme plástico'
      ],
      perguntas: [
        'O que indica instabilidade quando aparece água livre ou gordura separada?',
        'Como a temperatura da massa interfere na textura final?',
        'Qual ingrediente teve maior impacto na espalhabilidade?',
        'Como o envase e o resfriamento podem afetar segurança e padronização?'
      ]
    },
    {
      id: 'prod_salsicha',
      nome: 'Salsicha',
      categoria: 'Produto cárneo embutido e emulsionado',
      categoriaId: 'embutidos',
      categoriaIds: ['embutidos', 'emulsionados'],
      especie: 'suína',
      tipo: 'geral',
      descricao: 'Produto cárneo emulsionado, embutido e cozido, usado para integrar conceitos de emulsão cárnea, envoltório, estabilidade, tratamento térmico e resfriamento.',
      objetivo: 'Relacionar cutterização, teor de gordura, gelo, sal, estabilidade da emulsão e embutimento com textura fina, rendimento, aparência e qualidade da salsicha.',
      parametros: {
        gorduraMax: '',
        proteinaMin: '',
        carbMax: '',
        proteinaNaoCarneaMax: '',
        proibeProteinaNaoCarnea: false,
        mostrarValidacao: true
      },
      fotos: ['assets/salsicha.jpg'],
      fluxo: [
        'Recepção e manutenção das matérias-primas sob refrigeração',
        'Corte, pesagem e pré-moagem de carnes e gordura',
        'Cutterização com sal, gelo e ingredientes secos',
        'Acompanhamento da temperatura da massa durante a emulsificação',
        'Embutimento em envoltório apropriado e padronização do calibre',
        'Tratamento térmico até atingir temperatura interna definida',
        'Resfriamento rápido em água fria ou banho de gelo',
        'Avaliação de textura, cor, estabilidade e perda por cocção'
      ],
      pontos: [
        'Evitar aquecimento excessivo durante a cutterização',
        'Adicionar gelo gradualmente para controlar temperatura e hidratação',
        'Observar quebra de emulsão, exsudação e falhas de textura',
        'Evitar bolhas de ar e variação de calibre no embutimento',
        'Monitorar temperatura interna no cozimento',
        'Resfriar rapidamente para interromper cocção e estabilizar textura'
      ],
      equipamentos: [
        'Balança de bancada',
        'Moedor de carne',
        'Cutter, processador ou emulsificador',
        'Embutidora',
        'Envoltório artificial ou natural adequado',
        'Tanque, panela ou banho-maria para cozimento',
        'Banho de gelo para resfriamento',
        'Termômetro tipo espeto e bandejas'
      ],
      perguntas: [
        'Por que a salsicha aparece em Embutidos e em Emulsionados?',
        'Quais sinais indicam quebra de emulsão?',
        'Como temperatura e gelo influenciam textura e rendimento?',
        'O envoltório usado alterou aparência, calibre ou mordida?'
      ]
    }
  ],
  insumos: [
    { id: 'ing_carne_bovina_magra', nome: 'Carne bovina magra', categoria: 'Matéria-prima cárnea', tipo: 'carne', funcao: 'Fornece proteínas miofibrilares responsáveis pela estrutura, liga e textura do produto.', obs: 'Em aula, comparar cortes mais magros e cortes com maior teor de gordura evidencia diferenças de textura e rendimento.', gordura: 5, proteina: 20, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_gordura_bovina', nome: 'Gordura bovina', categoria: 'Gordura animal', tipo: 'gordura', funcao: 'Contribui para suculência, sabor, maciez e percepção de palatabilidade.', obs: 'Deve ser bem distribuída para evitar perda excessiva durante a cocção.', gordura: 100, proteina: 0, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_pernil_suino', nome: 'Pernil suíno magro', categoria: 'Matéria-prima cárnea', tipo: 'carne', funcao: 'Base proteica da linguiça frescal; contribui para estrutura, rendimento e sabor característico.', obs: 'Manter refrigerado e moer frio para reduzir liberação de gordura.', gordura: 8, proteina: 20, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_toucinho_suino', nome: 'Toucinho suíno', categoria: 'Gordura animal', tipo: 'gordura', funcao: 'Ajusta o teor de gordura, melhora suculência e contribui para sabor e textura do embutido.', obs: 'Cortar em cubos e manter frio antes da moagem para preservar definição de partículas.', gordura: 99, proteina: 1, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_agua_gelada', nome: 'Água gelada / gelo', categoria: 'Veículo tecnológico', tipo: 'agua', funcao: 'Ajuda na distribuição dos ingredientes, hidratação e controle de temperatura durante a mistura.', obs: 'O excesso pode deixar a massa pouco coesa ou favorecer exsudação.', gordura: 0, proteina: 0, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_sal', nome: 'Sal', categoria: 'Condimento / sal', tipo: 'sal', funcao: 'Contribui para sabor e favorece a extração de proteínas miofibrilares, aumentando a liga da massa.', obs: 'Em aula, comparar teores de sal mostra diferença de coesão e percepção sensorial.', gordura: 0, proteina: 0, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_alho_po', nome: 'Alho em pó', categoria: 'Condimento', tipo: 'condimento', funcao: 'Fornece sabor e aroma característicos.', obs: 'Pode ser substituído por alho fresco, ajustando umidade e intensidade.', gordura: 0, proteina: 0, carboidrato: 70, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_pimenta_reino', nome: 'Pimenta-do-reino preta', categoria: 'Condimento', tipo: 'condimento', subtipo: 'moídos', funcao: 'Ajusta pungência e aroma, ajudando a caracterizar o perfil sensorial do produto.', obs: 'Usar pequenas quantidades para não mascarar diferenças entre formulações.', gordura: 3, proteina: 10, carboidrato: 64, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_paprica_doce', nome: 'Páprica doce', categoria: 'Condimento', tipo: 'condimento', funcao: 'Contribui para cor e aroma suave em embutidos frescais.', obs: 'Permite discutir padronização visual sem depender de corantes.', gordura: 13, proteina: 14, carboidrato: 54, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_acucar', nome: 'Açúcar', categoria: 'Carboidrato', tipo: 'carboidrato', funcao: 'Equilibra sabor e pode contribuir para escurecimento em produtos submetidos à cocção.', obs: 'Em linguiça frescal, usar em baixo teor para ajuste sensorial.', gordura: 0, proteina: 0, carboidrato: 100, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_cebola_desidratada', nome: 'Cebola desidratada', categoria: 'Condimento', tipo: 'condimento', funcao: 'Fornece aroma e dulçor característicos, contribuindo para o perfil sensorial de produtos moldados.', obs: 'Permite padronização melhor que cebola fresca, que varia em umidade.', gordura: 1, proteina: 10, carboidrato: 75, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_salsa_desidratada', nome: 'Salsa desidratada', categoria: 'Condimento / erva', tipo: 'condimento', funcao: 'Adiciona notas herbais e pontos visuais verdes em produtos como kafta e almôndega.', obs: 'Usar em baixo teor para não mascarar diferenças de textura.', gordura: 4, proteina: 22, carboidrato: 51, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_farinha_rosca', nome: 'Farinha de rosca', categoria: 'Ingrediente ligante', tipo: 'carboidrato', funcao: 'Auxilia na absorção de umidade e na estrutura de produtos moldados, reduzindo desmanche durante a cocção.', obs: 'Discutir presença de glúten e impacto sobre textura, rendimento e rotulagem.', gordura: 3, proteina: 13, carboidrato: 72, custo: 0, proteinaNaoCarnea: false, alergeno: true },
    { id: 'ing_ovo_liquido', nome: 'Ovo líquido', categoria: 'Ingrediente ligante', tipo: 'outro', funcao: 'Contribui para liga, emulsificação parcial e estrutura térmica em produtos moldados.', obs: 'Ingrediente alergênico; útil para comparar formulações com e sem ligante proteico.', gordura: 10, proteina: 12, carboidrato: 1, custo: 0, proteinaNaoCarnea: false, alergeno: true },
    { id: 'ing_tripa_suina', nome: 'Tripa suína natural', categoria: 'Envoltório', tipo: 'outro', funcao: 'Envoltório comestível que dá formato ao embutido e influencia aparência, calibre e mordida.', obs: 'Hidratar, lavar e manter sob boas condições higiênicas antes do embutimento.', gordura: 0, proteina: 0, carboidrato: 0, custo: 0, usadoNaFormulacao: false, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_proteina_soja', nome: 'Proteína de soja texturizada/fina', categoria: 'Proteína não cárnea', tipo: 'proteina_nao_carnea', funcao: 'Pode contribuir para retenção de água, rendimento e textura, respeitando os limites do produto.', obs: 'Discutir rotulagem, limite legal, declaração de alergênico e impacto sensorial.', gordura: 1, proteina: 50, carboidrato: 30, custo: 0, proteinaNaoCarnea: true, alergeno: true },
    { id: 'ing_figado_suino', nome: 'Fígado suíno', categoria: 'Matéria-prima cárnea', tipo: 'carne', funcao: 'Contribui para sabor característico, cor e corpo em formulações pastosas como patê.', obs: 'Usar refrigerado e discutir intensidade sensorial quando a proporção aumenta.', gordura: 4, proteina: 20, carboidrato: 4, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_fosfato', nome: 'Fosfato', categoria: 'Aditivo funcional', tipo: 'aditivo', funcao: 'Auxilia na retenção de água, extração proteica e estabilidade de emulsões cárneas, quando permitido.', obs: 'Usar apenas em discussão didática e conferir limites e permissões na legislação vigente para cada produto.', gordura: 0, proteina: 0, carboidrato: 0, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_leite_po', nome: 'Leite em pó', categoria: 'Ingrediente lácteo', tipo: 'lacteo', funcao: 'Contribui para corpo, retenção de água e estabilidade em alguns produtos emulsionados.', obs: 'Ingrediente alergênico; discutir declaração em rótulo quando utilizado.', gordura: 1, proteina: 34, carboidrato: 52, custo: 0, proteinaNaoCarnea: false, alergeno: true },
    { id: 'ing_pimenta_branca', nome: 'Pimenta branca moída', categoria: 'Condimento', tipo: 'condimento', subtipo: 'moídos', funcao: 'Ajusta pungência e aroma com menor impacto visual em massas claras e emulsionadas.', obs: 'Boa opção para comparar sabor suave e acentuado sem alterar muito a aparência.', gordura: 2, proteina: 10, carboidrato: 64, custo: 0, proteinaNaoCarnea: false, alergeno: false },
    { id: 'ing_amido', nome: 'Amido', categoria: 'Carboidrato', tipo: 'carboidrato', funcao: 'Auxilia na retenção de água e na estabilidade, quando permitido e dentro dos limites do produto.', obs: 'Rendimento, textura e enquadramento legal podem ser comparados quando o teor é alterado.', gordura: 0, proteina: 0, carboidrato: 88, custo: 0, proteinaNaoCarnea: false, alergeno: false }
  ],
  formulacoes: [
    {
      id: 'form_hamb_base',
      produtoId: 'prod_hamburguer',
      nome: 'Hambúrguer bovino base',
      pesoReferencia: 1000,
      baseCalculo: 'massa_carnea',
      rendimento: 82,
      itens: [
        { insumoId: 'ing_carne_bovina_magra', percentual: 82 },
        { insumoId: 'ing_gordura_bovina', percentual: 18 },
        { insumoId: 'ing_agua_gelada', percentual: 3 },
        { insumoId: 'ing_sal', percentual: 1.8 },
        { insumoId: 'ing_alho_po', percentual: 1.5 }
      ],
      observacoes: ''
    },
    {
      id: 'form_kafta_base',
      produtoId: 'prod_kafta',
      nome: 'Kafta bovina base',
      pesoReferencia: 1000,
      baseCalculo: 'massa_carnea',
      rendimento: 80,
      itens: [
        { insumoId: 'ing_carne_bovina_magra', percentual: 90 },
        { insumoId: 'ing_gordura_bovina', percentual: 10 },
        { insumoId: 'ing_sal', percentual: 1.7 },
        { insumoId: 'ing_alho_po', percentual: 0.6 },
        { insumoId: 'ing_cebola_desidratada', percentual: 1.2 },
        { insumoId: 'ing_pimenta_reino', percentual: 0.2 },
        { insumoId: 'ing_salsa_desidratada', percentual: 0.6 }
      ],
      observacoes: 'Formulação para discutir moldagem, estabilidade no espeto e efeito de condimentos sobre a coesão.'
    },
    {
      id: 'form_almondega_base',
      produtoId: 'prod_almondega',
      nome: 'Almôndega bovina base',
      pesoReferencia: 1000,
      baseCalculo: 'massa_carnea',
      rendimento: 78,
      itens: [
        { insumoId: 'ing_carne_bovina_magra', percentual: 88 },
        { insumoId: 'ing_gordura_bovina', percentual: 12 },
        { insumoId: 'ing_ovo_liquido', percentual: 5 },
        { insumoId: 'ing_farinha_rosca', percentual: 4 },
        { insumoId: 'ing_sal', percentual: 1.6 },
        { insumoId: 'ing_alho_po', percentual: 0.4 },
        { insumoId: 'ing_pimenta_reino', percentual: 0.2 },
        { insumoId: 'ing_salsa_desidratada', percentual: 0.5 }
      ],
      observacoes: 'Formulação para comparar o efeito de ingredientes ligantes sobre desmanche, textura e perda por cocção.'
    },
    {
      id: 'form_linguica_base',
      produtoId: 'prod_linguica_frescal',
      nome: 'Linguiça frescal suína base',
      pesoReferencia: 2000,
      baseCalculo: 'produto_final',
      rendimento: 92,
      itens: [
        { insumoId: 'ing_pernil_suino', percentual: 72 },
        { insumoId: 'ing_toucinho_suino', percentual: 20 },
        { insumoId: 'ing_agua_gelada', percentual: 5 },
        { insumoId: 'ing_sal', percentual: 1.8 },
        { insumoId: 'ing_alho_po', percentual: 0.5 },
        { insumoId: 'ing_paprica_doce', percentual: 0.3 },
        { insumoId: 'ing_pimenta_reino', percentual: 0.2 },
        { insumoId: 'ing_acucar', percentual: 0.2 }
      ],
      observacoes: 'Formulação demonstrativa para observar embutimento, teor de gordura, coesão e perda por cocção em produto frescal.'
    },
    {
      id: 'form_pate_base',
      produtoId: 'prod_pate',
      nome: 'Patê cárneo base',
      pesoReferencia: 1000,
      baseCalculo: 'produto_final',
      rendimento: 88,
      itens: [
        { insumoId: 'ing_pernil_suino', percentual: 42 },
        { insumoId: 'ing_figado_suino', percentual: 18 },
        { insumoId: 'ing_toucinho_suino', percentual: 16 },
        { insumoId: 'ing_agua_gelada', percentual: 15 },
        { insumoId: 'ing_amido', percentual: 5 },
        { insumoId: 'ing_sal', percentual: 1.8 },
        { insumoId: 'ing_alho_po', percentual: 0.4 },
        { insumoId: 'ing_pimenta_branca', percentual: 0.2 },
        { insumoId: 'ing_acucar', percentual: 0.6 },
        { insumoId: 'ing_leite_po', percentual: 1 }
      ],
      observacoes: 'Formulação didática em 100% do produto final para observar estabilidade, espalhabilidade e efeito do processamento fino.'
    },
    {
      id: 'form_salsicha_base',
      produtoId: 'prod_salsicha',
      nome: 'Salsicha base',
      pesoReferencia: 2000,
      baseCalculo: 'produto_final',
      rendimento: 90,
      itens: [
        { insumoId: 'ing_pernil_suino', percentual: 60 },
        { insumoId: 'ing_toucinho_suino', percentual: 15 },
        { insumoId: 'ing_agua_gelada', percentual: 18 },
        { insumoId: 'ing_amido', percentual: 3 },
        { insumoId: 'ing_sal', percentual: 1.8 },
        { insumoId: 'ing_leite_po', percentual: 1 },
        { insumoId: 'ing_acucar', percentual: 0.5 },
        { insumoId: 'ing_alho_po', percentual: 0.3 },
        { insumoId: 'ing_fosfato', percentual: 0.3 },
        { insumoId: 'ing_pimenta_branca', percentual: 0.1 }
      ],
      observacoes: 'Formulação didática fechada em 100% para discutir massa emulsionada, embutimento, cozimento e resfriamento.'
    }
  ],
  legislacoes: [
    {
      id: 'leg_hamburguer_724_2022',
      produtoId: 'prod_hamburguer',
      titulo: 'Portaria SDA/MAPA nº 724/2022',
      orgao: 'Ministério da Agricultura e Pecuária',
      url: 'https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/legislacao/Port7242022RThamburguer1.pdf',
      resumo: 'Aprova o Regulamento Técnico de Identidade e Qualidade do hambúrguer, com definição, denominação de venda, ingredientes e parâmetros físico-químicos.',
      pontos: [
        'Gordura máxima: 25%',
        'Carboidratos totais máximos: 3%',
        'Proteína mínima: 15%',
        'Proteína não cárnea: máximo de 4% na forma agregada',
        'Quando houver indicação de corte na denominação, não é permitida proteína não cárnea'
      ]
    },
    {
      id: 'leg_linguica_in4_2000',
      produtoId: 'prod_linguica_frescal',
      titulo: 'IN SDA/MAPA nº 4/2000 - RTIQ de Linguiça',
      orgao: 'Ministério da Agricultura e Pecuária',
      url: 'https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/legislacao/IN042000salsichamortadelalinguia.pdf',
      resumo: 'Aprova o RTIQ de linguiça e diferencia parâmetros para linguiças frescais, cozidas e dessecadas.',
      pontos: [
        'Linguiças frescais: umidade máxima 70%',
        'Linguiças frescais: gordura máxima 30%',
        'Linguiças frescais: proteína mínima 12%',
        'Proteína animal e/ou vegetal agregada: máximo 2,5%, com regras específicas por denominação',
        'É proibido o uso de CMS em linguiças frescais'
      ]
    },
    {
      id: 'leg_salsicha_in4_2000',
      produtoId: 'prod_salsicha',
      titulo: 'IN SDA/MAPA nº 4/2000 - RTIQ de Salsicha',
      orgao: 'Ministério da Agricultura e Pecuária',
      url: 'https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-animal/legislacao/IN042000salsichamortadelalinguia.pdf',
      resumo: 'Inclui regulamentos técnicos de produtos cárneos como salsicha, mortadela e linguiça, apoiando a discussão de produto embutido e emulsionado.',
      pontos: [
        'Definição e identidade tecnológica da salsicha',
        'Ingredientes permitidos e denominação de venda',
        'Parâmetros físico-químicos e discussão de composição',
        'Conexão entre formulação, estabilidade da emulsão e enquadramento legal'
      ]
    },
    {
      id: 'leg_riispoa_9013',
      produtoId: null,
      titulo: 'RIISPOA - Decreto nº 9.013/2017',
      orgao: 'Presidência da República',
      url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2017/decreto/d9013.htm',
      resumo: 'Regulamento de inspeção industrial e sanitária de produtos de origem animal. Serve como base geral para discussão de inspeção, registro, estabelecimento e responsabilidades.',
      pontos: [
        'Referência geral para produtos de origem animal',
        'Inspeção, controle higiênico-sanitário e responsabilidades',
        'Deve ser consultado com suas alterações vigentes'
      ]
    },
    {
      id: 'leg_rotulagem_anvisa',
      produtoId: null,
      titulo: 'Rotulagem nutricional - Anvisa',
      orgao: 'Agência Nacional de Vigilância Sanitária',
      url: 'https://www.gov.br/anvisa/pt-br/assuntos/alimentos/rotulagem/rotulagem-nutricional',
      resumo: 'Página de referência sobre rotulagem nutricional de alimentos embalados, incluindo RDC 429/2020 e IN 75/2020.',
      pontos: [
        'Tabela de informação nutricional',
        'Rotulagem frontal',
        'Relação entre formulação, composição e comunicação ao consumidor'
      ]
    }
  ]
};

const THEORY_LESSONS = PRODUCT_CATEGORIES;

const CLASS_SCHEDULE = [
  {
    id: 'aula_1',
    aula: 'Aula 1',
    tema: 'Introdução ao laboratório e cálculos percentuais',
    foco: 'Boas práticas, pesagem, leitura de formulações e diferença entre massa cárnea e produto final.',
    produtos: ['prod_hamburguer'],
    categorias: ['reestruturados']
  },
  {
    id: 'aula_2',
    aula: 'Aula 2',
    tema: 'Produtos reestruturados',
    foco: 'Hambúrguer, kafta e almôndega: liga, gordura, modelagem, rendimento e discussão de textura.',
    produtos: ['prod_hamburguer', 'prod_kafta', 'prod_almondega'],
    categorias: ['reestruturados']
  },
  {
    id: 'aula_3',
    aula: 'Aula 3',
    tema: 'Produtos embutidos frescais',
    foco: 'Linguiça frescal: moagem, mistura, embutimento, calibre, conservação refrigerada e perda por cocção.',
    produtos: ['prod_linguica_frescal'],
    categorias: ['embutidos']
  },
  {
    id: 'aula_4',
    aula: 'Aula 4',
    tema: 'Produtos emulsionados e pastosos',
    foco: 'Patê: processamento fino, estabilidade, espalhabilidade, tratamento térmico e resfriamento.',
    produtos: ['prod_pate'],
    categorias: ['emulsionados']
  },
  {
    id: 'aula_5',
    aula: 'Aula 5',
    tema: 'Produto embutido emulsionado',
    foco: 'Salsicha: emulsão cárnea, envoltório, cozimento, resfriamento e pertencimento a mais de uma categoria.',
    produtos: ['prod_salsicha'],
    categorias: ['embutidos', 'emulsionados']
  },
  {
    id: 'aula_6',
    aula: 'Aula 6',
    tema: 'Discussão técnica e relatório',
    foco: 'Comparação dos roteiros, ajuste de formulações, interpretação de perdas, parâmetros e referências.',
    produtos: ['prod_hamburguer', 'prod_linguica_frescal', 'prod_pate', 'prod_salsicha'],
    categorias: ['reestruturados', 'embutidos', 'emulsionados']
  }
];

let db = loadDB();
let activePage = 'Inicio';
let selectedIngredientFilter = db.configs.filtroInsumo || 'todos';
let activeProductId = db.configs.produtoSelecionado || '';
let pendingInstallPrompt = null;
let tempProductPhotos = [];
let tempIngredientPhoto = '';
let tempTheoryImages = [];
let formulaDraftItems = [];
let activeProductSlideId = 'visao';
let activeTheoryLessonIndex = 0;
let activeTheoryImageIndex = 0;
let inlineEditTimer = null;
let modalZIndex = 1000;
let pendingConfirmationAction = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

window.addEventListener('DOMContentLoaded', init);

function init() {
  setTimeout(() => $('#splashScreen')?.classList.add('hide'), 450);
  setupEvents();
  populateTypeOptions();
  populateProductCategoryOptions();
  if ($('#configAppVersion')) $('#configAppVersion').textContent = `Versão ${APP_VERSION}`;
  renderAll();
  registerServiceWorker();
}

function setupEvents() {
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.page)));
  $$('[data-page-target]').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.pageTarget)));
  $$('[data-open-url]').forEach(btn => btn.addEventListener('click', () => window.open(btn.dataset.openUrl, '_blank', 'noopener')));
  $$('[data-action="open-product"]').forEach(btn => btn.addEventListener('click', () => openProductModal()));
  $$('[data-action="open-ingredient"]').forEach(btn => btn.addEventListener('click', () => openIngredientModal()));
  $$('[data-action="open-formula"]').forEach(btn => btn.addEventListener('click', () => openFormulaModal()));
  $$('[data-open-config-modal]').forEach(btn => btn.addEventListener('click', () => {
    closeModal('modalConfig');
    openModal(btn.dataset.openConfigModal);
    if (btn.dataset.openConfigModal === 'modalConfigProdutos') renderConfigProdutos();
    if (btn.dataset.openConfigModal === 'modalConfigInsumos') renderInsumos();
    if (btn.dataset.openConfigModal === 'modalConfigCronograma') renderScheduleConfig();
    if (btn.dataset.openConfigModal === 'modalConfigRegras') renderRulesConfig();
    if (btn.dataset.openConfigModal === 'modalConfigConteudos') renderContentConfig();
  }));
  $$('[data-config-tab]').forEach(btn => btn.addEventListener('click', () => setConfigTab(btn.dataset.configTab)));
  $$('[data-close]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.close)));
  $$('[data-toggle]').forEach(btn => btn.addEventListener('click', () => $('#' + btn.dataset.toggle)?.classList.toggle('open')));
  $$('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) closeModal(overlay.id);
  }));

  $('#searchProdutos')?.addEventListener('input', renderProdutos);
  $('#searchConfigProdutos')?.addEventListener('input', renderConfigProdutos);
  $('#searchInsumos')?.addEventListener('input', renderInsumos);
  $('#btnSalvarProduto')?.addEventListener('click', saveProductFromModal);
  $('#btnExcluirProduto')?.addEventListener('click', deleteProductFromModal);
  $('#produtoFotos')?.addEventListener('change', handleProductPhotos);
  $('#btnSalvarInsumo')?.addEventListener('click', saveIngredientFromModal);
  $('#btnExcluirInsumo')?.addEventListener('click', deleteIngredientFromModal);
  $('#insumoFoto')?.addEventListener('change', handleIngredientPhoto);
  $('#insumoTipo')?.addEventListener('change', () => populateSubtypeOptions($('#insumoTipo').value));
  $('#btnSalvarFormula')?.addEventListener('click', saveFormulaFromModal);
  $('#btnExcluirFormula')?.addEventListener('click', deleteFormulaFromModal);
  $('#btnAddFormulaItem')?.addEventListener('click', () => {
    formulaDraftItems.push({ insumoId: formulaEligibleIngredients()[0]?.id || '', percentual: 0 });
    renderFormulaItems();
  });
  $('#formulaPeso')?.addEventListener('input', renderFormulaItems);
  $('#formulaProduto')?.addEventListener('change', () => {
    if (!$('#formulaId')?.value) $('#formulaBaseCalculo').value = defaultFormulaBase(findProduct($('#formulaProduto').value));
    renderFormulaItems();
  });
  $('#formulaBaseCalculo')?.addEventListener('change', renderFormulaItems);
  $('#btnGerarRelatorio')?.addEventListener('click', showFormulaReport);
  $('#btnCopiarRelatorio')?.addEventListener('click', copyReport);
  $('#btnCopiarRoteiro')?.addEventListener('click', copyLesson);
  $('#btnConfig')?.addEventListener('click', () => {
    openModal('modalConfig');
  });
  $('#periodoAtivoSelect')?.addEventListener('change', () => setActivePeriod($('#periodoAtivoSelect').value));
  $('#periodoNome')?.addEventListener('change', () => savePeriodField('nome', $('#periodoNome').value));
  $('#periodoInicio')?.addEventListener('change', () => savePeriodField('inicio', $('#periodoInicio').value));
  $('#periodoFim')?.addEventListener('change', () => savePeriodField('fim', $('#periodoFim').value));
  $('#btnNovoPeriodo')?.addEventListener('click', () => createPeriod(false));
  $('#btnArquivarPeriodo')?.addEventListener('click', archiveActivePeriod);
  $('#btnArquivarNovoPeriodo')?.addEventListener('click', () => createPeriod(true));
  $('#btnAdicionarAula')?.addEventListener('click', addScheduleLesson);
  $('#btnNovoConteudo')?.addEventListener('click', () => openTheoryContentModal());
  $('#conteudoModo')?.addEventListener('change', updateTheoryContentMode);
  $('#conteudoImagens')?.addEventListener('change', handleTheoryContentImages);
  $('#btnSalvarConteudo')?.addEventListener('click', saveTheoryContent);
  $('#btnExcluirConteudo')?.addEventListener('click', deleteTheoryContent);
  $('#btnCancelarConfirmacao')?.addEventListener('click', closeConfirmation);
  $('#btnConfirmarAcao')?.addEventListener('click', confirmPendingAction);
  $('#btnAddRule')?.addEventListener('click', addLabRule);
  $('#btnExportar')?.addEventListener('click', exportData);
  $('#btnImportar')?.addEventListener('click', () => $('#fileImportar').click());
  $('#fileImportar')?.addEventListener('change', importData);
  $('#btnBaixarModelo')?.addEventListener('click', downloadTemplate);
  $('#btnResetDemo')?.addEventListener('click', resetDemo);

  window.addEventListener('beforeinstallprompt', (ev) => {
    ev.preventDefault();
    pendingInstallPrompt = ev;
    const btn = $('#btnInstall');
    if (btn) btn.hidden = false;
  });
  $('#btnInstall')?.addEventListener('click', async () => {
    if (!pendingInstallPrompt) return toast('A instalação será oferecida pelo navegador quando disponível.');
    pendingInstallPrompt.prompt();
    await pendingInstallPrompt.userChoice;
    pendingInstallPrompt = null;
    $('#btnInstall').hidden = true;
  });
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeDB(clone(DEFAULT_DB));
    return normalizeDB(JSON.parse(raw));
  } catch (err) {
    console.error(err);
    return clone(DEFAULT_DB);
  }
}

function normalizeDB(data) {
  const source = data && typeof data === 'object' ? data : {};
  const resetLegacyBlendDefault = source.version !== APP_VERSION;
  const merged = Object.assign(clone(DEFAULT_DB), source);
  merged.configs = Object.assign(clone(DEFAULT_DB.configs), source.configs || {});
  merged.configs.regrasLaboratorio = normalizeLabRules(source.configs?.regrasLaboratorio || source.configs?.regras || DEFAULT_RULES);
  merged.configs.conteudosTeoricos = normalizeTheoryContents(source.configs?.conteudosTeoricos || source.conteudosTeoricos, source.configs?.periodos || [])
    .filter(content => !(content.titulo === 'Conteúdo temporário de validação' && content.resumo === 'Resumo de teste'));
  if (merged.configs.filtroInsumo !== 'todos' && !TYPES.some(type => type.value === merged.configs.filtroInsumo)) merged.configs.filtroInsumo = 'todos';
  merged.configs.periodos = normalizeSchedulePeriods(source.configs?.periodos || source.configs?.cronogramaPeriodos, source.configs?.cronograma);
  if (!merged.configs.periodos.some(period => period.id === merged.configs.periodoAtivoId)) {
    merged.configs.periodoAtivoId = (merged.configs.periodos.find(period => !period.arquivado) || merged.configs.periodos[0])?.id || '';
  }
  merged.configs.cronograma = getPeriodById(merged.configs.periodos, merged.configs.periodoAtivoId)?.aulas || normalizeSchedule();
  merged.produtos = mergeDefaults(Array.isArray(source.produtos) ? source.produtos : clone(DEFAULT_DB.produtos), DEFAULT_DB.produtos);
  merged.insumos = mergeDefaults(Array.isArray(source.insumos) ? source.insumos : clone(DEFAULT_DB.insumos), DEFAULT_DB.insumos);
  merged.formulacoes = mergeDefaults(Array.isArray(source.formulacoes) ? source.formulacoes : clone(DEFAULT_DB.formulacoes), DEFAULT_DB.formulacoes);
  merged.legislacoes = mergeDefaults(Array.isArray(source.legislacoes) ? source.legislacoes : clone(DEFAULT_DB.legislacoes), DEFAULT_DB.legislacoes);

  DEFAULT_DB.produtos.forEach(def => {
    const existing = merged.produtos.find(p => p.id === def.id);
    if (existing && (!Array.isArray(existing.fotos) || existing.fotos.length === 0) && def.fotos?.length) existing.fotos = clone(def.fotos);
  });

  merged.produtos.forEach(p => {
    const defaultProduct = DEFAULT_DB.produtos.find(def => def.id === p.id);
    p.categoriaIds = normalizeCategoryIds(p, defaultProduct);
    p.categoriaId = p.categoriaIds[0] || p.categoriaId || inferProductCategoryId(p);
    p.parametros = Object.assign({ gorduraMax: '', proteinaMin: '', carbMax: '', proteinaNaoCarneaMax: '', proibeProteinaNaoCarnea: false, mostrarValidacao: true }, p.parametros || {});
    p.fotos = Array.isArray(p.fotos) ? p.fotos.map(src => IMAGE_MIGRATIONS[src] || src) : [];
    p.fluxo = Array.isArray(p.fluxo) ? p.fluxo : linesFrom(p.fluxo);
    p.pontos = Array.isArray(p.pontos) ? p.pontos : linesFrom(p.pontos);
    p.equipamentos = Array.isArray(p.equipamentos) ? p.equipamentos : (defaultProduct?.equipamentos ? clone(defaultProduct.equipamentos) : linesFrom(p.equipamentos));
    p.perguntas = Array.isArray(p.perguntas) ? p.perguntas : linesFrom(p.perguntas);
  });
  merged.insumos.forEach(i => {
    if (i.id === 'ing_pimenta_reino' && ['Pimenta-do-reino', 'Pimenta do reino'].includes(i.nome)) i.nome = 'Pimenta-do-reino preta';
    if (i.id === 'ing_pimenta_branca' && i.nome === 'Pimenta branca') i.nome = 'Pimenta branca moída';
    i.tipo = normalizeIngredientType(i);
    i.subtipo = normalizeIngredientSubtype(i);
    i.categoria = i.categoria || typeLabel(i.tipo);
    i.gordura = toNumber(i.gordura);
    i.proteina = toNumber(i.proteina);
    i.carboidrato = toNumber(i.carboidrato);
    i.custo = toNumber(i.custo);
    i.usadoNaFormulacao = i.usadoNaFormulacao === undefined
      ? i.tipo !== 'envoltorio_apresentacao'
      : i.usadoNaFormulacao !== false;
    i.proteinaNaoCarnea = Boolean(i.proteinaNaoCarnea || isFunctionalProtein(i));
  });
  merged.formulacoes.forEach(f => {
    const product = merged.produtos.find(p => p.id === f.produtoId);
    const hadBaseCalculo = Boolean(f.baseCalculo);
    const defaultFormula = DEFAULT_DB.formulacoes.find(def => def.id === f.id);
    if (!hadBaseCalculo && defaultFormula && f.id === 'form_hamb_base') {
      f.itens = clone(defaultFormula.itens);
      f.observacoes = defaultFormula.observacoes;
    }
    f.baseCalculo = f.baseCalculo || defaultFormula?.baseCalculo || defaultFormulaBase(product);
    f.pesoReferencia = toNumber(f.pesoReferencia) || 1000;
    f.itens = Array.isArray(f.itens) ? f.itens : [];
    f.blendComponentes = normalizeBlendComponents(f.blendComponentes, f, merged.insumos);
    f.materiaPrimaUnica = normalizeSingleMaterial(f.materiaPrimaUnica, f, merged.insumos);
    f.usarBlend = resetLegacyBlendDefault ? false : f.usarBlend === true;
    f.bloqueada = Boolean(f.bloqueada);
    if (String(f.observacoes || '').startsWith('Percentuais calculados sobre')) f.observacoes = '';
  });
  merged.legislacoes.forEach(law => {
    law.pontos = (Array.isArray(law.pontos) ? law.pontos : linesFrom(law.pontos)).map(point => String(point)
      .replace(/^Útil para discutir tabela/i, 'Tabela')
      .replace(/^Útil para discutir rotulagem/i, 'Rotulagem')
      .replace(/^Útil para discutir /i, '')
      .replace(/^Útil para conectar /i, 'Relação entre '));
  });
  return merged;
}

function mergeDefaults(current, defaults) {
  const list = Array.isArray(current) ? current : [];
  const ids = new Set(list.map(item => item.id));
  defaults.forEach(item => {
    if (!ids.has(item.id)) list.push(clone(item));
  });
  return list;
}

function saveDB() {
  db.version = APP_VERSION;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (err) {
    console.error(err);
    toast('Não foi possível salvar. Remova algumas imagens grandes e tente novamente.');
    return false;
  }
}

function renderAll() {
  renderActivePeriodLabel();
  renderHomeProducts();
  renderProdutos();
  renderConfigProdutos();
  renderInsumos();
  renderCronograma();
  renderScheduleConfig();
  renderContentConfig();
  renderRules();
  renderRulesConfig();
  renderAulas();
}

function setPage(page) {
  activePage = page;
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#page' + page)?.classList.add('active');
  $$('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  $('.content').scrollTop = 0;
  if (page === 'Produtos') renderProdutos();
  if (page === 'Cronograma') renderCronograma();
  if (page === 'Aulas') renderAulas();
}

function setConfigTab(tab) {
  $$('.config-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.configTab === tab));
  $$('.config-panel').forEach(panel => panel.classList.remove('active'));
  $('#configPanel' + capitalize(tab))?.classList.add('active');
  if (tab === 'produtos') renderConfigProdutos();
  if (tab === 'insumos') renderInsumos();
  if (tab === 'cronograma') renderScheduleConfig();
}

function renderActivePeriodLabel() {
  const el = $('#activePeriodLabel');
  if (!el) return;
  const period = getActivePeriod();
  el.textContent = period?.nome ? `Período ${period.nome}` : '';
}

function renderHomeProducts() {
  const root = $('#homeProductCards');
  if (!root) return;
  root.innerHTML = db.produtos.map(productCardHTML).join('') || emptyHTML('Nenhum produto cadastrado.');
  root.querySelectorAll('[data-product-card]').forEach(card => card.addEventListener('click', () => {
    openProductWorkspace(card.dataset.productCard);
  }));
}

function productCardHTML(p) {
  const categoryLabel = productCategoryLabel(p);
  const photo = p.fotos?.[0] || '';
  const mediaStyle = photo ? ` style="background-image: url('${escapeAttr(photo)}')"` : '';
  const mediaText = photo ? '' : escapeHTML((p.nome || '?').slice(0, 1).toUpperCase());
  return `
    <button type="button" class="product-tile" data-product-card="${escapeAttr(p.id)}">
      <div class="product-tile-media"${mediaStyle}>${mediaText}</div>
      <div class="product-tile-body">
        <div class="product-tile-title">${escapeHTML(p.nome)}</div>
        <div class="product-tile-subtitle">${escapeHTML(categoryLabel)}</div>
      </div>
    </button>`;
}

function renderProdutos() {
  const overview = $('#produtosOverview');
  const workspace = $('#produtoWorkspace');
  const selected = activeProductId ? findProduct(activeProductId) : null;
  if (selected && !($('#searchProdutos')?.value || '').trim()) {
    overview.hidden = true;
    workspace.hidden = false;
    workspace.innerHTML = productWorkspaceHTML(selected);
    bindProductWorkspace(workspace);
    return;
  }
  overview.hidden = false;
  workspace.hidden = true;
  if (activeProductId && !selected) activeProductId = '';
  const term = ($('#searchProdutos')?.value || '').toLowerCase().trim();
  const produtos = db.produtos.filter(p => [p.nome, p.categoria, p.especie, p.descricao].join(' ').toLowerCase().includes(term));
  $('#produtosList').innerHTML = produtos.map(productListHTML).join('') || emptyHTML('Nenhum produto encontrado.');
  $('#produtosList').querySelectorAll('[data-open-product]').forEach(el => el.addEventListener('click', () => openProductWorkspace(el.dataset.openProduct)));
}

function productListHTML(p) {
  const categoryLabel = productCategoryLabel(p);
  return `
    <button type="button" class="item-card" data-open-product="${escapeAttr(p.id)}">
      <div class="item-avatar">${photoOrInitial(p)}</div>
      <div>
        <div class="item-title">${escapeHTML(p.nome)}</div>
        <div class="item-subtitle">${escapeHTML(categoryLabel || p.categoria || 'Sem categoria')}</div>
      </div>
    </button>`;
}

function renderConfigProdutos() {
  const root = $('#configProdutosList');
  if (!root) return;
  const term = ($('#searchConfigProdutos')?.value || '').toLowerCase().trim();
  const produtos = db.produtos.filter(p => [p.nome, p.categoria, p.especie, p.descricao].join(' ').toLowerCase().includes(term));
  root.innerHTML = produtos.map(productConfigHTML).join('') || emptyHTML('Nenhum produto encontrado.');
  root.querySelectorAll('[data-config-edit-product]').forEach(btn => btn.addEventListener('click', () => openProductModal(btn.dataset.configEditProduct)));
}

function productConfigHTML(p) {
  return `
    <button type="button" class="item-card" data-config-edit-product="${escapeAttr(p.id)}">
      <div class="item-avatar">${photoOrInitial(p)}</div>
      <div>
        <div class="item-title">${escapeHTML(p.nome)}</div>
        <div class="item-subtitle">${escapeHTML(productCategoryLabel(p))}</div>
      </div>
    </button>`;
}

function openProductWorkspace(id) {
  if (!findProduct(id)) return;
  activeProductId = id;
  activeProductSlideId = 'visao';
  db.configs.produtoSelecionado = id;
  db.configs.ultimoProdutoAula = id;
  saveDB();
  if ($('#searchProdutos')) $('#searchProdutos').value = '';
  setPage('Produtos');
  renderProdutos();
}

function closeProductWorkspace() {
  activeProductId = '';
  activeProductSlideId = 'visao';
  db.configs.produtoSelecionado = '';
  saveDB();
  renderProdutos();
}

function productWorkspaceHTML(p) {
  const formulas = db.formulacoes.filter(f => f.produtoId === p.id);
  const laws = db.legislacoes.filter(l => !l.produtoId || l.produtoId === p.id);
  const categoryLabel = productCategoryLabel(p);
  const photo = p.fotos?.[0] || '';
  const mediaStyle = photo ? ` style="background-image: url('${escapeAttr(photo)}')"` : '';
  const mediaText = photo ? '' : escapeHTML((p.nome || '?').slice(0, 1).toUpperCase());
  const slides = [
    { id: 'visao', label: 'Visão geral' },
    { id: 'fluxo', label: 'Fluxograma' },
    { id: 'controle', label: 'Pontos de controle' },
    { id: 'equipamentos', label: 'Equipamentos' },
    { id: 'formulas', label: 'Formulações do produto' },
    { id: 'discussao', label: 'Discussão da prática' },
    { id: 'referencias', label: 'Referências' }
  ];
  return `
    <button type="button" class="back-btn" data-product-back>Voltar aos produtos</button>
    <div class="product-slide-deck" data-slide-deck>
      <aside class="product-slide-summary">
        <div class="summary-label">Sumário do roteiro</div>
        ${slides.map((slide, index) => `<button type="button" class="slide-jump ${index === 0 ? 'active' : ''}" data-product-slide="${escapeAttr(slide.id)}"><span>${index + 1}</span>${escapeHTML(slide.label)}</button>`).join('')}
      </aside>

      <div class="product-slide-stage">
        <section class="product-slide active" data-slide-panel="visao">
          <div class="product-detail-hero">
            <div class="product-detail-media"${mediaStyle}>${mediaText}</div>
            <div class="product-detail-copy">
              <div class="hero-label">Roteiro de aula prática</div>
              <h2>${escapeHTML(p.nome)}</h2>
              <div class="category-callout">
                <span>Categoria do produto</span>
                <strong>${escapeHTML(categoryLabel)}</strong>
              </div>
              <p>${escapeHTML(p.objetivo || p.descricao || 'Produto cadastrado para a disciplina.')}</p>
            </div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="fluxo">
          <div class="slide-card">
            <div class="slide-kicker">${escapeHTML(p.nome)}</div>
            <h3>Fluxograma</h3>
            <div class="timeline-list">${timelineHTML(p.fluxo)}</div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="controle">
          <div class="slide-card">
            <div class="slide-kicker">${escapeHTML(categoryLabel || 'Roteiro')}</div>
            <h3>Pontos de controle</h3>
            <div class="control-grid">${(p.pontos || []).map(point => `<div class="control-point">${escapeHTML(point)}</div>`).join('')}</div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="equipamentos">
          <div class="slide-card">
            <div class="slide-kicker">Preparação da bancada</div>
            <h3>Equipamentos e utensílios</h3>
            <div class="equipment-grid">${equipmentHTML(p.equipamentos)}</div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="formulas">
          <div class="slide-card">
            <div class="slide-title-row">
              <div>
                <div class="slide-kicker">Cálculo e composição</div>
                <h3>Formulações do produto</h3>
              </div>
            </div>
            <div class="formula-work-list">
              ${formulas.map(productFormulaHTML).join('') || emptyHTML('Nenhuma formulação cadastrada para este produto.')}
            </div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="discussao">
          <div class="slide-card">
            <div class="slide-kicker">Relatório e debate</div>
            <h3>Discussão da prática</h3>
            <div class="discussion-list">${(p.perguntas || []).map((question, index) => `<div class="discussion-question"><span>${index + 1}</span>${escapeHTML(question)}</div>`).join('')}</div>
          </div>
        </section>

        <section class="product-slide" data-slide-panel="referencias">
          <div class="slide-card">
            <div class="slide-kicker">Consulta de apoio</div>
            <h3>Referências vinculadas</h3>
            <div class="stack-list">${laws.map(lawCardHTML).join('') || emptyHTML('Nenhuma referência vinculada.')}</div>
          </div>
        </section>

        <div class="slide-controls">
          <button type="button" class="secondary-btn compact" data-slide-prev>Voltar</button>
          <div class="slide-position" data-slide-position>1 / ${slides.length}</div>
          <button type="button" class="primary-btn compact" data-slide-next>Avançar</button>
        </div>
      </div>
    </div>
  `;
}

function productFormulaHTML(f) {
  const analysis = analyzeFormula(f);
  return `
    <div class="formula-work-card ${f.bloqueada ? 'formula-locked' : ''}">
      <div class="formula-work-head">
        <div>
          <h3>${escapeHTML(f.nome)}</h3>
          <p class="item-subtitle">${escapeHTML(analysis.baseLabel)}: ${fmt(f.pesoReferencia)} g · massa estimada ${fmt(analysis.finalWeight)} g${f.rendimento !== '' ? ` · rendimento esperado ${fmt(f.rendimento)}%` : ''}</p>
        </div>
        <button type="button" class="formula-lock-btn ${f.bloqueada ? 'locked' : ''}" data-toggle-formula-lock="${escapeAttr(f.id)}" title="${f.bloqueada ? 'Destravar formulação' : 'Travar formulação'}">${f.bloqueada ? '🔒' : '🔓'}</button>
      </div>
      ${blendEditorHTML(f)}
      ${inlineFormulaEditorHTML(f)}
      ${analysisHTML(analysis)}
      <div class="product-action-row">
        <button type="button" class="secondary-btn compact" data-report-formula="${escapeAttr(f.id)}">Relatório</button>
      </div>
    </div>`;
}

function blendEditorHTML(f) {
  const state = formulaBlendState(f);
  const disabled = f.bloqueada ? ' disabled' : '';
  const firstComponent = state.useBlend ? state.components[0] : state.singleComponent;
  const secondComponent = state.components[1] || defaultSecondBlendComponent(f, state);
  return `<div class="blend-editor">
    <div class="blend-switch-row">
      <div class="blend-toggle-group">
        <button type="button" class="blend-toggle-button ${state.useBlend ? 'active' : ''}" data-toggle-blend-button="${escapeAttr(f.id)}" aria-pressed="${state.useBlend}"${disabled}>
          <strong>Blend</strong><span class="switch-visual"><i></i></span>
        </button>
      </div>
    </div>
    <div class="blend-components">
        ${blendComponentHTML(f, firstComponent, 0, { locked: f.bloqueada, label: state.useBlend ? 'Matéria-prima 1' : 'Matéria-prima', single: !state.useBlend })}
        ${state.useBlend ? blendComponentHTML(f, secondComponent, 1, { locked: f.bloqueada, label: 'Matéria-prima 2' }) : ''}
        ${state.useBlend ? `
        <div class="blend-summary">
          <div><span>Peso do blend</span><strong>${fmt(state.blendGrams)} g</strong></div>
          <div><span>Gordura estimada</span><strong>${fmt(state.fatPct)}%</strong></div>
        </div>` : ''}
        <a href="${MEAT_CUTS_SOURCE_URL}" class="blend-source" target="_blank" rel="noopener">Referência de composição: TACO/NEPA/UNICAMP. Valores editáveis conforme a matéria-prima utilizada.</a>
    </div>
  </div>`;
}

function blendComponentHTML(formula, component, index, options = {}) {
  const fat = blendComponentFat(component);
  const source = blendComponentSource(component);
  const cut = MEAT_CUTS.find(item => item.id === component.corteId) || MEAT_CUTS[MEAT_CUTS.length - 1];
  const disabled = options.locked ? ' disabled' : '';
  const cutAttr = options.single ? `data-single-cut="${escapeAttr(formula.id)}"` : `data-blend-cut="${escapeAttr(formula.id)}" data-blend-index="${index}"`;
  const profileAttr = options.single ? `data-single-profile="${escapeAttr(formula.id)}"` : `data-blend-profile="${escapeAttr(formula.id)}" data-blend-index="${index}"`;
  const gramsAttr = options.single ? `data-single-grams="${escapeAttr(formula.id)}"` : `data-blend-grams="${escapeAttr(formula.id)}" data-blend-index="${index}"`;
  const fatAttr = options.single ? `data-single-fat="${escapeAttr(formula.id)}"` : `data-blend-fat="${escapeAttr(formula.id)}" data-blend-index="${index}"`;
  return `<div class="blend-component-row ${options.single ? 'single-component' : ''}">
    <div class="blend-component-main">
      <div class="form-group">
        <label>${escapeHTML(options.label || 'Matéria-prima')}</label>
        <select ${cutAttr}${disabled}>
          ${MEAT_CUTS.map(cut => `<option value="${escapeAttr(cut.id)}" ${cut.id === component.corteId ? 'selected' : ''}>${escapeHTML(cut.nome)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Perfil</label>
        <select ${profileAttr}${disabled}>
          ${meatProfileOptionsHTML(cut, component.perfil)}
        </select>
      </div>
      <div class="form-group ${options.single ? 'single-meat-weight' : ''}">
        <label>${options.single ? 'Carne/massa cárnea (g)' : 'Peso (g)'}</label>
        <input type="number" min="${options.single ? '1' : '0'}" step="1" value="${escapeAttr(fmtInput(component.gramas))}" ${gramsAttr}${disabled}>
      </div>
      <div class="form-group">
        <label>Gordura (%)</label>
        <input type="number" min="0" max="100" step="0.1" value="${escapeAttr(fmtInput(fat))}" ${fatAttr}${disabled}>
      </div>
    </div>
    <small>${escapeHTML(source)}</small>
  </div>`;
}

function meatProfileOptionsHTML(cut, selected) {
  const profiles = [
    { value: 'com_gordura', label: 'Com gordura', available: cut.comGordura !== null && cut.comGordura !== undefined },
    { value: 'sem_gordura', label: 'Sem gordura', available: cut.semGordura !== null && cut.semGordura !== undefined }
  ];
  return profiles.map(profile => `<option value="${profile.value}" ${profile.value === selected ? 'selected' : ''} ${profile.available ? '' : 'disabled'}>${profile.label}${profile.available ? '' : ' — sem dado TACO'}</option>`).join('');
}

function inlineFormulaEditorHTML(f) {
  const editableItems = (f.itens || []).filter(item => !isBlendItem(item.insumoId, f));
  const available = db.insumos.filter(ingredient =>
    ingredient.usadoNaFormulacao !== false &&
    !isMeatIngredient(ingredient) &&
    !(f.itens || []).some(item => item.insumoId === ingredient.id)
  );
  const disabled = f.bloqueada ? ' disabled' : '';
  return `<div class="inline-formula-editor">
    <div class="inline-formula-head">
      <span>Insumos da formulação</span>
      <small>${f.bloqueada ? 'Formulação protegida.' : 'Ajuste os percentuais usados na prática.'}</small>
    </div>
    ${editableItems.length ? editableItems.map(item => inlineFormulaRowHTML(f, item)).join('') : '<div class="notice-card slim">Sem insumos adicionais nesta formulação.</div>'}
    <div class="formula-add-row">
      <select data-add-ingredient-select="${escapeAttr(f.id)}"${disabled}>
        <option value="">Selecione um insumo cadastrado</option>
        ${available.map(ingredient => `<option value="${escapeAttr(ingredient.id)}">${escapeHTML(ingredient.nome)}</option>`).join('')}
      </select>
      <button type="button" class="secondary-btn compact" data-add-ingredient-formula="${escapeAttr(f.id)}"${disabled}>Adicionar insumo</button>
    </div>
  </div>`;
}

function inlineFormulaRowHTML(f, item) {
    const ing = findIngredient(item.insumoId);
    const pct = toNumber(item.percentual);
    const grams = formulaItemGrams(f, item);
    const suggestion = ingredientSuggestion(ing);
    const disabled = f.bloqueada ? ' disabled' : '';
    const suggestionHTML = suggestion ? intensityScaleHTML(f, item, pct, suggestion) : '';
    return `<div class="inline-formula-row">
      <div class="inline-formula-name">
        <button type="button" class="inline-link" data-open-ingredient="${escapeAttr(item.insumoId)}">${escapeHTML(ing?.nome || 'Insumo não encontrado')}</button>
        <span>${escapeHTML(typeLabel(ing?.tipo || 'outro'))}</span>
      </div>
      <label class="pct-field">
        <span>%</span>
        <input type="number" min="0" step="0.1" value="${escapeAttr(fmtInput(pct))}" data-inline-pct-formula="${escapeAttr(f.id)}" data-inline-pct-insumo="${escapeAttr(item.insumoId)}"${disabled}>
      </label>
      <strong class="gram-pill">${fmt(grams)} g</strong>
      <button type="button" class="tiny-btn formula-item-remove" data-remove-ingredient-formula="${escapeAttr(f.id)}" data-remove-ingredient-id="${escapeAttr(item.insumoId)}" title="Remover insumo"${disabled}>×</button>
      ${suggestionHTML ? `<div class="suggestion-panel">${suggestionHTML}</div>` : ''}
    </div>`;
}

function intensityScaleHTML(formula, item, current, suggestion) {
  const levels = Array.from({ length: 5 }, (_, index) => suggestion.suave + (suggestion.acentuado - suggestion.suave) * index / 4);
  const range = suggestion.acentuado - suggestion.suave;
  const position = range > 0 ? Math.max(0, Math.min(100, (current - suggestion.suave) / range * 100)) : 0;
  const endpointCorrection = position * 0.16;
  const exactIndex = levels.findIndex(value => Math.abs(value - current) < 0.001);
  return `<div class="intensity-scale">
    <div class="intensity-labels"><span>Suave ${fmt(suggestion.suave)}%</span><span>Acentuado ${fmt(suggestion.acentuado)}%</span></div>
    <div class="intensity-track">
      ${levels.map((value, index) => `<button type="button" class="intensity-dot ${index === exactIndex ? 'selected' : ''}" data-suggestion-formula="${escapeAttr(formula.id)}" data-suggestion-insumo="${escapeAttr(item.insumoId)}" data-suggestion-value="${escapeAttr(fmtInput(value))}" title="${fmt(value)}%" ${formula.bloqueada ? 'disabled' : ''}></button>`).join('')}
      <span class="intensity-current" style="left:calc(8px + ${position.toFixed(2)}% - ${endpointCorrection.toFixed(2)}px)" title="Valor atual: ${fmt(current)}%"><i>${fmt(current)}%</i></span>
    </div>
  </div>`;
}

function bindProductWorkspace(root) {
  root.querySelector('[data-product-back]')?.addEventListener('click', closeProductWorkspace);
  root.addEventListener('click', handleProductWorkspaceClick);
  root.querySelectorAll('[data-report-formula]').forEach(btn => btn.addEventListener('click', () => showFormulaReport(btn.dataset.reportFormula)));
  root.querySelectorAll('[data-open-ingredient]').forEach(btn => btn.addEventListener('click', () => openIngredientView(btn.dataset.openIngredient)));
  root.querySelectorAll('[data-inline-weight]').forEach(input => {
    input.addEventListener('input', () => queueInlineFormulaEdit(() => updateFormulaWeight(input.dataset.inlineWeight, input.value, { silent: true })));
    input.addEventListener('change', () => updateFormulaWeight(input.dataset.inlineWeight, input.value));
  });
  root.querySelectorAll('[data-inline-pct-formula]').forEach(input => {
    input.addEventListener('input', () => queueInlineFormulaEdit(() => updateFormulaItemPercent(input.dataset.inlinePctFormula, input.dataset.inlinePctInsumo, input.value, { silent: true })));
    input.addEventListener('change', () => updateFormulaItemPercent(input.dataset.inlinePctFormula, input.dataset.inlinePctInsumo, input.value));
  });
  root.querySelectorAll('[data-blend-cut]').forEach(input => input.addEventListener('change', () => updateBlendComponent(input.dataset.blendCut, Number(input.dataset.blendIndex), { corteId: input.value, gorduraCustom: '' })));
  root.querySelectorAll('[data-blend-profile]').forEach(input => input.addEventListener('change', () => updateBlendComponent(input.dataset.blendProfile, Number(input.dataset.blendIndex), { perfil: input.value, gorduraCustom: '' })));
  root.querySelectorAll('[data-blend-grams]').forEach(input => {
    input.addEventListener('input', () => queueInlineFormulaEdit(() => updateBlendComponent(input.dataset.blendGrams, Number(input.dataset.blendIndex), { gramas: input.value }, { silent: true })));
    input.addEventListener('change', () => updateBlendComponent(input.dataset.blendGrams, Number(input.dataset.blendIndex), { gramas: input.value }));
  });
  root.querySelectorAll('[data-blend-fat]').forEach(input => input.addEventListener('change', () => updateBlendComponent(input.dataset.blendFat, Number(input.dataset.blendIndex), { gorduraCustom: input.value })));
  root.querySelectorAll('[data-single-cut]').forEach(input => input.addEventListener('change', () => updateSingleMaterial(input.dataset.singleCut, { corteId: input.value, gorduraCustom: '' })));
  root.querySelectorAll('[data-single-profile]').forEach(input => input.addEventListener('change', () => updateSingleMaterial(input.dataset.singleProfile, { perfil: input.value, gorduraCustom: '' })));
  root.querySelectorAll('[data-single-grams]').forEach(input => {
    input.addEventListener('input', () => queueInlineFormulaEdit(() => updateSingleMaterial(input.dataset.singleGrams, { gramas: input.value }, { silent: true })));
    input.addEventListener('change', () => updateSingleMaterial(input.dataset.singleGrams, { gramas: input.value }));
  });
  root.querySelectorAll('[data-single-fat]').forEach(input => input.addEventListener('change', () => updateSingleMaterial(input.dataset.singleFat, { gorduraCustom: input.value })));
  root.querySelectorAll('[data-equipment-check]').forEach(btn => btn.addEventListener('click', () => toggleEquipmentCheck(btn)));
  bindProductSlides(root);
  bindLawLinks(root);
}

function handleProductWorkspaceClick(event) {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.toggleFormulaLock) {
    toggleFormulaLock(target.dataset.toggleFormulaLock);
    return;
  }
  if (target.dataset.toggleBlendButton) {
    const formula = findFormula(target.dataset.toggleBlendButton);
    if (!formula || formula.bloqueada) return;
    updateFormulaBlend(formula.id, { useBlend: formula.usarBlend !== true });
    return;
  }
  if (target.dataset.suggestionFormula) {
    updateFormulaItemPercent(target.dataset.suggestionFormula, target.dataset.suggestionInsumo, target.dataset.suggestionValue);
    return;
  }
  if (target.dataset.addIngredientFormula) {
    const card = target.closest('.formula-work-card');
    const select = card?.querySelector('[data-add-ingredient-select]');
    if (!select?.value) return toast('Selecione um insumo.');
    addFormulaItemInline(target.dataset.addIngredientFormula, select.value);
    return;
  }
  if (target.dataset.removeIngredientFormula) {
    requestFormulaItemRemoval(target.dataset.removeIngredientFormula, target.dataset.removeIngredientId);
  }
}

function bindProductSlides(root) {
  const panels = Array.from(root.querySelectorAll('[data-slide-panel]'));
  const jumps = Array.from(root.querySelectorAll('[data-product-slide]'));
  const summary = root.querySelector('.product-slide-summary');
  const position = root.querySelector('[data-slide-position]');
  let index = Math.max(0, panels.findIndex(panel => panel.dataset.slidePanel === activeProductSlideId));
  const show = (nextIndex) => {
    index = Math.max(0, Math.min(panels.length - 1, nextIndex));
    activeProductSlideId = panels[index]?.dataset.slidePanel || 'visao';
    panels.forEach((panel, panelIndex) => panel.classList.toggle('active', panelIndex === index));
    jumps.forEach((jump, jumpIndex) => jump.classList.toggle('active', jumpIndex === index));
    if (position) position.textContent = `${index + 1} / ${panels.length}`;
    const activeJump = jumps[index];
    if (activeJump && summary && summary.scrollWidth > summary.clientWidth) {
      activeJump.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };
  jumps.forEach((jump, jumpIndex) => jump.addEventListener('click', () => show(jumpIndex)));
  root.querySelector('[data-slide-prev]')?.addEventListener('click', () => show(index - 1));
  root.querySelector('[data-slide-next]')?.addEventListener('click', () => show(index + 1));
  show(index);
}

function renderInsumos() {
  renderIngredientFilters();
  const term = ($('#searchInsumos')?.value || '').toLowerCase().trim();
  const list = db.insumos.filter(i => {
    const okFilter = selectedIngredientFilter === 'todos' || i.tipo === selectedIngredientFilter;
    const okSearch = [i.nome, i.categoria, typeLabel(i.tipo), i.subtipo, i.funcao, i.obs].join(' ').toLowerCase().includes(term);
    return okFilter && okSearch;
  });
  $('#insumosList').innerHTML = list.map(ingredientHTML).join('') || emptyHTML('Nenhum insumo encontrado.');
  $('#insumosList').querySelectorAll('[data-edit-ingredient]').forEach(el => el.addEventListener('click', () => openIngredientModal(el.dataset.editIngredient)));
}

function renderIngredientFilters() {
  const chips = [{ value: 'todos', label: 'Todos' }, ...TYPES];
  $('#ingredientTypeFilters').innerHTML = chips.map(c => `<button type="button" class="chip ${selectedIngredientFilter === c.value ? 'active' : ''}" data-filter="${escapeAttr(c.value)}">${escapeHTML(c.label)}</button>`).join('');
  $('#ingredientTypeFilters').querySelectorAll('[data-filter]').forEach(chip => chip.addEventListener('click', () => {
    selectedIngredientFilter = chip.dataset.filter;
    db.configs.filtroInsumo = selectedIngredientFilter;
    saveDB();
    renderInsumos();
  }));
}

function ingredientHTML(i) {
  const avatar = i.foto ? `<img src="${escapeAttr(i.foto)}" alt="">` : escapeHTML(ingredientIcon(i.tipo));
  return `
    <button type="button" class="item-card" data-edit-ingredient="${escapeAttr(i.id)}">
      <div class="item-avatar">${avatar}</div>
      <div>
        <div class="item-title">${escapeHTML(i.nome)}</div>
        <div class="item-subtitle">${escapeHTML(i.funcao || 'Sem função tecnológica cadastrada')}</div>
        <div class="item-meta">
          <span class="badge info">${escapeHTML(typeLabel(i.tipo))}</span>
          ${i.subtipo ? `<span class="badge">${escapeHTML(capitalizeFirst(i.subtipo))}</span>` : ''}
          ${i.usadoNaFormulacao === false ? '<span class="badge">Fora da formulação</span>' : ''}
          ${i.proteinaNaoCarnea ? '<span class="badge warn">proteína agregada</span>' : ''}
          ${i.alergeno ? '<span class="badge danger">alérgeno</span>' : ''}
          <span class="badge">G ${fmt(i.gordura)}% · P ${fmt(i.proteina)}% · C ${fmt(i.carboidrato)}%</span>
        </div>
      </div>
    </button>`;
}

function renderFormulaFilters() {
  const currentFormulaProduct = $('#formulaProduto')?.value || db.produtos[0]?.id || '';
  $('#formulaProduto').innerHTML = db.produtos.map(p => `<option value="${escapeAttr(p.id)}">${escapeHTML(p.nome)}</option>`).join('');
  if (db.produtos.some(p => p.id === currentFormulaProduct)) $('#formulaProduto').value = currentFormulaProduct;
}

function renderFormulas() {
  if (!$('#formulasList')) return;
  renderFormulaFilters();
  const filter = 'todos';
  const formulas = db.formulacoes.filter(f => filter === 'todos' || f.produtoId === filter);
  $('#formulasList').innerHTML = formulas.map(formulaHTML).join('') || emptyHTML('Nenhuma formulação cadastrada.');
  $('#formulasList').querySelectorAll('[data-edit-formula]').forEach(el => el.addEventListener('click', () => openFormulaModal(el.dataset.editFormula)));
}

function formulaHTML(f) {
  const product = findProduct(f.produtoId);
  const analysis = analyzeFormula(f);
  const danger = analysis.alerts.some(a => a.type === 'danger');
  const warn = analysis.alerts.some(a => a.type === 'warn');
  return `
    <button type="button" class="item-card" data-edit-formula="${escapeAttr(f.id)}">
      <div class="item-avatar">∑</div>
      <div>
        <div class="item-title">${escapeHTML(f.nome)}</div>
        <div class="item-subtitle">${escapeHTML(product?.nome || 'Produto não encontrado')}</div>
        <div class="item-meta">
          <span class="badge ${limitBadge(analysis.fatPct, product?.parametros?.gorduraMax, 'max')}">Gordura ${fmt(analysis.fatPct)}%</span>
          <span class="badge ${danger ? 'danger' : warn ? 'warn' : 'ok'}">${danger ? 'corrigir' : warn ? 'atenção' : 'ok'}</span>
        </div>
      </div>
    </button>`;
}

function renderRules() {
  const root = $('#rulesGrid');
  if (!root) return;
  const rules = normalizeLabRules(db.configs.regrasLaboratorio);
  root.innerHTML = rules.map(ruleCardHTML).join('') || emptyHTML('Nenhuma regra cadastrada.');
}

function ruleCardHTML(rule, index) {
  return `<article class="rule-card">
    <span>${escapeHTML(rule.numero || String(index + 1).padStart(2, '0'))}</span>
    <strong>${escapeHTML(rule.titulo || 'Regra')}</strong>
    <p>${escapeHTML(rule.texto || '')}</p>
  </article>`;
}

function renderCronograma() {
  const root = $('#cronogramaContent');
  if (!root) return;
  const period = getActivePeriod();
  const schedule = getSchedule();
  root.innerHTML = `
    ${period ? `<div class="period-banner">
      <strong>${escapeHTML(period.nome)}</strong>
      <span>${periodDateLabel(period)}</span>
    </div>` : ''}
    <div class="calendar-list">
      ${schedule.length ? schedule.map(scheduleCardHTML).join('') : emptyHTML('Nenhuma aula cadastrada para este período.')}
    </div>
    <div class="notice-card">
      O cronograma pode ser ajustado conforme a oferta da disciplina. Os roteiros e as aulas teóricas permanecem conectados para consulta rápida durante a prática.
    </div>`;
  bindInternalLinks(root);
  root.querySelectorAll('[data-open-category]').forEach(btn => btn.addEventListener('click', () => setPage('Aulas')));
}

function scheduleCardHTML(item, index) {
  const categoryChips = (item.categorias || []).map(id => {
    const content = getTheoryContent(id);
    return content ? `<button type="button" class="link-chip soft" data-open-category="${escapeAttr(id)}">${escapeHTML(content.titulo)}</button>` : '';
  }).join('');
  const date = scheduleDateParts(item.dia);
  return `<article class="calendar-card">
    <div class="calendar-index ${item.dia ? 'has-date' : ''}">
      ${item.dia ? `<span>${escapeHTML(date.weekday)}</span><strong>${escapeHTML(date.day)}</strong><b>${escapeHTML(date.month)}</b><em>${escapeHTML(date.year)}</em>` : '<span>DATA</span><strong>--</strong><b>---</b><em>A definir</em>'}
    </div>
    <div class="calendar-body">
      <h3 class="calendar-lesson-title"><span>${lessonNumberLabel(index)}:</span> ${escapeHTML(item.tema)}</h3>
      <p>${escapeHTML(item.foco)}</p>
      ${item.local ? `<div class="calendar-local">${escapeHTML(item.local)}</div>` : ''}
      ${item.observacao ? `<div class="calendar-note">${escapeHTML(item.observacao)}</div>` : ''}
      <div class="linked-block">
        <div class="linked-title">Roteiros da aula</div>
        ${linkedProductsHTML(item.produtos || [])}
      </div>
      <div class="linked-block">
        <div class="linked-title">Teoria relacionada</div>
        <div class="link-chip-row">${categoryChips}</div>
      </div>
    </div>
  </article>`;
}

function getSchedulePeriods() {
  if (!Array.isArray(db.configs.periodos) || !db.configs.periodos.length) {
    db.configs.periodos = normalizeSchedulePeriods([], db.configs.cronograma);
  }
  if (!db.configs.periodos.some(period => period.id === db.configs.periodoAtivoId)) {
    db.configs.periodoAtivoId = (db.configs.periodos.find(period => !period.arquivado) || db.configs.periodos[0])?.id || '';
  }
  return db.configs.periodos;
}

function getPeriodById(periods, id) {
  return (periods || []).find(period => period.id === id);
}

function getActivePeriod() {
  const periods = getSchedulePeriods();
  return getPeriodById(periods, db.configs.periodoAtivoId) || periods[0] || null;
}

function getSchedule() {
  const period = getActivePeriod();
  if (!period) return [];
  period.aulas = normalizeSchedule(period.aulas || [], false);
  db.configs.cronograma = period.aulas;
  return period.aulas;
}

function normalizeSchedulePeriods(source = [], legacySchedule = []) {
  const hasSourcePeriods = Array.isArray(source) && source.length;
  const current = hasSourcePeriods ? source : [{
    id: 'periodo_demo',
    nome: 'Período atual',
    inicio: '',
    fim: '',
    arquivado: false,
    aulas: legacySchedule
  }];
  return current.map((period, index) => ({
    id: period.id || uid('periodo'),
    nome: period.nome || period.titulo || `Período ${index + 1}`,
    inicio: period.inicio || '',
    fim: period.fim || '',
    arquivado: Boolean(period.arquivado),
    aulas: normalizeSchedule(period.aulas || period.cronograma || (index === 0 ? legacySchedule : []), !hasSourcePeriods && index === 0)
  }));
}

function normalizeSchedule(source = [], fillDefaults = true) {
  const current = Array.isArray(source) ? source : [];
  if (fillDefaults) {
    return CLASS_SCHEDULE.map((item, index) => normalizeScheduleItem(current.find(row => row.id === item.id) || current[index] || {}, item, index));
  }
  return current.map((item, index) => normalizeScheduleItem(item, {}, index));
}

function normalizeScheduleItem(saved = {}, fallback = {}, index = 0) {
  const item = {
    id: saved.id || fallback.id || uid('aula'),
    aula: saved.aula || fallback.aula || `Aula ${index + 1}`,
    dia: saved.dia || fallback.dia || '',
    tema: saved.tema || fallback.tema || '',
    foco: saved.foco || fallback.foco || '',
    local: saved.local || fallback.local || '',
    observacao: saved.observacao || fallback.observacao || '',
    produtos: Array.isArray(saved.produtos) ? saved.produtos : clone(fallback.produtos || []),
    categorias: Array.isArray(saved.categorias) ? saved.categorias : clone(fallback.categorias || [])
  };
  item.conteudo = normalizeLessonContent(saved.conteudo || saved.conteudoTeorico, fallback.conteudo, item);
  return item;
}

function normalizeLessonContent(source = {}, fallback = {}, lesson = {}) {
  const content = source && typeof source === 'object' ? source : {};
  const base = fallback && typeof fallback === 'object' ? fallback : {};
  return {
    modo: content.modo === 'slides' ? 'slides' : 'texto',
    titulo: content.titulo || base.titulo || lesson.tema || '',
    texto: content.texto || content.corpo || base.texto || '',
    imagens: Array.isArray(content.imagens) ? content.imagens : clone(base.imagens || [])
  };
}

function normalizeTheoryContents(source = [], periods = []) {
  const saved = Array.isArray(source) ? source : [];
  const legacyLessons = (Array.isArray(periods) ? periods : []).flatMap(period => Array.isArray(period?.aulas) ? period.aulas : []);
  const defaults = PRODUCT_CATEGORIES.map(category => {
    const current = saved.find(item => item.id === category.id) || {};
    const legacy = legacyLessons.find(lesson => (lesson.categorias || []).includes(category.id) && (lesson.conteudo?.texto || lesson.conteudo?.imagens?.length))?.conteudo || {};
    return {
      id: category.id,
      titulo: current.titulo || category.titulo,
      resumo: current.resumo || legacy.texto || category.resumo,
      topicos: Array.isArray(current.topicos) ? current.topicos : clone(category.topicos || []),
      perguntas: Array.isArray(current.perguntas) ? current.perguntas : clone(category.perguntas || []),
      modo: current.modo === 'slides' || legacy.modo === 'slides' ? 'slides' : 'texto',
      imagens: Array.isArray(current.imagens) ? current.imagens : clone(legacy.imagens || []),
      produtos: Array.isArray(current.produtos) ? current.produtos : clone(category.produtos || []),
      insumos: Array.isArray(current.insumos) ? current.insumos : clone(category.insumos || []),
      padrao: true
    };
  });
  const custom = saved.filter(item => !PRODUCT_CATEGORIES.some(category => category.id === item.id)).map(item => ({
    id: item.id || uid('conteudo'),
    titulo: item.titulo || 'Novo conteúdo',
    resumo: item.resumo || '',
    topicos: Array.isArray(item.topicos) ? item.topicos : [],
    perguntas: Array.isArray(item.perguntas) ? item.perguntas : [],
    modo: item.modo === 'slides' ? 'slides' : 'texto',
    imagens: Array.isArray(item.imagens) ? item.imagens : [],
    produtos: Array.isArray(item.produtos) ? item.produtos : [],
    insumos: Array.isArray(item.insumos) ? item.insumos : [],
    padrao: false
  }));
  return [...defaults, ...custom];
}

function getTheoryContents() {
  db.configs.conteudosTeoricos = normalizeTheoryContents(db.configs.conteudosTeoricos, db.configs.periodos);
  return db.configs.conteudosTeoricos;
}

function getTheoryContent(id) {
  return getTheoryContents().find(item => item.id === id);
}

function normalizeLabRules(source = []) {
  const list = Array.isArray(source) && source.length ? source : DEFAULT_RULES;
  return list.map((rule, index) => ({
    id: rule.id || uid('regra'),
    numero: rule.numero || String(index + 1).padStart(2, '0'),
    titulo: rule.titulo || rule.nome || `Regra ${index + 1}`,
    texto: rule.texto || rule.descricao || ''
  }));
}

function renderScheduleConfig() {
  const root = $('#configCronogramaList');
  if (!root) return;
  const period = getActivePeriod();
  renderPeriodControls(period);
  const schedule = getSchedule();
  root.innerHTML = schedule.map(scheduleConfigHTML).join('') || emptyHTML('Nenhuma aula cadastrada neste período.');
  root.querySelectorAll('[data-schedule-field]').forEach(input => input.addEventListener('change', () => saveScheduleField(input)));
  root.querySelectorAll('[data-schedule-product]').forEach(input => input.addEventListener('change', () => saveScheduleLinkField(input, 'produtos')));
  root.querySelectorAll('[data-schedule-category]').forEach(input => input.addEventListener('change', () => saveScheduleLinkField(input, 'categorias')));
  root.querySelectorAll('[data-delete-schedule]').forEach(btn => btn.addEventListener('click', () => deleteScheduleLesson(Number(btn.dataset.deleteSchedule))));
}

function renderContentConfig() {
  const root = $('#configConteudosList');
  if (!root) return;
  root.innerHTML = getTheoryContents().map(contentConfigHTML).join('') || emptyHTML('Nenhum conteúdo cadastrado.');
  root.querySelectorAll('[data-edit-content]').forEach(btn => btn.addEventListener('click', () => openTheoryContentModal(btn.dataset.editContent)));
}

function contentConfigHTML(content) {
  const format = content.modo === 'slides' ? `${content.imagens.length} slide(s)` : `${content.topicos.length} tópico(s)`;
  return `<button type="button" class="content-list-card" data-edit-content="${escapeAttr(content.id)}">
    <div>
      <strong>${escapeHTML(content.titulo)}</strong>
      <span>${escapeHTML(format)} · ${(content.produtos || []).length} produto(s)</span>
    </div>
    <b>›</b>
  </button>`;
}

function openTheoryContentModal(id = '') {
  const content = id ? getTheoryContent(id) : null;
  $('#conteudoId').value = content?.id || '';
  $('#conteudoTitulo').value = content?.titulo || '';
  $('#conteudoModo').value = content?.modo || 'texto';
  $('#conteudoResumo').value = content?.resumo || '';
  $('#conteudoTopicos').value = (content?.topicos || []).join('\n');
  $('#conteudoPerguntas').value = (content?.perguntas || []).join('\n');
  tempTheoryImages = clone(content?.imagens || []);
  $('#conteudoImagens').value = '';
  renderTheoryContentLinks(content);
  renderTheoryContentImages();
  updateTheoryContentMode();
  $('#btnExcluirConteudo').style.display = content && !content.padrao ? 'inline-flex' : 'none';
  openModal('modalConteudoEditor');
}

function updateTheoryContentMode() {
  const fields = $('#conteudoTextoFields');
  if (fields) fields.hidden = $('#conteudoModo')?.value === 'slides';
}

function renderTheoryContentLinks(content) {
  const selectedProducts = new Set(content?.produtos || []);
  const selectedIngredients = new Set(content?.insumos || []);
  $('#conteudoProdutos').innerHTML = db.produtos.map(product => `<label class="check-pill"><input type="checkbox" value="${escapeAttr(product.id)}" ${selectedProducts.has(product.id) ? 'checked' : ''}><span>${escapeHTML(product.nome)}</span></label>`).join('');
  $('#conteudoInsumos').innerHTML = db.insumos.map(ingredient => `<label class="check-pill"><input type="checkbox" value="${escapeAttr(ingredient.id)}" ${selectedIngredients.has(ingredient.id) ? 'checked' : ''}><span>${escapeHTML(ingredient.nome)}</span></label>`).join('');
}

async function handleTheoryContentImages(ev) {
  const files = Array.from(ev.target.files || []).filter(file => file.type.startsWith('image/'));
  try {
    for (const file of files) tempTheoryImages.push(await fileToDataURL(file, 1280, 0.72));
  } catch (err) {
    console.error(err);
    toast('Não foi possível preparar uma das imagens.');
  }
  ev.target.value = '';
  renderTheoryContentImages();
}

function renderTheoryContentImages() {
  const root = $('#conteudoImagensPreview');
  root.innerHTML = tempTheoryImages.map((src, index) => `<div class="photo-wrap content-photo-wrap">
    <img class="content-photo-thumb" src="${escapeAttr(src)}" alt="Slide ${index + 1}">
    <button type="button" class="photo-remove" data-remove-theory-image="${index}" aria-label="Remover imagem">×</button>
  </div>`).join('');
  root.querySelectorAll('[data-remove-theory-image]').forEach(btn => btn.addEventListener('click', () => {
    tempTheoryImages.splice(Number(btn.dataset.removeTheoryImage), 1);
    renderTheoryContentImages();
  }));
}

function saveTheoryContent() {
  const id = $('#conteudoId').value || uid('conteudo');
  const existing = getTheoryContent(id);
  const content = {
    id,
    titulo: $('#conteudoTitulo').value.trim(),
    modo: $('#conteudoModo').value === 'slides' ? 'slides' : 'texto',
    resumo: $('#conteudoResumo').value.trim(),
    topicos: linesFrom($('#conteudoTopicos').value),
    perguntas: linesFrom($('#conteudoPerguntas').value),
    imagens: clone(tempTheoryImages),
    produtos: Array.from($('#conteudoProdutos').querySelectorAll('input:checked')).map(input => input.value),
    insumos: Array.from($('#conteudoInsumos').querySelectorAll('input:checked')).map(input => input.value),
    padrao: Boolean(existing?.padrao)
  };
  if (!content.titulo) return toast('Informe o nome do conteúdo.');
  db.configs.conteudosTeoricos = getTheoryContents();
  const previousContents = clone(db.configs.conteudosTeoricos);
  const index = db.configs.conteudosTeoricos.findIndex(item => item.id === id);
  if (index >= 0) db.configs.conteudosTeoricos[index] = content; else db.configs.conteudosTeoricos.push(content);
  if (!saveDB()) {
    db.configs.conteudosTeoricos = previousContents;
    return;
  }
  closeModal('modalConteudoEditor');
  renderContentConfig();
  renderScheduleConfig();
  renderAulas();
  renderCronograma();
  renderProdutos();
  toast('Conteúdo salvo.');
}

function deleteTheoryContent() {
  const id = $('#conteudoId').value;
  const content = getTheoryContent(id);
  if (!content || content.padrao) return;
  openConfirmation({
    title: 'Excluir conteúdo',
    message: `Deseja excluir "${content.titulo}"? Esta ação também remove o vínculo desse assunto com o cronograma.`,
    confirmLabel: 'Excluir',
    action: () => performTheoryContentDeletion(id)
  });
}

function performTheoryContentDeletion(id) {
  db.configs.conteudosTeoricos = db.configs.conteudosTeoricos.filter(item => item.id !== id);
  getSchedulePeriods().forEach(period => period.aulas.forEach(lesson => {
    lesson.categorias = (lesson.categorias || []).filter(contentId => contentId !== id);
  }));
  saveDB();
  closeModal('modalConteudoEditor');
  renderContentConfig();
  renderScheduleConfig();
  renderAulas();
  renderCronograma();
  toast('Conteúdo excluído.');
}

function renderPeriodControls(period) {
  const select = $('#periodoAtivoSelect');
  if (!select || !period) return;
  const periods = getSchedulePeriods();
  select.innerHTML = periods.map(p => `<option value="${escapeAttr(p.id)}" ${p.id === period.id ? 'selected' : ''}>${escapeHTML(p.nome)}${p.arquivado ? ' (arquivado)' : ''}</option>`).join('');
  $('#periodoNome').value = period.nome || '';
  $('#periodoInicio').value = period.inicio || '';
  $('#periodoFim').value = period.fim || '';
  const archiveBtn = $('#btnArquivarPeriodo');
  if (archiveBtn) archiveBtn.textContent = period.arquivado ? 'Reativar período' : 'Arquivar período';
}

function scheduleConfigHTML(item, index) {
  return `<article class="config-schedule-card">
    <div class="config-schedule-head">
      <strong>${lessonNumberLabel(index)}</strong>
      <button type="button" class="tiny-btn" data-delete-schedule="${index}" title="Excluir aula">×</button>
    </div>
    <div class="form-grid two-cols">
      <div class="form-group">
        <label>Tema</label>
        <input type="text" value="${escapeAttr(item.tema || '')}" data-schedule-field="tema" data-schedule-index="${index}">
      </div>
      <div class="form-group">
        <label>Dia da aula</label>
        <input type="date" value="${escapeAttr(item.dia || '')}" data-schedule-field="dia" data-schedule-index="${index}">
      </div>
    </div>
    <div class="form-group">
      <label>Local</label>
      <input type="text" value="${escapeAttr(item.local || '')}" data-schedule-field="local" data-schedule-index="${index}" placeholder="Ex: Laboratório">
    </div>
    <div class="form-group">
      <label>Foco da aula</label>
      <textarea rows="2" data-schedule-field="foco" data-schedule-index="${index}">${escapeHTML(item.foco || '')}</textarea>
    </div>
    <div class="form-group">
      <label>Observação</label>
      <textarea rows="2" data-schedule-field="observacao" data-schedule-index="${index}" placeholder="Opcional">${escapeHTML(item.observacao || '')}</textarea>
    </div>
    <div class="schedule-link-grid">
      <div>
        <div class="linked-title">Produtos vinculados</div>
        <div class="check-pill-grid">${scheduleProductChecks(item, index)}</div>
      </div>
      <div>
        <div class="linked-title">Aulas teóricas vinculadas</div>
        <div class="check-pill-grid">${scheduleCategoryChecks(item, index)}</div>
      </div>
    </div>
  </article>`;
}

function scheduleProductChecks(item, index) {
  const selected = new Set(item.produtos || []);
  return db.produtos.map(p => `<label class="check-pill"><input type="checkbox" ${selected.has(p.id) ? 'checked' : ''} data-schedule-product="${escapeAttr(p.id)}" data-schedule-index="${index}"><span>${escapeHTML(p.nome)}</span></label>`).join('');
}

function scheduleCategoryChecks(item, index) {
  const selected = new Set(item.categorias || []);
  return getTheoryContents().map(content => `<label class="check-pill"><input type="checkbox" ${selected.has(content.id) ? 'checked' : ''} data-schedule-category="${escapeAttr(content.id)}" data-schedule-index="${index}"><span>${escapeHTML(content.titulo)}</span></label>`).join('');
}

function renderRulesConfig() {
  const root = $('#configRulesList');
  if (!root) return;
  db.configs.regrasLaboratorio = normalizeLabRules(db.configs.regrasLaboratorio);
  root.innerHTML = db.configs.regrasLaboratorio.map(labRuleConfigHTML).join('') || emptyHTML('Nenhuma regra cadastrada.');
  root.querySelectorAll('[data-rule-field]').forEach(input => input.addEventListener('change', () => saveLabRuleField(input)));
  root.querySelectorAll('[data-delete-rule]').forEach(btn => btn.addEventListener('click', () => deleteLabRule(btn.dataset.deleteRule)));
}

function labRuleConfigHTML(rule, index) {
  return `<article class="config-rule-card">
    <div class="config-schedule-head">
      <strong>${escapeHTML(rule.numero || String(index + 1).padStart(2, '0'))} · ${escapeHTML(rule.titulo || 'Regra')}</strong>
      <button type="button" class="tiny-btn" data-delete-rule="${escapeAttr(rule.id)}" title="Excluir regra">×</button>
    </div>
    <div class="form-grid two-cols">
      <div class="form-group">
        <label>Número</label>
        <input type="text" value="${escapeAttr(rule.numero || '')}" data-rule-field="numero" data-rule-id="${escapeAttr(rule.id)}">
      </div>
      <div class="form-group">
        <label>Título</label>
        <input type="text" value="${escapeAttr(rule.titulo || '')}" data-rule-field="titulo" data-rule-id="${escapeAttr(rule.id)}">
      </div>
    </div>
    <div class="form-group">
      <label>Texto da regra</label>
      <textarea rows="3" data-rule-field="texto" data-rule-id="${escapeAttr(rule.id)}">${escapeHTML(rule.texto || '')}</textarea>
    </div>
  </article>`;
}

function saveLabRuleField(input) {
  const rule = db.configs.regrasLaboratorio.find(item => item.id === input.dataset.ruleId);
  if (!rule) return;
  rule[input.dataset.ruleField] = input.value;
  saveDB();
  renderRules();
  renderRulesConfig();
  toast('Regra atualizada.');
}

function addLabRule() {
  db.configs.regrasLaboratorio = normalizeLabRules(db.configs.regrasLaboratorio);
  const next = db.configs.regrasLaboratorio.length + 1;
  db.configs.regrasLaboratorio.push({ id: uid('regra'), numero: String(next).padStart(2, '0'), titulo: 'Nova regra', texto: '' });
  saveDB();
  renderRules();
  renderRulesConfig();
  toast('Regra adicionada.');
}

function deleteLabRule(id) {
  if (!id) return;
  if (!confirm('Excluir esta regra?')) return;
  db.configs.regrasLaboratorio = db.configs.regrasLaboratorio.filter(rule => rule.id !== id);
  saveDB();
  renderRules();
  renderRulesConfig();
  toast('Regra excluída.');
}

function saveScheduleField(input) {
  const index = Number(input.dataset.scheduleIndex);
  const field = input.dataset.scheduleField;
  const schedule = getSchedule();
  if (!schedule[index] || !field) return;
  schedule[index][field] = input.value;
  saveDB();
  renderCronograma();
  renderContentConfig();
  renderAulas();
  toast('Cronograma atualizado.');
}

function saveScheduleLinkField(input, field) {
  const index = Number(input.dataset.scheduleIndex);
  const schedule = getSchedule();
  if (!schedule[index]) return;
  const selector = field === 'produtos' ? `[data-schedule-product][data-schedule-index="${index}"]` : `[data-schedule-category][data-schedule-index="${index}"]`;
  const attr = field === 'produtos' ? 'scheduleProduct' : 'scheduleCategory';
  schedule[index][field] = $$(selector).filter(el => el.checked).map(el => el.dataset[attr]);
  saveDB();
  renderCronograma();
  renderAulas();
  toast('Vínculo atualizado.');
}

function setActivePeriod(id) {
  if (!getSchedulePeriods().some(period => period.id === id)) return;
  db.configs.periodoAtivoId = id;
  saveDB();
  renderActivePeriodLabel();
  renderScheduleConfig();
  renderContentConfig();
  renderCronograma();
  renderAulas();
}

function savePeriodField(field, value) {
  const period = getActivePeriod();
  if (!period) return;
  period[field] = value;
  saveDB();
  renderActivePeriodLabel();
  renderCronograma();
  renderScheduleConfig();
  toast('Período atualizado.');
}

function createPeriod(archiveCurrent = false) {
  const current = getActivePeriod();
  if (archiveCurrent && current) current.arquivado = true;
  const year = new Date().getFullYear();
  const period = { id: uid('periodo'), nome: `Novo período ${year}`, inicio: '', fim: '', arquivado: false, aulas: [] };
  getSchedulePeriods().push(period);
  db.configs.periodoAtivoId = period.id;
  saveDB();
  renderActivePeriodLabel();
  renderScheduleConfig();
  renderContentConfig();
  renderCronograma();
  renderAulas();
  toast(archiveCurrent ? 'Período arquivado e novo período criado.' : 'Novo período criado.');
}

function archiveActivePeriod() {
  const period = getActivePeriod();
  if (!period) return;
  period.arquivado = !period.arquivado;
  saveDB();
  renderActivePeriodLabel();
  renderScheduleConfig();
  renderContentConfig();
  renderCronograma();
  renderAulas();
  toast(period.arquivado ? 'Período arquivado.' : 'Período reativado.');
}

function addScheduleLesson() {
  const period = getActivePeriod();
  if (!period) return;
  period.aulas.push(normalizeScheduleItem({ aula: lessonNumberLabel(period.aulas.length), tema: '', foco: '', produtos: [], categorias: [] }, {}, period.aulas.length));
  saveDB();
  renderScheduleConfig();
  renderContentConfig();
  renderAulas();
  renderCronograma();
  toast('Aula adicionada.');
}

function deleteScheduleLesson(index) {
  const period = getActivePeriod();
  if (!period?.aulas?.[index]) return;
  if (!confirm('Excluir esta aula do cronograma?')) return;
  period.aulas.splice(index, 1);
  saveDB();
  renderScheduleConfig();
  renderContentConfig();
  renderAulas();
  renderCronograma();
  toast('Aula excluída.');
}

function periodDateLabel(period) {
  const start = formatScheduleDate(period?.inicio);
  const end = formatScheduleDate(period?.fim);
  if (start && end) return `${start} a ${end}${period.arquivado ? ' · arquivado' : ''}`;
  if (start) return `Início ${start}${period.arquivado ? ' · arquivado' : ''}`;
  if (period?.arquivado) return 'Arquivado';
  return 'Período ativo';
}

function formatScheduleDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (year && month && day) return `${day}/${month}/${year}`;
  return value;
}

function scheduleDateParts(value) {
  if (!value) return { day: '--', weekday: 'DATA', month: '---', year: 'A definir' };
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { day: value, weekday: 'DATA', month: '', year: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase(),
    month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    year: String(date.getFullYear())
  };
}

function lessonNumberLabel(index) {
  return `Aula ${String(Number(index) + 1).padStart(2, '0')}`;
}

function renderAulaSelect() {
  if (!$('#aulaProdutoSelect')) return;
  $('#aulaProdutoSelect').innerHTML = db.produtos.map(p => `<option value="${escapeAttr(p.id)}">${escapeHTML(p.nome)}</option>`).join('');
  if (db.configs.ultimoProdutoAula && db.produtos.some(p => p.id === db.configs.ultimoProdutoAula)) $('#aulaProdutoSelect').value = db.configs.ultimoProdutoAula;
}

function renderAulas() {
  const root = $('#aulaContent');
  const schedule = getSchedule();
  if (!schedule.length) {
    root.innerHTML = emptyHTML('Nenhuma aula cadastrada no período ativo.');
    return;
  }
  activeTheoryLessonIndex = Math.max(0, Math.min(schedule.length - 1, activeTheoryLessonIndex));
  root.innerHTML = `
    <div class="lesson-tabs" role="tablist">
      ${schedule.map((item, index) => `<button type="button" class="lesson-tab ${index === activeTheoryLessonIndex ? 'active' : ''}" data-theory-lesson="${index}">${lessonNumberLabel(index)}</button>`).join('')}
    </div>
    <div class="theory-lesson-list">
      ${schedule.map((item, index) => theoryScheduleLessonHTML(item, index)).join('')}
    </div>
    <div class="notice-card">
      <strong>Uso didático.</strong> As referências legais ficam aqui como apoio às aulas. Para registro, rotulagem oficial ou inspeção, confira sempre a norma vigente no órgão competente.
    </div>
    <div class="section-header"><div><h2>Referências legais</h2></div></div>
    <div class="stack-list">${db.legislacoes.map(lawCardHTML).join('')}</div>`;
  root.querySelectorAll('[data-theory-lesson]').forEach(btn => btn.addEventListener('click', () => {
    activeTheoryLessonIndex = Number(btn.dataset.theoryLesson);
    activeTheoryImageIndex = 0;
    renderAulas();
  }));
  bindTheorySlides(root);
  root.querySelectorAll('[data-view-theory-content]').forEach(btn => btn.addEventListener('click', () => openTheoryContentView(btn.dataset.viewTheoryContent)));
  bindInternalLinks(root);
  bindLawLinks(root);
}

function theoryScheduleLessonHTML(item, index) {
  const categories = (item.categorias || []).map(getTheoryContent).filter(Boolean);
  return `<article class="theory-lesson-panel ${index === activeTheoryLessonIndex ? 'active' : ''}" data-theory-panel="${index}">
    <header class="theory-lesson-header">
      <div>
        <span>${lessonNumberLabel(index)}${item.dia ? ` · ${escapeHTML(formatScheduleDate(item.dia))}` : ''}</span>
        <h3>${escapeHTML(item.tema || lessonNumberLabel(index))}</h3>
      </div>
    </header>
    <div class="theory-subject-list">
      ${categories.map(theorySubjectListHTML).join('') || '<div class="notice-card slim">Nenhum assunto teórico vinculado a esta aula.</div>'}
    </div>
    <div class="lesson-links">
      ${(item.produtos || []).length ? `<div class="linked-block"><div class="linked-title">Roteiros desta aula</div>${linkedProductsHTML(item.produtos)}</div>` : ''}
    </div>
  </article>`;
}

function theorySubjectListHTML(content) {
  const format = content.modo === 'slides' ? `${content.imagens?.length || 0} slide(s)` : `${content.topicos?.length || 0} tópico(s)`;
  return `<button type="button" class="theory-subject-button" data-view-theory-content="${escapeAttr(content.id)}">
    <div>
      <strong>${escapeHTML(content.titulo)}</strong>
      <span>${escapeHTML(format)}</span>
    </div>
    <b>›</b>
  </button>`;
}

function openTheoryContentView(id) {
  const content = getTheoryContent(id);
  if (!content) return toast('Conteúdo não encontrado.');
  $('#conteudoViewTitle').textContent = content.titulo;
  $('#conteudoViewBody').innerHTML = theoryLessonHTML(content);
  bindTheorySlides($('#conteudoViewBody'));
  bindInternalLinks($('#conteudoViewBody'));
  openModal('modalConteudoView');
}

function theorySlidesHTML(images) {
  const index = 0;
  return `<div class="theory-slides" data-theory-slides>
    <div class="theory-slide-frame">
      ${images.map((src, imageIndex) => `<img src="${escapeAttr(src)}" alt="Slide ${imageIndex + 1}" class="${imageIndex === index ? 'active' : ''}" data-theory-image="${imageIndex}">`).join('')}
    </div>
    <div class="theory-slide-controls">
      <button type="button" class="secondary-btn compact" data-theory-slide-prev>Voltar</button>
      <strong data-theory-slide-position>${index + 1} / ${images.length}</strong>
      <button type="button" class="primary-btn compact" data-theory-slide-next>Avançar</button>
    </div>
  </div>`;
}

function bindTheorySlides(root) {
  root.querySelectorAll('[data-theory-slides]').forEach(wrap => {
    const images = Array.from(wrap.querySelectorAll('[data-theory-image]'));
    const position = wrap.querySelector('[data-theory-slide-position]');
    let index = 0;
    const show = next => {
      index = Math.max(0, Math.min(images.length - 1, next));
      images.forEach((image, imageIndex) => image.classList.toggle('active', imageIndex === index));
      if (position) position.textContent = `${index + 1} / ${images.length}`;
    };
    wrap.querySelector('[data-theory-slide-prev]')?.addEventListener('click', () => show(index - 1));
    wrap.querySelector('[data-theory-slide-next]')?.addEventListener('click', () => show(index + 1));
  });
}

function renderLegislacao() {
  if (!$('#legislacaoList')) return;
  $('#legislacaoList').innerHTML = db.legislacoes.map(lawCardHTML).join('') || emptyHTML('Nenhuma referência legal cadastrada.');
  bindLawLinks($('#legislacaoList'));
}

function theoryLessonHTML(lesson) {
  const content = getTheoryContent(lesson.id) || lesson;
  const showSlides = content.modo === 'slides' && content.imagens?.length;
  return `<article class="theory-card">
    <h3>${escapeHTML(content.titulo)}</h3>
    ${showSlides ? theorySlidesHTML(content.imagens) : `
      <p>${escapeHTML(content.resumo)}</p>
      <div class="theory-columns">
        <div>
          <h4>Tópicos</h4>
          ${unorderedList(content.topicos)}
        </div>
        <div>
          <h4>Perguntas</h4>
          ${unorderedList(content.perguntas)}
        </div>
      </div>`}
    <div class="linked-block">
      <div class="linked-title">Roteiros disponíveis</div>
      ${linkedProductsHTML(content.produtos || [])}
    </div>
    <div class="linked-block">
      <div class="linked-title">Insumos citados</div>
      ${linkedIngredientsHTML(content.insumos || [])}
    </div>
  </article>`;
}

function linkedProductsHTML(ids) {
  return `<div class="link-chip-row">${ids.map(id => {
    const p = findProduct(id);
    return p ? `<button type="button" class="link-chip" data-open-product="${escapeAttr(id)}">${escapeHTML(p.nome)}</button>` : '';
  }).join('')}</div>`;
}

function linkedIngredientsHTML(ids) {
  return `<div class="link-chip-row">${ids.map(id => {
    const i = findIngredient(id);
    return i ? `<button type="button" class="link-chip" data-open-ingredient="${escapeAttr(id)}">${escapeHTML(i.nome)}</button>` : '';
  }).join('')}</div>`;
}

function bindInternalLinks(root) {
  root?.querySelectorAll('[data-open-product]').forEach(btn => btn.addEventListener('click', () => openProductWorkspace(btn.dataset.openProduct)));
  root?.querySelectorAll('[data-open-ingredient]').forEach(btn => btn.addEventListener('click', () => openIngredientView(btn.dataset.openIngredient)));
}

function lawCardHTML(law) {
  const product = law.produtoId ? findProduct(law.produtoId) : null;
  return `<details class="law-card">
    <summary class="law-summary">
      <h3>${escapeHTML(lawDisplayTitle(law))}</h3>
      <p>${escapeHTML(law.resumo || '')}</p>
      <span aria-hidden="true">+</span>
    </summary>
    <div class="law-details">
      <div class="item-subtitle">${escapeHTML(law.orgao || '')}${product ? ' · ' + escapeHTML(product.nome) : ' · Geral'}</div>
      ${unorderedList(law.pontos || [])}
      ${law.url ? `<button type="button" class="secondary-btn full" data-open-url="${escapeAttr(law.url)}">Abrir referência</button>` : ''}
    </div>
  </details>`;
}

function lawDisplayTitle(law) {
  const labels = {
    leg_hamburguer_724_2022: 'Portaria SDA/MAPA nº 724/2022 - RTIQ do hambúrguer',
    leg_linguica_in4_2000: 'IN SDA/MAPA nº 4/2000 - RTIQ de linguiça',
    leg_salsicha_in4_2000: 'IN SDA/MAPA nº 4/2000 - RTIQ de salsicha',
    leg_riispoa_9013: 'Decreto nº 9.013/2017 - RIISPOA',
    leg_rotulagem_anvisa: 'RDC nº 429/2020 e IN nº 75/2020 - Rotulagem nutricional'
  };
  return labels[law.id] || law.titulo || 'Referência legal';
}

function bindLawLinks(root) {
  root?.querySelectorAll('[data-open-url]').forEach(btn => btn.addEventListener('click', () => window.open(btn.dataset.openUrl, '_blank', 'noopener')));
}

function openProductModal(id = null) {
  const p = id ? findProduct(id) : null;
  $('#produtoId').value = p?.id || '';
  $('#produtoNome').value = p?.nome || '';
  $('#produtoCategoria').value = p?.categoria || '';
  setMultiSelectValues($('#produtoCategoriaDidatica'), normalizeCategoryIds(p));
  $('#produtoDescricao').value = p?.descricao || '';
  $('#produtoObjetivo').value = p?.objetivo || '';
  $('#paramGorduraMax').value = p?.parametros?.gorduraMax ?? '';
  $('#paramProteinaMin').value = p?.parametros?.proteinaMin ?? '';
  $('#paramCarbMax').value = p?.parametros?.carbMax ?? '';
  $('#paramPncMax').value = p?.parametros?.proteinaNaoCarneaMax ?? '';
  $('#paramProibePnc').checked = Boolean(p?.parametros?.proibeProteinaNaoCarnea);
  $('#paramMostrarValidacao').checked = p?.parametros?.mostrarValidacao !== false;
  $('#produtoFluxo').value = (p?.fluxo || []).join('\n');
  $('#produtoPontos').value = (p?.pontos || []).join('\n');
  $('#produtoEquipamentos').value = (p?.equipamentos || []).join('\n');
  $('#produtoPerguntas').value = (p?.perguntas || []).join('\n');
  tempProductPhotos = clone(p?.fotos || []);
  $('#produtoFotos').value = '';
  renderProductPhotoPreview();
  $('#btnExcluirProduto').style.display = p ? 'inline-flex' : 'none';
  openModal('modalProduto');
}

async function handleProductPhotos(ev) {
  const files = Array.from(ev.target.files || []);
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const dataUrl = await fileToDataURL(file, 1200, 0.82);
    tempProductPhotos.push(dataUrl);
  }
  renderProductPhotoPreview();
}

function renderProductPhotoPreview() {
  const wrap = $('#produtoFotosPreview');
  wrap.innerHTML = tempProductPhotos.map((src, index) => `
    <div class="photo-wrap"><img class="photo-thumb" src="${escapeAttr(src)}" alt="Foto"><button type="button" class="photo-remove" data-remove-photo="${index}">×</button></div>
  `).join('');
  wrap.querySelectorAll('[data-remove-photo]').forEach(btn => btn.addEventListener('click', () => {
    tempProductPhotos.splice(Number(btn.dataset.removePhoto), 1);
    renderProductPhotoPreview();
  }));
}

function saveProductFromModal() {
  const id = $('#produtoId').value || uid('prod');
  const categoriaIds = multiSelectValues($('#produtoCategoriaDidatica'));
  const product = {
    id,
    nome: $('#produtoNome').value.trim(),
    categoria: $('#produtoCategoria').value.trim(),
    categoriaId: categoriaIds[0] || '',
    categoriaIds,
    especie: findProduct(id)?.especie || '',
    tipo: findProduct(id)?.tipo || inferProductTypeFromName($('#produtoNome').value),
    descricao: $('#produtoDescricao').value.trim(),
    objetivo: $('#produtoObjetivo').value.trim(),
    parametros: {
      gorduraMax: numberOrBlank($('#paramGorduraMax').value),
      proteinaMin: numberOrBlank($('#paramProteinaMin').value),
      carbMax: numberOrBlank($('#paramCarbMax').value),
      proteinaNaoCarneaMax: numberOrBlank($('#paramPncMax').value),
      proibeProteinaNaoCarnea: $('#paramProibePnc').checked,
      mostrarValidacao: $('#paramMostrarValidacao').checked
    },
    fotos: tempProductPhotos,
    fluxo: linesFrom($('#produtoFluxo').value),
    pontos: linesFrom($('#produtoPontos').value),
    equipamentos: linesFrom($('#produtoEquipamentos').value),
    perguntas: linesFrom($('#produtoPerguntas').value)
  };
  if (!product.nome) return toast('Informe o nome do produto.');
  product.categoriaIds = product.categoriaIds.length ? product.categoriaIds : inferProductCategoryIds(product);
  product.categoriaId = product.categoriaIds[0] || inferProductCategoryId(product);
  const idx = db.produtos.findIndex(p => p.id === id);
  if (idx >= 0) db.produtos[idx] = product; else db.produtos.push(product);
  activeProductId = id;
  db.configs.ultimoProdutoAula = id;
  db.configs.produtoSelecionado = id;
  saveDB();
  closeModal('modalProduto');
  renderAll();
  toast('Produto salvo.');
}

function deleteProductFromModal() {
  const id = $('#produtoId').value;
  if (!id) return;
  const used = db.formulacoes.some(f => f.produtoId === id);
  if (used && !confirm('Este produto possui formulações. Excluir mesmo assim?')) return;
  db.produtos = db.produtos.filter(p => p.id !== id);
  db.formulacoes = db.formulacoes.filter(f => f.produtoId !== id);
  db.legislacoes.forEach(l => { if (l.produtoId === id) l.produtoId = null; });
  activeProductId = '';
  db.configs.produtoSelecionado = '';
  saveDB();
  closeModal('modalProduto');
  renderAll();
  toast('Produto excluído.');
}

function populateTypeOptions() {
  $('#insumoTipo').innerHTML = TYPES.map(t => `<option value="${escapeAttr(t.value)}">${escapeHTML(t.label)}</option>`).join('');
  populateSubtypeOptions($('#insumoTipo')?.value || TYPES[0]?.value);
}

function populateSubtypeOptions(type, selected = '') {
  const select = $('#insumoSubtipo');
  if (!select) return;
  const options = ingredientSubtypes(type);
  select.innerHTML = [`<option value="">Sem subdivisão</option>`, ...options.map(value => `<option value="${escapeAttr(value)}">${escapeHTML(capitalizeFirst(value))}</option>`)].join('');
  if (selected && options.includes(selected)) select.value = selected;
}

function populateProductCategoryOptions() {
  const select = $('#produtoCategoriaDidatica');
  if (!select) return;
  select.innerHTML = PRODUCT_CATEGORIES.map(category => `<option value="${escapeAttr(category.id)}">${escapeHTML(theoryTitle(category.id))}</option>`).join('');
}

function openIngredientModal(id = null) {
  const i = id ? findIngredient(id) : null;
  $('#insumoId').value = i?.id || '';
  $('#insumoNome').value = i?.nome || '';
  $('#insumoTipo').value = i ? normalizeIngredientType(i) : TYPES[0].value;
  populateSubtypeOptions($('#insumoTipo').value, i?.subtipo || '');
  $('#insumoFuncao').value = i?.funcao || '';
  $('#insumoObs').value = i?.obs || '';
  $('#insumoGordura').value = i?.gordura ?? 0;
  $('#insumoProteina').value = i?.proteina ?? 0;
  $('#insumoCarbo').value = i?.carboidrato ?? 0;
  $('#insumoCusto').value = i?.custo ?? 0;
  $('#insumoUsadoSim').checked = i ? i.usadoNaFormulacao !== false : true;
  $('#insumoUsadoNao').checked = i ? i.usadoNaFormulacao === false : false;
  $('#insumoPnc').checked = Boolean(i?.proteinaNaoCarnea);
  $('#insumoAlergeno').checked = Boolean(i?.alergeno);
  tempIngredientPhoto = i?.foto || '';
  $('#insumoFoto').value = '';
  renderIngredientPhotoPreview();
  $('#btnExcluirInsumo').style.display = i ? 'inline-flex' : 'none';
  openModal('modalInsumo');
}

async function handleIngredientPhoto(ev) {
  const file = Array.from(ev.target.files || []).find(item => item.type.startsWith('image/'));
  if (!file) return;
  tempIngredientPhoto = await fileToDataURL(file, 1000, 0.82);
  renderIngredientPhotoPreview();
}

function renderIngredientPhotoPreview() {
  const wrap = $('#insumoFotoPreview');
  if (!wrap) return;
  wrap.innerHTML = tempIngredientPhoto ? `
    <div class="photo-wrap"><img class="photo-thumb" src="${escapeAttr(tempIngredientPhoto)}" alt="Foto"><button type="button" class="photo-remove" data-remove-ingredient-photo>×</button></div>
  ` : '';
  wrap.querySelector('[data-remove-ingredient-photo]')?.addEventListener('click', () => {
    tempIngredientPhoto = '';
    $('#insumoFoto').value = '';
    renderIngredientPhotoPreview();
  });
}

function openIngredientView(id = null) {
  const i = findIngredient(id);
  if (!i) return toast('Insumo não encontrado.');
  $('#insumoViewTitle').textContent = i.nome;
  $('#insumoViewContent').innerHTML = `
    <div class="ingredient-view-card">
      ${i.foto ? `<img class="ingredient-view-photo" src="${escapeAttr(i.foto)}" alt="">` : ''}
      <div class="item-meta">
        <span class="badge info">${escapeHTML(typeLabel(i.tipo))}</span>
        ${i.subtipo ? `<span class="badge">${escapeHTML(capitalizeFirst(i.subtipo))}</span>` : ''}
        ${i.usadoNaFormulacao === false ? '<span class="badge">Fora da formulação</span>' : ''}
        ${i.alergeno ? '<span class="badge danger">alérgeno</span>' : ''}
        ${i.proteinaNaoCarnea ? '<span class="badge warn">proteína agregada</span>' : ''}
      </div>
      <div class="ingredient-view-section">
        <h3>Função tecnológica</h3>
        <p>${escapeHTML(i.funcao || 'Função não cadastrada.')}</p>
      </div>
      ${i.obs ? `<div class="ingredient-view-section"><h3>Observação</h3><p>${escapeHTML(i.obs)}</p></div>` : ''}
      <div class="analysis-grid ingredient-metrics">
        <div class="analysis-metric"><strong>${fmt(i.gordura)}%</strong><span>Gordura</span></div>
        <div class="analysis-metric"><strong>${fmt(i.proteina)}%</strong><span>Proteína</span></div>
        <div class="analysis-metric"><strong>${fmt(i.carboidrato)}%</strong><span>Carboidrato</span></div>
      </div>
    </div>`;
  openModal('modalInsumoView');
}

function saveIngredientFromModal() {
  const id = $('#insumoId').value || uid('ing');
  const ingredient = {
    id,
    nome: $('#insumoNome').value.trim(),
    categoria: typeLabel($('#insumoTipo').value),
    tipo: $('#insumoTipo').value,
    subtipo: $('#insumoSubtipo').value,
    funcao: $('#insumoFuncao').value.trim(),
    obs: $('#insumoObs').value.trim(),
    gordura: toNumber($('#insumoGordura').value),
    proteina: toNumber($('#insumoProteina').value),
    carboidrato: toNumber($('#insumoCarbo').value),
    custo: toNumber($('#insumoCusto').value),
    usadoNaFormulacao: $('#insumoUsadoSim').checked,
    proteinaNaoCarnea: $('#insumoPnc').checked || isFunctionalProtein({ tipo: $('#insumoTipo').value, subtipo: $('#insumoSubtipo').value, nome: $('#insumoNome').value }),
    alergeno: $('#insumoAlergeno').checked,
    foto: tempIngredientPhoto
  };
  if (!ingredient.nome) return toast('Informe o nome do insumo.');
  const idx = db.insumos.findIndex(i => i.id === id);
  if (idx >= 0) db.insumos[idx] = ingredient; else db.insumos.push(ingredient);
  saveDB();
  closeModal('modalInsumo');
  renderAll();
  if ($('#modalFormula')?.classList.contains('show')) {
    renderFormulaFilters();
    renderFormulaItems();
  }
  toast('Insumo salvo.');
}

function deleteIngredientFromModal() {
  const id = $('#insumoId').value;
  if (!id) return;
  const used = db.formulacoes.some(f => f.itens.some(item => item.insumoId === id));
  if (used) return toast('Este insumo está em uma formulação. Remova-o da formulação antes de excluir.');
  db.insumos = db.insumos.filter(i => i.id !== id);
  saveDB();
  closeModal('modalInsumo');
  renderAll();
  toast('Insumo excluído.');
}

function openFormulaModal(id = null, productId = null) {
  renderFormulaFilters();
  const f = id ? findFormula(id) : null;
  const selectedProduct = productId || activeProductId || db.produtos[0]?.id || '';
  const product = findProduct(f?.produtoId || selectedProduct);
  $('#formulaId').value = f?.id || '';
  $('#formulaProduto').value = f?.produtoId || selectedProduct;
  $('#formulaNome').value = f?.nome || '';
  $('#formulaPeso').value = f?.pesoReferencia || 1000;
  $('#formulaBaseCalculo').value = f?.baseCalculo || defaultFormulaBase(product);
  $('#formulaRendimento').value = f?.rendimento ?? '';
  $('#formulaObs').value = f?.observacoes || '';
  formulaDraftItems = clone(f?.itens || [{ insumoId: formulaEligibleIngredients()[0]?.id || '', percentual: 100 }]);
  $('#btnExcluirFormula').style.display = f ? 'inline-flex' : 'none';
  renderFormulaItems();
  openModal('modalFormula');
}

function renderFormulaItems() {
  const draft = getFormulaFromModal(false);
  $('#formulaItens').innerHTML = formulaDraftItems.map((item, idx) => {
    const grams = formulaItemGrams(draft, item);
    const options = formulaEligibleIngredients(item.insumoId);
    return `<tr>
      <td><select data-row-insumo="${idx}">${options.map(i => `<option value="${escapeAttr(i.id)}" ${i.id === item.insumoId ? 'selected' : ''}>${escapeHTML(i.nome)}</option>`).join('')}</select></td>
      <td><input type="number" step="0.1" data-row-pct="${idx}" value="${escapeAttr(item.percentual)}"></td>
      <td><strong data-row-grams="${idx}">${fmt(grams)} g</strong></td>
      <td><button type="button" class="tiny-btn" data-row-del="${idx}" title="Remover">×</button></td>
    </tr>`;
  }).join('');
  $('#formulaItens').querySelectorAll('[data-row-insumo]').forEach(el => el.addEventListener('change', () => {
    formulaDraftItems[Number(el.dataset.rowInsumo)].insumoId = el.value;
    renderFormulaSummary();
  }));
  $('#formulaItens').querySelectorAll('[data-row-pct]').forEach(el => el.addEventListener('input', () => {
    const idx = Number(el.dataset.rowPct);
    formulaDraftItems[idx].percentual = toNumber(el.value);
    const draft = getFormulaFromModal(false);
    const grams = formulaItemGrams(draft, formulaDraftItems[idx]);
    const gramsCell = $(`[data-row-grams="${idx}"]`);
    if (gramsCell) gramsCell.textContent = `${fmt(grams)} g`;
    renderFormulaSummary();
  }));
  $('#formulaItens').querySelectorAll('[data-row-del]').forEach(el => el.addEventListener('click', () => {
    formulaDraftItems.splice(Number(el.dataset.rowDel), 1);
    renderFormulaItems();
  }));
  renderFormulaSummary();
}

function formulaEligibleIngredients(currentId = '') {
  return db.insumos.filter(ingredient => ingredient.usadoNaFormulacao !== false || ingredient.id === currentId);
}

function renderFormulaSummary() {
  const draft = getFormulaFromModal(false);
  $('#formulaResumo').innerHTML = analysisHTML(analyzeFormula(draft));
}

function getFormulaFromModal(requireName = true) {
  const existing = findFormula($('#formulaId').value);
  return {
    id: $('#formulaId').value || uid('form'),
    produtoId: $('#formulaProduto').value,
    nome: $('#formulaNome').value.trim() || (requireName ? '' : 'Formulação em edição'),
    pesoReferencia: toNumber($('#formulaPeso').value) || 1000,
    baseCalculo: $('#formulaBaseCalculo').value || defaultFormulaBase(findProduct($('#formulaProduto').value)),
    rendimento: numberOrBlank($('#formulaRendimento').value),
    itens: formulaDraftItems.map(item => ({ insumoId: item.insumoId, percentual: toNumber(item.percentual) })).filter(item => item.insumoId),
    observacoes: $('#formulaObs').value.trim(),
    usarBlend: existing?.usarBlend === true,
    blendComponentes: clone(existing?.blendComponentes || []),
    materiaPrimaUnica: clone(existing?.materiaPrimaUnica || null),
    bloqueada: Boolean(existing?.bloqueada)
  };
}

function saveFormulaFromModal() {
  const formula = getFormulaFromModal(true);
  if (!formula.produtoId) return toast('Selecione um produto.');
  if (!formula.nome) return toast('Informe o nome da formulação.');
  if (!formula.itens.length) return toast('Adicione ao menos um insumo.');
  const idx = db.formulacoes.findIndex(f => f.id === formula.id);
  if (idx >= 0) db.formulacoes[idx] = formula; else db.formulacoes.push(formula);
  activeProductId = formula.produtoId;
  db.configs.produtoSelecionado = formula.produtoId;
  db.configs.ultimoProdutoAula = formula.produtoId;
  saveDB();
  closeModal('modalFormula');
  renderAll();
  toast('Formulação salva.');
}

function deleteFormulaFromModal() {
  const id = $('#formulaId').value;
  if (!id) return;
  if (!confirm('Excluir esta formulação?')) return;
  db.formulacoes = db.formulacoes.filter(f => f.id !== id);
  saveDB();
  closeModal('modalFormula');
  renderAll();
  toast('Formulação excluída.');
}

function updateFormulaWeight(formulaId, value, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula) return;
  formula.pesoReferencia = Math.max(1, toNumber(value) || 1);
  saveInlineFormulaEdit('Peso atualizado.', options);
}

function updateFormulaBase(formulaId, value, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula) return;
  formula.baseCalculo = value === 'produto_final' ? 'produto_final' : 'massa_carnea';
  saveInlineFormulaEdit('Base de cálculo atualizada.', options);
}

function updateFormulaItemPercent(formulaId, insumoId, value, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula || !insumoId || formula.bloqueada) return;
  const item = ensureFormulaItem(formula, insumoId);
  item.percentual = Math.max(0, toNumber(value));
  saveInlineFormulaEdit('Percentual atualizado.', options);
}

function addFormulaItemInline(formulaId, insumoId) {
  const formula = findFormula(formulaId);
  const ingredient = findIngredient(insumoId);
  if (!formula || !ingredient || formula.bloqueada) return;
  if ((formula.itens || []).some(item => item.insumoId === insumoId)) return toast('Esse insumo já está na formulação.');
  const suggestion = ingredientSuggestion(ingredient);
  formula.itens.push({ insumoId, percentual: suggestion?.suave ?? 0.1 });
  saveInlineFormulaEdit('Insumo adicionado.');
}

function removeFormulaItemInline(formulaId, insumoId) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  formula.itens = (formula.itens || []).filter(item => item.insumoId !== insumoId);
  saveInlineFormulaEdit('Insumo removido.');
}

function requestFormulaItemRemoval(formulaId, insumoId) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  const ingredient = findIngredient(insumoId);
  openConfirmation({
    title: 'Excluir insumo',
    message: `Deseja excluir "${ingredient?.nome || 'este insumo'}" desta formulação?`,
    confirmLabel: 'Excluir',
    action: () => removeFormulaItemInline(formulaId, insumoId)
  });
}

function toggleFormulaLock(formulaId) {
  const formula = findFormula(formulaId);
  if (!formula) return;
  formula.bloqueada = !formula.bloqueada;
  saveInlineFormulaEdit(formula.bloqueada ? 'Formulação travada.' : 'Formulação destravada.');
}

function updateFormulaBlend(formulaId, changes = {}, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  const previous = formulaBlendState(formula);
  const useBlend = changes.useBlend ?? previous.useBlend;

  if (!useBlend) {
    const first = previous.components[0] || previous.singleComponent;
    const total = Math.max(1, toNumber(previous.blendGrams ?? changes.blendGrams ?? formula.pesoReferencia) || 1);
    formula.usarBlend = false;
    formula.materiaPrimaUnica = {
      id: formula.materiaPrimaUnica?.id || uid('materia'),
      corteId: first?.corteId || 'acem',
      perfil: first?.perfil || normalizeMeatProfile('', first?.corteId || 'acem'),
      gramas: total,
      gorduraCustom: first?.gorduraCustom ?? ''
    };
    setFormulaWeightFromBlendTotal(formula, total);
    saveInlineFormulaEdit('Blend atualizado.', options);
    return;
  }

  formula.usarBlend = true;
  const single = normalizeSingleMaterial(formula.materiaPrimaUnica, formula);
  formula.blendComponentes = normalizeBlendComponents(formula.blendComponentes, formula);
  if (formula.blendComponentes.length < 2) {
    formula.blendComponentes[0] = { ...single, id: formula.blendComponentes[0]?.id || uid('blend') };
    formula.blendComponentes.push(defaultSecondBlendComponent(formula, { singleComponent: single }));
  }
  saveInlineFormulaEdit('Blend atualizado.', options);
}

function defaultSecondBlendComponent(formula, state = {}) {
  const first = state.singleComponent || state.components?.[0] || normalizeSingleMaterial(formula.materiaPrimaUnica, formula);
  const isPork = first.corteId.includes('suino');
  return {
    id: uid('blend'),
    corteId: isPork ? 'toucinho_suino' : 'gordura_bovina',
    perfil: 'com_gordura',
    gramas: 0,
    gorduraCustom: ''
  };
}

function updateBlendComponent(formulaId, index, changes = {}, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  formula.blendComponentes = normalizeBlendComponents(formula.blendComponentes, formula);
  const component = formula.blendComponentes[index];
  if (!component) return;
  if (Object.prototype.hasOwnProperty.call(changes, 'corteId')) {
    component.corteId = MEAT_CUTS.some(cut => cut.id === changes.corteId) ? changes.corteId : 'outro';
    component.perfil = normalizeMeatProfile(component.perfil, component.corteId);
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'perfil')) component.perfil = normalizeMeatProfile(changes.perfil, component.corteId);
  if (Object.prototype.hasOwnProperty.call(changes, 'gramas')) component.gramas = Math.max(0, toNumber(changes.gramas));
  if (Object.prototype.hasOwnProperty.call(changes, 'gorduraCustom')) component.gorduraCustom = changes.gorduraCustom === '' ? '' : Math.max(0, Math.min(100, toNumber(changes.gorduraCustom)));
  formula.usarBlend = true;
  const total = formula.blendComponentes.reduce((sum, item) => sum + toNumber(item.gramas), 0);
  if (total > 0) setFormulaWeightFromBlendTotal(formula, total);
  saveInlineFormulaEdit('Blend atualizado.', options);
}

function addBlendComponent(formulaId) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  formula.blendComponentes = normalizeBlendComponents(formula.blendComponentes, formula);
  formula.blendComponentes.push({ id: uid('blend'), corteId: 'acem', perfil: 'sem_gordura', gramas: 0, gorduraCustom: '' });
  formula.usarBlend = true;
  saveInlineFormulaEdit('Componente adicionado.');
}

function removeBlendComponent(formulaId, index) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  formula.blendComponentes = normalizeBlendComponents(formula.blendComponentes, formula);
  if (formula.blendComponentes.length <= 1) return toast('O blend precisa manter ao menos um componente.');
  formula.blendComponentes.splice(index, 1);
  const total = formula.blendComponentes.reduce((sum, item) => sum + toNumber(item.gramas), 0);
  if (total > 0) setFormulaWeightFromBlendTotal(formula, total);
  saveInlineFormulaEdit('Componente removido.');
}

function updateSingleMaterial(formulaId, changes = {}, options = {}) {
  const formula = findFormula(formulaId);
  if (!formula || formula.bloqueada) return;
  formula.materiaPrimaUnica = normalizeSingleMaterial(formula.materiaPrimaUnica, formula);
  const component = formula.materiaPrimaUnica;
  if (Object.prototype.hasOwnProperty.call(changes, 'corteId')) {
    component.corteId = MEAT_CUTS.some(cut => cut.id === changes.corteId) ? changes.corteId : 'outro';
    component.perfil = normalizeMeatProfile(component.perfil, component.corteId);
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'perfil')) component.perfil = normalizeMeatProfile(changes.perfil, component.corteId);
  if (Object.prototype.hasOwnProperty.call(changes, 'gramas')) component.gramas = Math.max(1, toNumber(changes.gramas) || 1);
  if (Object.prototype.hasOwnProperty.call(changes, 'gorduraCustom')) component.gorduraCustom = changes.gorduraCustom === '' ? '' : Math.max(0, Math.min(100, toNumber(changes.gorduraCustom)));
  formula.usarBlend = false;
  setFormulaWeightFromBlendTotal(formula, component.gramas);
  saveInlineFormulaEdit('Matéria-prima atualizada.', options);
}

function queueInlineFormulaEdit(callback) {
  clearTimeout(inlineEditTimer);
  inlineEditTimer = setTimeout(callback, 650);
}

function saveInlineFormulaEdit(message, options = {}) {
  const currentSlide = $('#produtoWorkspace .product-slide.active')?.dataset.slidePanel;
  if (currentSlide) activeProductSlideId = currentSlide;
  saveDB();
  renderProdutos();
  if (currentSlide) $('#produtoWorkspace [data-product-slide="' + cssEscape(currentSlide) + '"]')?.click();
  if (!options.silent) toast(message);
}

function ensureFormulaItem(formula, insumoId) {
  formula.itens = Array.isArray(formula.itens) ? formula.itens : [];
  let item = formula.itens.find(row => row.insumoId === insumoId);
  if (!item) {
    item = { insumoId, percentual: 0 };
    formula.itens.push(item);
  }
  return item;
}

function formulaBlendSourceItems(formula, ingredients = db.insumos) {
  return (formula?.itens || []).filter(item => isMeatIngredient((ingredients || []).find(ingredient => ingredient.id === item.insumoId)));
}

function setFormulaWeightFromBlendTotal(formula, blendTotal) {
  const meatPct = formulaBlendSourceItems(formula).reduce((sum, item) => sum + toNumber(item.percentual), 0);
  if (formulaBaseMode(formula) === 'produto_final' && meatPct > 0 && meatPct < 100) {
    formula.pesoReferencia = Math.max(1, blendTotal / (meatPct / 100));
    return;
  }
  formula.pesoReferencia = Math.max(1, blendTotal);
}

function isBlendItem(insumoId, formula) {
  const item = (formula?.itens || []).find(row => row.insumoId === insumoId);
  return Boolean(item && isMeatIngredient(findIngredient(insumoId)));
}

function formulaBlendState(formula) {
  const useBlend = formula.usarBlend === true;
  const components = normalizeBlendComponents(formula.blendComponentes, formula).map(component => ({
    ...component,
    cut: MEAT_CUTS.find(cut => cut.id === component.corteId) || MEAT_CUTS[MEAT_CUTS.length - 1]
  }));
  const singleComponent = normalizeSingleMaterial(formula.materiaPrimaUnica, formula);
  const blendGrams = components.reduce((sum, item) => sum + toNumber(item.gramas), 0) || toNumber(formula.pesoReferencia);
  const fatGrams = components.reduce((sum, item) => sum + toNumber(item.gramas) * blendComponentFat(item) / 100, 0);
  const activeComponents = useBlend ? components : [singleComponent];
  const activeGrams = useBlend ? blendGrams : toNumber(singleComponent.gramas);
  const activeFatGrams = activeComponents.reduce((sum, item) => sum + toNumber(item.gramas) * blendComponentFat(item) / 100, 0);
  return {
    useBlend,
    components,
    singleComponent,
    blendGrams: activeGrams || toNumber(formula.pesoReferencia),
    fatGrams: activeFatGrams,
    fatPct: activeGrams ? activeFatGrams / activeGrams * 100 : 0
  };
}

function normalizeSingleMaterial(source, formula, ingredients = db.insumos) {
  if (source && typeof source === 'object') {
    const corteId = MEAT_CUTS.some(cut => cut.id === source.corteId) ? source.corteId : 'outro';
    return {
      id: source.id || uid('materia'),
      corteId,
      perfil: normalizeMeatProfile(source.perfil, corteId),
      gramas: Math.max(1, toNumber(source.gramas) || toNumber(formula?.pesoReferencia) || 1000),
      gorduraCustom: source.gorduraCustom === '' || source.gorduraCustom === undefined ? '' : Math.max(0, Math.min(100, toNumber(source.gorduraCustom)))
    };
  }
  const inferred = normalizeBlendComponents(formula?.blendComponentes, formula, ingredients)[0];
  return {
    id: uid('materia'),
    corteId: inferred?.corteId || 'acem',
    perfil: inferred?.perfil || normalizeMeatProfile('', inferred?.corteId || 'acem'),
    gramas: toNumber(formula?.pesoReferencia) || 1000,
    gorduraCustom: inferred?.gorduraCustom ?? ''
  };
}

function normalizeBlendComponents(source, formula, ingredients = db.insumos) {
  if (Array.isArray(source) && source.length) {
    return source.map(component => {
      const corteId = MEAT_CUTS.some(cut => cut.id === component.corteId) ? component.corteId : 'outro';
      return {
        id: component.id || uid('blend'),
        corteId,
        perfil: normalizeMeatProfile(component.perfil, corteId),
        gramas: Math.max(0, toNumber(component.gramas)),
        gorduraCustom: component.gorduraCustom === '' || component.gorduraCustom === undefined ? '' : Math.max(0, Math.min(100, toNumber(component.gorduraCustom)))
      };
    });
  }
  const inferred = formulaBlendSourceItems(formula, ingredients).map(item => {
    const ingredient = (ingredients || []).find(row => row.id === item.insumoId);
    const mapping = {
      ing_carne_bovina_magra: 'acem',
      ing_gordura_bovina: 'gordura_bovina',
      ing_pernil_suino: 'pernil_suino',
      ing_toucinho_suino: 'toucinho_suino'
    };
    return {
      id: uid('blend'),
      corteId: mapping[item.insumoId] || 'outro',
      perfil: normalizeMeatProfile('sem_gordura', mapping[item.insumoId] || 'outro'),
      gramas: formulaItemGrams(formula, item),
      gorduraCustom: mapping[item.insumoId] ? '' : toNumber(ingredient?.gordura)
    };
  });
  return inferred.length ? inferred : [{ id: uid('blend'), corteId: 'acem', perfil: 'sem_gordura', gramas: toNumber(formula?.pesoReferencia) || 1000, gorduraCustom: '' }];
}

function blendComponentFat(component) {
  if (component?.gorduraCustom !== '' && component?.gorduraCustom !== undefined) return Math.max(0, Math.min(100, toNumber(component.gorduraCustom)));
  const cut = MEAT_CUTS.find(item => item.id === component?.corteId) || MEAT_CUTS[MEAT_CUTS.length - 1];
  const profile = normalizeMeatProfile(component?.perfil, cut.id);
  return profile === 'com_gordura' ? toNumber(cut.comGordura) : toNumber(cut.semGordura);
}

function blendComponentSource(component) {
  const cut = MEAT_CUTS.find(item => item.id === component?.corteId) || MEAT_CUTS[MEAT_CUTS.length - 1];
  if (component?.gorduraCustom !== '' && component?.gorduraCustom !== undefined) return 'Teor de gordura ajustado pelo usuário para esta matéria-prima.';
  const profile = normalizeMeatProfile(component?.perfil, cut.id);
  return profile === 'com_gordura' ? cut.fonteCom : cut.fonteSem;
}

function normalizeMeatProfile(profile, cutId) {
  const cut = MEAT_CUTS.find(item => item.id === cutId) || MEAT_CUTS[MEAT_CUTS.length - 1];
  const migrated = profile === 'normal' ? 'com_gordura' : profile === 'magra' ? 'sem_gordura' : profile;
  if (migrated === 'com_gordura' && cut.comGordura !== null && cut.comGordura !== undefined) return 'com_gordura';
  if (migrated === 'sem_gordura' && cut.semGordura !== null && cut.semGordura !== undefined) return 'sem_gordura';
  if (cut.semGordura !== null && cut.semGordura !== undefined) return 'sem_gordura';
  return 'com_gordura';
}

function ingredientSuggestion(ingredient) {
  const name = String(ingredient?.nome || '').toLowerCase();
  const isSeasoning = ingredient?.tipo === 'condimento_especiaria';
  const isSaltOrSugar = ['ing_sal', 'ing_acucar'].includes(ingredient?.id) || /\bsal\b/.test(name) || name.includes('açúcar') || name.includes('acucar') || name.includes('dextrose');
  if (!ingredient || (!isSeasoning && !isSaltOrSugar)) return null;
  const byId = {
    ing_sal: { suave: 1.5, acentuado: 2 },
    ing_alho_po: { suave: 0.5, acentuado: 1.5 },
    ing_pimenta_reino: { suave: 0.1, acentuado: 0.4 },
    ing_pimenta_branca: { suave: 0.1, acentuado: 0.35 },
    ing_paprica_doce: { suave: 0.2, acentuado: 0.7 },
    ing_cebola_desidratada: { suave: 0.6, acentuado: 1.5 },
    ing_salsa_desidratada: { suave: 0.2, acentuado: 0.8 },
    ing_acucar: { suave: 0.2, acentuado: 0.8 }
  };
  if (byId[ingredient?.id]) return byId[ingredient.id];
  const byType = {
    basico_nao_carneo: { suave: 1.5, acentuado: 2 },
    condimento_especiaria: { suave: 0.3, acentuado: 1 }
  };
  return byType[ingredient?.tipo] || null;
}

function productCategories(product) {
  return normalizeCategoryIds(product).map(id => PRODUCT_CATEGORIES.find(category => category.id === id)).filter(Boolean);
}

function productCategory(product) {
  return productCategories(product)[0] || PRODUCT_CATEGORIES.find(category => category.produtos.includes(product?.id));
}

function productCategoryLabel(product) {
  const categories = productCategories(product);
  if (!categories.length) return 'Categoria não definida';
  return categories.map(category => theoryTitle(category.id)).join(' + ');
}

function theoryTitle(id) {
  return getTheoryContent(id)?.titulo || PRODUCT_CATEGORIES.find(category => category.id === id)?.titulo || 'Assunto teórico';
}

function normalizeCategoryIds(product, defaultProduct = null) {
  const ids = [];
  const add = (id) => {
    if (id && PRODUCT_CATEGORIES.some(category => category.id === id) && !ids.includes(id)) ids.push(id);
  };
  (Array.isArray(product?.categoriaIds) ? product.categoriaIds : []).forEach(add);
  add(product?.categoriaId);
  (Array.isArray(defaultProduct?.categoriaIds) ? defaultProduct.categoriaIds : []).forEach(add);
  add(defaultProduct?.categoriaId);
  inferProductCategoryIds(product).forEach(add);
  return ids;
}

function inferProductCategoryIds(product) {
  const ids = PRODUCT_CATEGORIES.filter(category => category.produtos.includes(product?.id)).map(category => category.id);
  if (product?.tipo === 'linguica_frescal') ids.push('embutidos');
  const categoryText = String(product?.categoria || '').toLowerCase();
  if (product?.tipo === 'hamburguer' || categoryText.includes('reestruturado')) ids.push('reestruturados');
  if (categoryText.includes('emulsionado')) ids.push('emulsionados');
  if (categoryText.includes('embutido')) ids.push('embutidos');
  return Array.from(new Set(ids));
}

function inferProductCategoryId(product) {
  return inferProductCategoryIds(product)[0] || '';
}

function defaultFormulaBase(product) {
  const categoryIds = normalizeCategoryIds(product);
  return categoryIds.includes('reestruturados') ? 'massa_carnea' : 'produto_final';
}

function formulaBaseMode(formula, product = findProduct(formula?.produtoId)) {
  return formula?.baseCalculo || defaultFormulaBase(product);
}

function formulaBaseLabel(mode) {
  return mode === 'massa_carnea' ? 'Massa cárnea/carne base' : 'Produto final';
}

function formulaItemGrams(formula, item) {
  return (toNumber(formula?.pesoReferencia) || 0) * toNumber(item?.percentual) / 100;
}

function timelineHTML(items) {
  return (items || []).map((item, index) => `<div class="timeline-step"><span>${index + 1}</span><p>${escapeHTML(item)}</p></div>`).join('');
}

function equipmentHTML(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '<div class="notice-card slim">Nenhum equipamento cadastrado para esta prática.</div>';
  return list.map((item, index) => `<button type="button" class="equipment-item" data-equipment-check="${index}"><span></span>${escapeHTML(item)}</button>`).join('');
}

function toggleEquipmentCheck(btn) {
  btn.classList.toggle('checked');
  const mark = btn.querySelector('span');
  if (mark) mark.textContent = btn.classList.contains('checked') ? '✓' : '';
}

function analyzeFormula(formula) {
  const product = findProduct(formula.produtoId);
  const baseMode = formulaBaseMode(formula, product);
  const weight = toNumber(formula.pesoReferencia) || 1000;
  let totalPct = 0;
  let meatBasePct = 0;
  let finalWeight = 0;
  let fatGrams = 0;
  let proteinGrams = 0;
  let carbGrams = 0;
  let pncGrams = 0;
  let costTotal = 0;
  const blendState = formulaBlendState(formula);
  const useDetailedBlend = (blendState.useBlend ? blendState.components.length : Boolean(blendState.singleComponent));
  formula.itens.forEach(item => {
    const ing = findIngredient(item.insumoId);
    const pct = toNumber(item.percentual);
    if (!ing) return;
    const grams = formulaItemGrams(formula, item);
    totalPct += pct;
    if (isMeatIngredient(ing)) meatBasePct += pct;
    finalWeight += grams;
    if (!(useDetailedBlend && isMeatIngredient(ing))) fatGrams += grams * toNumber(ing.gordura) / 100;
    proteinGrams += grams * toNumber(ing.proteina) / 100;
    carbGrams += grams * toNumber(ing.carboidrato) / 100;
    if (ing.proteinaNaoCarnea || isFunctionalProtein(ing)) pncGrams += grams;
    costTotal += (grams / 1000) * toNumber(ing.custo);
  });
  if (useDetailedBlend) fatGrams += blendState.fatGrams;
  const compositionWeight = finalWeight || weight;
  const fatPct = compositionWeight ? fatGrams / compositionWeight * 100 : 0;
  const proteinPct = compositionWeight ? proteinGrams / compositionWeight * 100 : 0;
  const carbPct = compositionWeight ? carbGrams / compositionWeight * 100 : 0;
  const pncPct = compositionWeight ? pncGrams / compositionWeight * 100 : 0;
  const alerts = [];
  const params = product?.parametros || {};
  if (product && params.mostrarValidacao !== false) {
    addLimitAlert(alerts, fatPct, params.gorduraMax, 'Gordura', 'max');
    addLimitAlert(alerts, proteinPct, params.proteinaMin, 'Proteína estimada', 'min');
    addLimitAlert(alerts, carbPct, params.carbMax, 'Carboidratos estimados', 'max');
    const pncLabel = product.tipo === 'linguica_frescal' ? 'Proteína agregada' : 'Proteína não cárnea agregada';
    if (params.proibeProteinaNaoCarnea && pncPct > 0) alerts.push({ type: 'danger', text: `${pncLabel}: há ingrediente marcado como proteína agregada, mas o produto não permite esse uso.` });
    else addLimitAlert(alerts, pncPct, params.proteinaNaoCarneaMax, pncLabel, 'max');
  }
  return { product, baseMode, baseLabel: formulaBaseLabel(baseMode), weight, totalPct, meatBasePct, finalWeight, fatPct, proteinPct, carbPct, pncPct, costTotal, alerts };
}

function addLimitAlert(alerts, value, limit, label, mode) {
  if (limit === '' || limit === null || limit === undefined || Number.isNaN(Number(limit))) return;
  const ok = mode === 'max' ? value <= Number(limit) + 0.0001 : value + 0.0001 >= Number(limit);
  alerts.push({ type: ok ? 'ok' : 'danger', text: `${label}: ${fmt(value)}% ${ok ? 'dentro do parâmetro' : 'fora do parâmetro'} (${mode === 'max' ? 'limite máximo' : 'limite mínimo'} ${fmt(limit)}%).` });
}

function analysisHTML(a) {
  const importantAlerts = a.alerts.filter(alert => alert.type !== 'ok');
  return `<div class="analysis-grid">
    <div class="analysis-metric"><strong>${fmt(a.finalWeight)} g</strong><span>Massa final estimada</span></div>
    <div class="analysis-metric"><strong>${fmt(a.fatPct)}%</strong><span>Gordura estimada</span></div>
    <div class="analysis-metric"><strong>${fmt(a.proteinPct)}%</strong><span>Proteína estimada</span></div>
    <div class="analysis-metric"><strong>${fmt(a.carbPct)}%</strong><span>Carboidratos estimados</span></div>
    <div class="analysis-metric"><strong>${fmt(a.pncPct)}%</strong><span>Prot. agregada</span></div>
    <div class="analysis-metric"><strong>${money(a.costTotal)}</strong><span>Custo estimado do lote</span></div>
  </div>
  ${importantAlerts.length ? `<div class="alert-list">${importantAlerts.map(alert => `<div class="alert ${alert.type}">${escapeHTML(alert.text)}</div>`).join('')}</div>` : ''}`;
}

function showFormulaReport(formulaId = null) {
  const formula = formulaId ? findFormula(formulaId) : getFormulaFromModal(false);
  if (!formula) return toast('Formulação não encontrada.');
  $('#relatorioTexto').value = buildReport(formula);
  openModal('modalRelatorio');
}

function buildReport(formula) {
  const product = findProduct(formula.produtoId);
  const analysis = analyzeFormula(formula);
  const lines = [];
  lines.push('RELATÓRIO DA AULA PRÁTICA - PROCESSAMENTO DE ALIMENTOS DE ORIGEM ANIMAL');
  lines.push('');
  lines.push(`Produto: ${product?.nome || 'Não informado'}`);
  lines.push(`Formulação: ${formula.nome}`);
  lines.push(`Base de cálculo: ${analysis.baseLabel}`);
  lines.push(`Peso base: ${fmt(formula.pesoReferencia)} g`);
  lines.push(`Massa final estimada: ${fmt(analysis.finalWeight)} g`);
  if (formula.rendimento !== '') lines.push(`Rendimento esperado: ${fmt(formula.rendimento)}%`);
  lines.push('');
  const blend = formulaBlendState(formula);
  if (blend.useBlend && blend.components.length) {
    lines.push('Blend de matérias-primas:');
    blend.components.forEach(component => {
      lines.push(`- ${component.cut.nome} (${component.perfil === 'com_gordura' ? 'com gordura' : 'sem gordura'}): ${fmt(component.gramas)} g, gordura de referência ${fmt(blendComponentFat(component))}%`);
    });
    lines.push(`- Gordura estimada do blend: ${fmt(blend.fatPct)}%`);
    lines.push('');
  } else if (blend.singleComponent) {
    const cut = MEAT_CUTS.find(item => item.id === blend.singleComponent.corteId);
    lines.push(`Matéria-prima cárnea: ${cut?.nome || 'Não informada'} (${blend.singleComponent.perfil === 'com_gordura' ? 'com gordura' : 'sem gordura'}), ${fmt(blend.singleComponent.gramas)} g`);
    lines.push('');
  }
  lines.push('Formulação:');
  formula.itens.forEach(item => {
    const ing = findIngredient(item.insumoId);
    const grams = formulaItemGrams(formula, item);
    lines.push(`- ${ing?.nome || 'Insumo'}: ${fmt(item.percentual)}% = ${fmt(grams)} g`);
  });
  lines.push('');
  lines.push('Resumo técnico estimado:');
  lines.push(`- Gordura estimada: ${fmt(analysis.fatPct)}%`);
  lines.push(`- Proteína estimada: ${fmt(analysis.proteinPct)}%`);
  lines.push(`- Carboidratos estimados: ${fmt(analysis.carbPct)}%`);
  lines.push(`- Proteína agregada: ${fmt(analysis.pncPct)}%`);
  lines.push(`- Custo estimado do lote: ${money(analysis.costTotal)}`);
  lines.push('');
  lines.push('Alertas:');
  analysis.alerts.forEach(a => lines.push(`- ${a.text}`));
  if (formula.observacoes) {
    lines.push('');
    lines.push('Observações:');
    lines.push(formula.observacoes);
  }
  lines.push('');
  lines.push('Roteiro da prática:');
  (product?.fluxo || []).forEach((step, idx) => lines.push(`${idx + 1}. ${step}`));
  lines.push('');
  lines.push('Perguntas para discussão:');
  (product?.perguntas || []).forEach(q => lines.push(`- ${q}`));
  return lines.join('\n');
}

async function copyReport() {
  await copyText($('#relatorioTexto').value);
  toast('Relatório copiado.');
}

async function copyLesson() {
  const p = findProduct(activeProductId || db.configs.ultimoProdutoAula || db.produtos[0]?.id);
  if (!p) return;
  const text = [
    `ROTEIRO DE AULA PRÁTICA - ${p.nome}`,
    '',
    `Objetivo: ${p.objetivo || ''}`,
    '',
    'Fluxograma:',
    ...(p.fluxo || []).map((s, i) => `${i + 1}. ${s}`),
    '',
    'Pontos de controle:',
    ...(p.pontos || []).map(s => `- ${s}`),
    '',
    'Perguntas:',
    ...(p.perguntas || []).map(s => `- ${s}`)
  ].join('\n');
  await copyText(text);
  toast('Roteiro copiado.');
}

function exportData() {
  downloadJSON(db, `paoa_lab_backup_${dateStamp()}.json`);
  toast('Backup gerado.');
}

function downloadTemplate() {
  downloadJSON(DEFAULT_DB, 'paoa_lab_modelo_dados.json');
}

async function importData(ev) {
  const file = ev.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!imported.produtos || !imported.insumos) throw new Error('Arquivo inválido');
    db = normalizeDB(imported);
    saveDB();
    renderAll();
    closeModal('modalConfig');
    toast('Dados importados.');
  } catch (err) {
    console.error(err);
    toast('Não foi possível importar esse arquivo.');
  } finally {
    ev.target.value = '';
  }
}

function resetDemo() {
  if (!confirm('Restaurar a base demonstrativa? Seus dados atuais serão substituídos neste navegador.')) return;
  db = normalizeDB(clone(DEFAULT_DB));
  saveDB();
  renderAll();
  closeModal('modalConfig');
  toast('Base demonstrativa restaurada.');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => console.warn('Service worker não registrado', err));
  }
}

function openModal(id) {
  const modal = $('#' + id);
  if (!modal) return;
  modal.style.zIndex = String(++modalZIndex);
  modal.classList.add('show');
  modal.scrollTop = 0;
  const panel = modal.querySelector('.modal');
  if (panel) panel.scrollTop = 0;
  requestAnimationFrame(() => {
    modal.scrollTop = 0;
    if (panel) panel.scrollTop = 0;
  });
}
function closeModal(id) { $('#' + id)?.classList.remove('show'); }
function openConfirmation({ title = 'Confirmar ação', message = '', confirmLabel = 'Confirmar', action } = {}) {
  pendingConfirmationAction = typeof action === 'function' ? action : null;
  $('#confirmacaoTitulo').textContent = title;
  $('#confirmacaoMensagem').textContent = message;
  $('#btnConfirmarAcao').textContent = confirmLabel;
  openModal('modalConfirmacao');
}
function closeConfirmation() {
  pendingConfirmationAction = null;
  closeModal('modalConfirmacao');
}
function confirmPendingAction() {
  const action = pendingConfirmationAction;
  pendingConfirmationAction = null;
  closeModal('modalConfirmacao');
  action?.();
}
function findProduct(id) { return db.produtos.find(p => p.id === id); }
function findIngredient(id) { return db.insumos.find(i => i.id === id); }
function findFormula(id) { return db.formulacoes.find(f => f.id === id); }
function toNumber(value) { const n = Number(String(value ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; }
function numberOrBlank(value) { if (String(value ?? '').trim() === '') return ''; return toNumber(value); }
function fmt(n) { return toNumber(n).toLocaleString('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(toNumber(n)) ? 0 : 1 }); }
function fmtInput(n) {
  const value = Math.round(toNumber(n) * 100) / 100;
  return Number.isInteger(value) ? String(value) : String(value).replace(',', '.');
}
function money(n) { return toNumber(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function linesFrom(text) { return Array.isArray(text) ? text : String(text || '').split('\n').map(s => s.trim()).filter(Boolean); }
function multiSelectValues(select) { return Array.from(select?.selectedOptions || []).map(option => option.value).filter(Boolean); }
function setMultiSelectValues(select, values) {
  const wanted = new Set(values || []);
  Array.from(select?.options || []).forEach(option => { option.selected = wanted.has(option.value); });
}
function cssEscape(value) { return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, '\\$&'); }
function uid(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function capitalize(text) { return String(text || '').charAt(0).toUpperCase() + String(text || '').slice(1); }
function capitalizeFirst(text) { return capitalize(String(text || '').trim()); }
function ingredientSubtypes(type) { return TYPES.find(t => t.value === type)?.subtipos || []; }
function normalizeIngredientType(ingredient = {}) {
  const id = ingredient.id || '';
  const text = [ingredient.nome, ingredient.categoria, ingredient.tipo].join(' ').toLowerCase();
  if (id === 'ing_tripa_suina' || text.includes('tripa') || text.includes('envoltório') || text.includes('embalagem')) return 'envoltorio_apresentacao';
  if (id === 'ing_fosfato' || text.includes('nitrito') || text.includes('nitrato') || text.includes('fosfato') || text.includes('eritorbato')) return 'aditivo_alimentar';
  if (id === 'ing_agua_gelada' || id === 'ing_sal' || id === 'ing_acucar' || text.includes('água') || text.includes('gelo') || /\bsal\b/.test(text) || text.includes('açúcar') || text.includes('acucar') || text.includes('dextrose')) return 'basico_nao_carneo';
  if (id.includes('carne') || id.includes('gordura') || id.includes('pernil') || id.includes('toucinho') || id.includes('figado') || id.includes('fígado') || text.includes('matéria-prima cárnea') || text.includes('gordura animal')) return 'materia_prima_carnea';
  if (text.includes('condimento') || text.includes('pimenta') || text.includes('alho') || text.includes('cebola') || text.includes('páprica') || text.includes('salsa')) return 'condimento_especiaria';
  if (text.includes('cultura') || text.includes('fermento')) return 'cultura_fermento';
  if (text.includes('mix') || text.includes('mistura') || text.includes('preparado')) return 'mistura_comercial';
  return LEGACY_TYPE_MAP[ingredient.tipo] || (TYPES.some(t => t.value === ingredient.tipo) ? ingredient.tipo : 'funcional_nao_aditivo');
}
function normalizeIngredientSubtype(ingredient = {}) {
  const type = normalizeIngredientType(ingredient);
  const existing = ingredient.subtipo;
  if (existing && ingredientSubtypes(type).includes(existing)) return existing;
  const text = [ingredient.nome, ingredient.categoria, ingredient.tipo].join(' ').toLowerCase();
  if (type === 'condimento_especiaria') {
    if (ingredient.id === 'ing_pimenta_reino' || ingredient.id === 'ing_pimenta_branca' || text.includes('moíd') || text.includes('moid')) return 'moídos';
    if (text.includes('pó') || text.includes('po')) return 'em pó';
    if (text.includes('desidrat')) return 'desidratados';
    if (text.includes('fresc')) return 'frescos';
  }
  if (type === 'funcional_nao_aditivo') {
    if (text.includes('proteína') || text.includes('proteina')) return 'proteínas';
    if (text.includes('amido') || text.includes('farinha') || text.includes('fécula') || text.includes('fecula')) return 'amidos/farinhas';
    if (text.includes('leite') || text.includes('lácteo') || text.includes('lacteo')) return 'lácteos';
    if (text.includes('ovo')) return 'ovos';
  }
  if (type === 'envoltorio_apresentacao') {
    if (text.includes('tripa') || text.includes('comestível') || text.includes('comestivel')) return 'envoltório comestível';
    if (text.includes('embalagem')) return 'embalagem';
  }
  return '';
}
function isMeatIngredient(ingredient) { return normalizeIngredientType(ingredient || {}) === 'materia_prima_carnea'; }
function isFunctionalProtein(ingredient = {}) {
  const type = normalizeIngredientType(ingredient);
  const subtype = ingredient.subtipo || normalizeIngredientSubtype(ingredient);
  return type === 'funcional_nao_aditivo' && subtype === 'proteínas';
}
function typeLabel(value) { return TYPES.find(t => t.value === value)?.label || 'Outro'; }
function inferProductTypeFromName(name = '') {
  const text = String(name).toLowerCase();
  if (text.includes('hamb')) return 'hamburguer';
  if (text.includes('lingui')) return 'linguica_frescal';
  return 'geral';
}
function productTypeLabel(value) {
  return ({ hamburguer: 'RTIQ hambúrguer', linguica_frescal: 'RTIQ linguiça frescal', geral: 'Produto geral' })[value] || 'Produto geral';
}
function ingredientIcon(type) {
  return ({ materia_prima_carnea: 'MP', basico_nao_carneo: 'B', condimento_especiaria: 'CE', funcional_nao_aditivo: 'FN', aditivo_alimentar: 'AD', coadjuvante_tecnologia: 'CT', cultura_fermento: 'CF', envoltorio_apresentacao: 'EA', mistura_comercial: 'MC' })[type] || 'IN';
}
function photoOrInitial(p) {
  return p.fotos?.[0] ? `<img src="${escapeAttr(p.fotos[0])}" alt="${escapeAttr(p.nome)}">` : escapeHTML((p.nome || '?').slice(0, 1).toUpperCase());
}
function emptyHTML(text) { return `<div class="notice-card">${escapeHTML(text)}</div>`; }
function orderedList(items) { return `<ol class="lesson-list">${(items || []).map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ol>`; }
function unorderedList(items) { return `<ul class="lesson-list">${(items || []).map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>`; }
function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function escapeHTML(str) { return String(str ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
function escapeAttr(str) { return escapeHTML(str); }
function limitBadge(value, limit, mode) {
  if (limit === '' || limit === null || limit === undefined || Number.isNaN(Number(limit))) return 'info';
  return mode === 'max' ? (value <= Number(limit) + 0.0001 ? 'ok' : 'danger') : (value + 0.0001 >= Number(limit) ? 'ok' : 'danger');
}
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
}
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area = document.createElement('textarea');
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function fileToDataURL(file, maxSize = 1200, quality = 0.86) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
