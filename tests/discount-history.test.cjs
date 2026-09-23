const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadApp() {
  const elements = new Map();
  const storage = new Map();
  let nextId = 0;
  const document = {
    addEventListener() {},
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { value: '', checked: false, innerHTML: '', innerText: '', style: {}, addEventListener() {} });
      return elements.get(id);
    },
    querySelector() { return { addEventListener() {} }; }
  };
  const crypto = { randomUUID: () => String(++nextId) };
  const context = vm.createContext({
    document,
    window: { crypto, addEventListener() {} },
    crypto,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    console,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
  return { context, elements, run: code => vm.runInContext(code, context) };
}

function contributor(name, discount, history = []) {
  return {
    id: name,
    nome: name,
    desconto: discount,
    historicoDescontoBase: history,
    carros: [{ id: `car_${name}`, placa: 'ABC1234', ativo: true, valor: '100,00', dataCadastro: '2026-05-01' }],
    pagamentos: []
  };
}

test('discount changes preserve the previous months and do not duplicate unchanged values', () => {
  const app = loadApp();
  app.context.previous = contributor('Isento', '100,00');
  const change = app.run("atualizarHistoricoDescontoBase(previous, 50, '2026-09-22')");
  assert.equal(change.alterou, true);
  assert.equal(change.historico.length, 2);
  assert.equal(change.historico[0].origem, 'legado');
  assert.equal(change.historico[1].vigencia, '2026-09-22');
  assert.equal(app.context.previous.historicoDescontoBase.length, 0);

  app.context.changed = contributor('Isento', '50,00', change.historico);
  assert.equal(app.run("calcularValorEsperado(changed, '2026-08')"), 0);
  assert.equal(app.run("calcularValorEsperado(changed, '2026-09')"), 50);
  const same = app.run("atualizarHistoricoDescontoBase(changed, 50, '2026-09-23')");
  assert.equal(same.alterou, false);
  assert.equal(same.historico.length, 2);
});

test('manual list hides zero value from August regardless of paid filter, and shows later charges', () => {
  const app = loadApp();
  app.context.fixture = [
    contributor('Isento', '50,00', [
      { id: 'baseline', vigencia: '2026-05-01', valor: 100, registradoEm: 1 },
      { id: 'sep', vigencia: '2026-09-22', valor: 50, registradoEm: 2 }
    ]),
    contributor('Cobrado', '20,00')
  ];
  app.run('db.contribuintes = fixture');
  const start = app.elements.get('relManualIni') || app.context.document.getElementById('relManualIni');
  const end = app.context.document.getElementById('relManualFim');
  const hidden = app.context.document.getElementById('relManualOcultarAdimplentes');
  const report = app.context.document.getElementById('printRelatorioManual');

  start.value = end.value = '2026-08';
  app.run('gerarRelatorioManual()');
  assert.doesNotMatch(report.innerHTML, /Isento/);
  assert.match(report.innerHTML, /Cobrado/);
  hidden.checked = true;
  app.run('gerarRelatorioManual()');
  assert.doesNotMatch(report.innerHTML, /Isento/);

  hidden.checked = false;
  start.value = end.value = '2026-09';
  app.run('gerarRelatorioManual()');
  assert.match(report.innerHTML, /Isento/);
  assert.match(report.innerHTML, /R\$ 50,00/);

  start.value = '2026-08';
  app.run('gerarRelatorioManual()');
  assert.match(report.innerHTML, /Isento/);

  app.context.fixture[0].pagamentos.push({ mesAno: '2026-09', parcial: false });
  hidden.checked = true;
  app.run('gerarRelatorioManual()');
  assert.doesNotMatch(report.innerHTML, /Isento/);
  hidden.checked = false;

  app.context.fixture[0].historicoDescontoBase.push({ id: 'oct', vigencia: '2026-10-03', valor: 100, registradoEm: 3 });
  start.value = end.value = '2026-10';
  app.run('gerarRelatorioManual()');
  assert.doesNotMatch(report.innerHTML, /Isento/);
  start.value = end.value = '2026-07';
  app.run('gerarRelatorioManual()');
  assert.match(report.innerHTML, /Isento/);
});

test('an edit made during sync keeps the server history and the new local event', () => {
  const app = loadApp();
  const baseline = { id: 'base', vigencia: '2026-05-01', valor: 100, registradoEm: 1 };
  const server = contributor('Isento', '50,00', [baseline, { id: 'sep1', vigencia: '2026-09-01', valor: 50, registradoEm: 2 }]);
  const local = contributor('Isento', '20,00', [baseline, { id: 'sep22', vigencia: '2026-09-22', valor: 20, registradoEm: 3 }]);
  local._clientDirty = true;
  local._clientChangedAt = 200;
  app.context.serverCopy = app.run('criarBancoBase()');
  app.context.localCopy = app.run('criarBancoBase()');
  app.context.serverCopy.contribuintes = [server];
  app.context.localCopy.contribuintes = [local];
  const merged = app.run('reaplicarMudancasLocaisRecentes(serverCopy, localCopy, 100).contribuintes[0]');
  assert.equal(merged.historicoDescontoBase.length, 3);
  assert.equal(merged.desconto, '20,00');
  app.context.mergedContributor = merged;
  assert.equal(app.run("calcularValorEsperado(mergedContributor, '2026-08')"), 0);
  assert.equal(app.run("calcularValorEsperado(mergedContributor, '2026-09')"), 80);
});

test('server merge keeps discount history when another device has an older contributor', { skip: !fs.existsSync(path.join(root, 'google-apps-script', 'Code.gs')) }, () => {
  const context = vm.createContext({ Utilities: { formatDate: () => '2026-09-22' } });
  vm.runInContext(fs.readFileSync(path.join(root, 'google-apps-script', 'Code.gs'), 'utf8'), context);
  const old = contributor('Atual', '50,00', [
    { id: 'base', vigencia: '2026-05-01', valor: 100, _serverSeq: 1 },
    { id: 'first', vigencia: '2026-09-01', valor: 50, _serverSeq: 20 }
  ]);
  old.id = 'contributor_1';
  old._serverSeq = 20;
  const stale = { ...old, nome: 'Desatualizado', desconto: '20,00', _clientDirty: true, _serverSeq: 10,
    historicoDescontoBase: [...old.historicoDescontoBase, { id: 'second', vigencia: '2026-09-22', valor: 20, registradoEm: 100 }]
  };
  const deleted = { carros: {}, pagamentos: {}, contribuintes: {} };
  context.current = [old];
  context.incoming = [stale];
  context.deleted = deleted;
  const merged = vm.runInContext('mergeContribuintes_(current, incoming, deleted, 21, 200, 10)[0]', context);
  assert.equal(merged.nome, 'Atual');
  assert.equal(merged.desconto, '20,00');
  assert.equal(merged.valorTotal, '80,00');
  assert.equal(merged.historicoDescontoBase.length, 3);
  assert.equal(merged.carros.length, 1);

  const legacy = { ...merged, desconto: '20,00', historicoDescontoBase: undefined, _clientDirty: true };
  context.current = [merged];
  context.incoming = [legacy];
  const preserved = vm.runInContext('mergeContribuintes_(current, incoming, deleted, 22, 300, 21)[0]', context);
  assert.equal(preserved.historicoDescontoBase.length, 3);
});
