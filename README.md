# Processamento de Alimentos de Origem Animal

App didático em formato PWA para a disciplina **Processamento de Alimentos de Origem Animal**.

## O que o app faz

- Organiza a página inicial como um sumário visual de produtos.
- Cadastra produtos, roteiros de aula, fluxogramas, pontos de controle e perguntas de discussão.
- Mantém produtos e insumos protegidos dentro de Configurações.
- Organiza os insumos por categoria principal e subdivisão.
- Inclui cronograma de aulas no menu principal.
- Permite criar e arquivar períodos, definir datas e vincular produtos e teoria a cada aula.
- Exibe as aulas teóricas por encontro e aceita conteúdo em texto ou imagens de slides.
- Monta formulações em porcentagem e calcula automaticamente os gramas para qualquer peso de lote.
- Diferencia percentuais sobre massa cárnea/carne base e percentuais sobre 100% do produto final.
- Permite abrir um produto como um roteiro em slides, com sumário interno e edição das formulações no painel.
- Traz conteúdo teórico conectado ao cronograma, com links internos para roteiros e insumos citados.
- Monta blends com vários cortes ou matérias-primas, peso individual e estimativa de gordura baseada em referências de composição.
- Estima gordura, proteína, carboidratos, proteína agregada e custo do lote.
- Exibe alertas técnicos com base nos parâmetros cadastrados para cada produto.
- Guarda uma ou mais fotos por produto.
- Exporta e importa a base em JSON.
- Funciona como PWA instalável e pode ser publicado no GitHub Pages.

## Base demonstrativa

A base inicial inclui:

- Hambúrguer bovino com formulação base sobre massa cárnea e referência ao RTIQ da Portaria SDA/MAPA nº 724/2022.
- Kafta bovina e almôndega bovina como roteiros demonstrativos de produtos reestruturados.
- Linguiça frescal suína com formulação base, foto demonstrativa, roteiro de aula, limites de gordura/proteína e referência ao RTIQ da IN SDA/MAPA nº 4/2000.
- Patê cárneo e salsicha como roteiros demonstrativos de produtos emulsionados.
- Referências gerais para RIISPOA e rotulagem nutricional Anvisa.

## Como usar localmente

Abra `index.html` em um navegador moderno ou use um servidor local para testar como PWA/offline:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

Neste workspace, o servidor de teste foi iniciado em:

```text
http://127.0.0.1:8767/?v=28
```

## Arquivos principais

- `index.html`: estrutura das telas e modais.
- `style.css`: layout institucional e responsivo.
- `app.js`: lógica de cadastro, cálculo, validação, backup e relatórios.
- `assets/`: fotos demonstrativas usadas nos cards de produto.
- `manifest.json`: configuração do PWA.
- `service-worker.js`: cache offline básico.
- `icon.png`: ícone do app.

## Observação sobre legislação

A base legal incluída é didática. Antes de usar as informações em documentos oficiais, processos de registro, inspeção ou rotulagem real, consulte sempre a norma vigente diretamente no órgão competente.
