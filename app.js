const APP_VERSION = "v1.0.40";
const SYNC_PULL_INTERVAL_MS = 30000;
const COBRANCA_INICIO_MES = "2026-05";
const AUDITORIA_RETENCAO_DIAS = 15;
const DIA_VENCIMENTO_PADRAO = 30;

try {
            let s = localStorage.getItem('cooptrans_v1');
            if(s) {
                let parsed = JSON.parse(s);
                if(parsed && parsed.cooperativa && parsed.cooperativa.logo) {
                    let img = document.getElementById('splashLogoObj');
                    img.src = parsed.cooperativa.logo;
                    img.style.display = 'block';
                }
            }
        } catch(e){}

function toggleDiv(id) { let el = document.getElementById(id); el.style.display = (el.style.display === 'none') ? 'block' : 'none'; }
    function converterLogo(input) { if (input.files && input.files[0]) { let reader = new FileReader(); reader.onload = function(e) { document.getElementById('coopLogoBase64').value = e.target.result; document.getElementById('previewLogo').innerHTML = `<img src="${e.target.result}" style="max-height:50px;">`; }; reader.readAsDataURL(input.files[0]); } }
    
    // MÁSCARAS
    function maskCNPJ(el) { let v = el.value.replace(/\D/g, ""); if (v.length > 14) v = v.substring(0, 14); v = v.replace(/^(\d{2})(\d)/, "$1.$2"); v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); v = v.replace(/\.(\d{3})(\d)/, ".$1/$2"); v = v.replace(/(\d{4})(\d)/, "$1-$2"); el.value = v; }
    function maskTelefone(el) { let v = el.value.replace(/\D/g,""); if (v.length > 11) v = v.substring(0, 11); v = v.replace(/^(\d{2})(\d)/g,"($1) $2"); v = v.replace(/(\d{5})(\d{4})$/,"$1-$2"); el.value = v; }
    function formatMoedaInput(val) { return formatMoeda(val); }
    function maskMoeda(el) { let v = el.value.replace(/\D/g, ""); if(!v) { el.value = ""; return; } el.value = (parseFloat(v) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2}); }
    function parseMoeda(str) { if(!str) return 0; let v = String(str).replace(/\s/g, '').replace(/R\$/gi, ''); if(v.includes(',') && v.includes('.')) v = v.replace(/\./g, '').replace(',', '.'); else if(v.includes(',')) v = v.replace(',', '.'); else if(v.includes('.')) { let partes = v.split('.'); if(partes.length > 2 || partes[partes.length - 1].length === 3) v = v.replace(/\./g, ''); } let n = parseFloat(v.replace(/[^\d.-]/g, '')); return isNaN(n) ? 0 : n; }
    function formatMoeda(val) { return parseFloat(val).toLocaleString('pt-BR', {minimumFractionDigits: 2}); }
    function maskPercentual(el) { let v = el.value.replace(/[^\d,\.]/g, "").replace(".", ","); let partes = v.split(","); if(partes.length > 2) v = partes[0] + "," + partes.slice(1).join(""); el.value = v; }
    function parsePercentual(str) { let n = parseFloat(String(str || '').replace(",", ".")); if(isNaN(n)) return 0; return Math.max(0, Math.min(100, n)); }
    function formatPercentual(val) { return parseFloat(val || 0).toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 2}); }
    function formatDataBR(dataStr) { if(!dataStr) return ""; const partes = dataStr.split('-'); if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`; return dataStr; }
    function escapeHTML(valor) { return String(valor ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
    function getHojeSTR() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    function getPastMonthStr() { let d = new Date(); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
    function getMesAtualSTR() { return getHojeSTR().substring(0,7); }
    function getExtensoMes(mesNum) { const m = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]; return m[parseInt(mesNum)-1] || ""; }
    function getAbrevMes(mesNum) { const m = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; return m[parseInt(mesNum)-1] || ""; }
    function gerarIdLocal(prefixo = 'id') {
        if(window.crypto && crypto.randomUUID) return `${prefixo}_${crypto.randomUUID()}`;
        return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    function getClientIdLocal() {
        let id = localStorage.getItem('cooptrans_client_id');
        if(!id) {
            id = gerarIdLocal('client');
            localStorage.setItem('cooptrans_client_id', id);
        }
        return id;
    }
    function getUsuarioAuditoria() {
        return adminLogado && adminLogado.nome ? adminLogado.nome : 'Sistema';
    }
    function isDataISOValida(valor) {
        if(!valor) return true;
        if(!/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) return false;
        const [ano, mes, dia] = String(valor).split('-').map(Number);
        if(ano < 2000 || ano > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
        const d = new Date(`${valor}T00:00:00`);
        return d.getFullYear() === ano && d.getMonth() + 1 === mes && d.getDate() === dia;
    }
    function validarDataCampo(id, nome, obrigatoria = false) {
        const el = document.getElementById(id);
        const valor = el ? el.value : '';
        if(!valor && !obrigatoria) return true;
        if(!valor && obrigatoria) {
            alert(`Informe a data de ${nome}.`);
            if(el) el.focus();
            return false;
        }
        if(!isDataISOValida(valor)) {
            alert(`A data de ${nome} está inválida. Use uma data real entre 2000 e 2100.`);
            if(el) el.focus();
            return false;
        }
        return true;
    }
    function getMesCadastroCobranca(car) {
        if(!car || !car.dataCadastro || !isDataISOValida(car.dataCadastro)) return COBRANCA_INICIO_MES;
        let cadMonth = car.dataCadastro.substring(0, 7);
        return cadMonth < COBRANCA_INICIO_MES ? COBRANCA_INICIO_MES : cadMonth;
    }
    function normalizarDiaVencimento(valor) {
        let dia = parseInt(valor, 10);
        if(isNaN(dia)) dia = DIA_VENCIMENTO_PADRAO;
        return Math.min(31, Math.max(1, dia));
    }
    function getDiaVencimento(c) {
        return normalizarDiaVencimento(c && c.diaVencimento);
    }
    function getUltimoDiaMes(mesRef) {
        const [ano, mes] = String(mesRef || getMesAtualSTR()).split('-').map(Number);
        return new Date(ano, mes, 0).getDate();
    }
    function getDiaVencimentoEfetivo(c, mesRef) {
        return Math.min(getDiaVencimento(c), getUltimoDiaMes(mesRef));
    }
    function getDataVencimentoMes(c, mesRef) {
        const dia = getDiaVencimentoEfetivo(c, mesRef);
        return `${mesRef}-${String(dia).padStart(2, '0')}`;
    }
    function isDataVencida(c, mesRef) {
        return getHojeSTR() > getDataVencimentoMes(c, mesRef);
    }
    function getLabelDiaVencimento(c, mesRef) {
        return `dia ${String(getDiaVencimentoEfetivo(c, mesRef)).padStart(2, '0')}`;
    }
    function getMesesIntervalo(inicio, fim) {
        if(!inicio || !fim) return [];
        if(fim < inicio) fim = inicio;
        let meses = [];
        let curr = new Date(`${inicio}-01T00:00:00`);
        let end = new Date(`${fim}-01T00:00:00`);
        while(curr <= end) {
            meses.push(`${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`);
            curr.setMonth(curr.getMonth() + 1);
        }
        return meses;
    }

    // DADOS BASE E TEMA
    let db = carregarBanco(); 
    let isSyncingFundo = false;
    let tempCategorias = [];
    let tempTelefones = [];
    let tempCarros = [];
    let tempCarrosExcluidos = [];
    let tempPixCoop = [];
    let filtroViewAtual = 'todos'; 
    let chartArrecadacao = null;
    let chartInadimplencia = null;
    let syncTimer = null;
    let syncPendente = false;
    let pagamentoMenorPendente = null;
    let adminLogado = null;

    function criarBancoBase() {
        return {
            app_id: "cooptrans",
            cooperativa: { logo: "", razao: "", fantasia: "", cnpj: "", pixList: [] },
            categorias: [], 
            contribuintes: [], 
            administradores: [],
            auditoria: [],
            configGerais: { 
                corTema: "#008C4A",
                corSubHeader: "#ffffff",
                alertas: {
                    laudo: { ativo: true, dias: 7 },
                    seguro: { ativo: true, dias: 7 },
                    licenca: { ativo: true, dias: 7 }
                },
                cadastroAtualizadoReset: { dia: "31", mes: "07", ultimoResetAno: "" }
            },
            configs: { url: "", dadosBaixados: false, ultimaMudancaLocal: 0, ultimaSincronizacao: 0, syncRevision: 0, senhaAdmin: "1999", clientId: getClientIdLocal() },
            _deleted: { contribuintes: {}, pagamentos: {}, pix: {}, categorias: {}, administradores: {}, carros: {} }
        };
    }

    function normalizarTextoId(valor) {
        return String(valor || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || 'item';
    }

    function garantirIdsInternos(dados) {
        (dados.contribuintes || []).forEach((c, cIdx) => {
            if(!c.id) c.id = `cont_${normalizarTextoId(c.nome)}_${cIdx}`;
            c.diaVencimento = normalizarDiaVencimento(c.diaVencimento);
            c.carros = Array.isArray(c.carros) ? c.carros : [];
            c.pagamentos = Array.isArray(c.pagamentos) ? c.pagamentos : [];
            c.carros.forEach((car, idx) => {
                if(!car.id) car.id = `car_${normalizarTextoId(c.id)}_${normalizarTextoId(car.placa || car.categoria)}_${idx}`;
                if(!car.updatedAt) car.updatedAt = Number(c.updatedAt || 0);
                if(typeof car.ativo === 'undefined') car.ativo = true;
                if(typeof car.cadastroAtualizado === 'undefined') car.cadastroAtualizado = false;
            });
            c.pagamentos.forEach((pg, idx) => {
                if(!pg.id) pg.id = `pg_${normalizarTextoId(c.id)}_${normalizarTextoId(pg.mesAno || pg.labelRef)}_${normalizarTextoId(pg.dataPagamento)}_${normalizarTextoId(pg.valorPago)}_${idx}`;
                if(!pg.updatedAt) pg.updatedAt = Number(c.updatedAt || 0);
            });
        });
        return dados;
    }

    function carregarBanco() {
        const base = criarBancoBase();
        try {
            let salvo = localStorage.getItem('cooptrans_v1');
            if(salvo) return normalizarBanco(JSON.parse(salvo), base);
        } catch(e) {
            console.warn("Banco local inválido. Usando estrutura inicial.", e);
        }
        return base;
    }

    function normalizarBanco(dados, base = criarBancoBase()) {
        if(!dados || dados.app_id !== "cooptrans") return base;

        dados.cooperativa = { ...base.cooperativa, ...(dados.cooperativa || {}) };
        dados.cooperativa.pixList = Array.isArray(dados.cooperativa.pixList) ? dados.cooperativa.pixList : [];

        dados.categorias = Array.isArray(dados.categorias) ? dados.categorias : [];
        dados.contribuintes = Array.isArray(dados.contribuintes) ? dados.contribuintes : [];
        dados.administradores = Array.isArray(dados.administradores) ? dados.administradores : [];
        dados.auditoria = filtrarAuditoriaRecente(Array.isArray(dados.auditoria) ? dados.auditoria : []);

        const alertas = (dados.configGerais && dados.configGerais.alertas) || {};
        const cadastroAtualizadoReset = (dados.configGerais && dados.configGerais.cadastroAtualizadoReset) || {};
        dados.configGerais = { ...base.configGerais, ...(dados.configGerais || {}) };
        dados.configGerais.alertas = {
            laudo: { ...base.configGerais.alertas.laudo, ...(alertas.laudo || {}) },
            seguro: { ...base.configGerais.alertas.seguro, ...(alertas.seguro || {}) },
            licenca: { ...base.configGerais.alertas.licenca, ...(alertas.licenca || {}) }
        };
        dados.configGerais.cadastroAtualizadoReset = {
            ...base.configGerais.cadastroAtualizadoReset,
            ...cadastroAtualizadoReset
        };

        dados.configs = { ...base.configs, ...(dados.configs || {}) };
        dados.configs.clientId = dados.configs.clientId || getClientIdLocal();
        dados._deleted = { ...base._deleted, ...(dados._deleted || {}) };
        dados._deleted.contribuintes = dados._deleted.contribuintes || {};
        dados._deleted.pagamentos = dados._deleted.pagamentos || {};
        dados._deleted.pix = dados._deleted.pix || {};
        dados._deleted.categorias = dados._deleted.categorias || {};
        dados._deleted.administradores = dados._deleted.administradores || {};
        dados._deleted.carros = dados._deleted.carros || {};
        return garantirIdsInternos(dados);
    }
    
    function salvarBanco(opcoes = {}) {
        db.configs = { ...criarBancoBase().configs, ...(db.configs || {}) };
        db.configs.clientId = db.configs.clientId || getClientIdLocal();
        if(opcoes.marcarLocal !== false) db.configs.ultimaMudancaLocal = Date.now();
        localStorage.setItem('cooptrans_v1', JSON.stringify(db));
        if(opcoes.sincronizar !== false) agendarSincronizacao();
    }

    function agendarSincronizacao() {
        if(!db.configs || !db.configs.url) return;
        syncPendente = true;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => sincronizarFundo(false, true), 1500);
    }

    function registrarExclusao(tipo, id) {
        if(!id) return;
        db._deleted = db._deleted || criarBancoBase()._deleted;
        db._deleted[tipo] = db._deleted[tipo] || {};
        const agora = Date.now();
        db._deleted[tipo][id] = {
            id,
            tipo,
            deletedAt: agora,
            _clientDirty: true,
            _clientChangedAt: agora,
            _clientId: getClientIdLocal(),
            usuario: getUsuarioAuditoria()
        };
    }

    function marcarRegistroPendente(registro) {
        if(!registro) return registro;
        const agora = Date.now();
        registro.updatedAt = agora;
        registro._clientDirty = true;
        registro._clientChangedAt = agora;
        registro._clientId = getClientIdLocal();
        registro._clientUser = getUsuarioAuditoria();
        return registro;
    }

    function tocarRegistro(registro) {
        return marcarRegistroPendente(registro);
    }

    function filtrarAuditoriaRecente(lista, agora = Date.now()) {
        const limite = agora - (AUDITORIA_RETENCAO_DIAS * 24 * 60 * 60 * 1000);
        return (Array.isArray(lista) ? lista : [])
            .filter(item => {
                const data = Number(item && (item.createdAt || item._clientChangedAt || item._serverUpdatedAt) || 0);
                return item && (item._clientDirty || !data || data >= limite);
            })
            .sort((a, b) => Number(b.createdAt || b._clientChangedAt || b._serverSeq || 0) - Number(a.createdAt || a._clientChangedAt || a._serverSeq || 0))
            .slice(0, 300);
    }

    function registrarAuditoria(acao, detalhes = '') {
        db.auditoria = Array.isArray(db.auditoria) ? db.auditoria : [];
        const agora = Date.now();
        db.auditoria.push({
            id: gerarIdLocal('audit'),
            acao,
            detalhes,
            usuario: getUsuarioAuditoria(),
            clientId: getClientIdLocal(),
            createdAt: agora,
            _clientDirty: true,
            _clientChangedAt: agora
        });
        db.auditoria = filtrarAuditoriaRecente(db.auditoria, agora);
    }

    function objetoMaisNovo(a, b) {
        if(!a) return b || {};
        if(!b) return a || {};
        if(a._clientDirty && !b._clientDirty) return a;
        if(!a._clientDirty && b._clientDirty) return b;
        const seqA = Number(a._serverSeq || 0);
        const seqB = Number(b._serverSeq || 0);
        if(seqA !== seqB) return seqB > seqA ? b : a;
        return Number(b.updatedAt || b._clientChangedAt || 0) >= Number(a.updatedAt || a._clientChangedAt || 0) ? b : a;
    }

    function tombstoneSeq(valor) {
        if(!valor) return 0;
        return typeof valor === 'object' ? Number(valor._serverSeq || 0) : 0;
    }

    function tombstoneTempo(valor) {
        if(!valor) return 0;
        return typeof valor === 'object' ? Number(valor.deletedAt || valor._clientChangedAt || 0) : Number(valor || 0);
    }

    function isPendenteDepois(registro, syncStartedAt) {
        if(!registro || !registro._clientDirty) return false;
        return Number(registro._clientChangedAt || registro.updatedAt || 0) > Number(syncStartedAt || 0);
    }

    function tombstonePendenteDepois(valor, syncStartedAt) {
        return !!(valor && typeof valor === 'object' && valor._clientDirty && Number(valor._clientChangedAt || valor.deletedAt || 0) > Number(syncStartedAt || 0));
    }

    function temMudancaLocalPendente() {
        if(db.cooperativa && db.cooperativa._clientDirty) return true;
        if(db.configGerais && db.configGerais._clientDirty) return true;
        if((db.categorias || []).some(item => item && item._clientDirty)) return true;
        if((db.administradores || []).some(item => item && item._clientDirty)) return true;
        if((db.auditoria || []).some(item => item && item._clientDirty)) return true;
        if((db.contribuintes || []).some(c => c && (c._clientDirty || (c.carros || []).some(car => car && car._clientDirty) || (c.pagamentos || []).some(pg => pg && pg._clientDirty)))) return true;
        return Object.values(db._deleted || {}).some(grupo => Object.values(grupo || {}).some(tomb => tomb && typeof tomb === 'object' && tomb._clientDirty));
    }

    function mesclarExclusoes(a, b) {
        const tipos = ['contribuintes', 'pagamentos', 'pix', 'categorias', 'administradores', 'carros'];
        const result = {};
        tipos.forEach((tipo) => {
            result[tipo] = {};
            const atual = (a && a[tipo]) || {};
            const novo = (b && b[tipo]) || {};
            Object.keys(atual).forEach((id) => result[tipo][id] = atual[id]);
            Object.keys(novo).forEach((id) => {
                const existente = result[tipo][id];
                result[tipo][id] = tombstoneSeq(novo[id]) > tombstoneSeq(existente) || tombstoneTempo(novo[id]) > tombstoneTempo(existente) ? novo[id] : existente;
            });
        });
        return result;
    }

    function mesclarListaPorData(atual = [], nova = [], excluidos = {}) {
        const map = {};
        atual.concat(nova).forEach((item) => {
            if(!item) return;
            const key = item.id || item.nome || item.chave;
            if(!key) return;
            map[key] = objetoMaisNovo(map[key], item);
        });
        return Object.keys(map)
            .filter((id) => {
                const tomb = (excluidos || {})[id];
                if(!tomb) return true;
                const seqDel = tombstoneSeq(tomb);
                const seqReg = Number(map[id]._serverSeq || 0);
                if(seqDel || seqReg) return seqDel < seqReg;
                return tombstoneTempo(tomb) < Number(map[id].updatedAt || 0);
            })
            .map((id) => map[id]);
    }

    function mesclarPagamentosPorData(atual = [], nova = [], excluidos = {}) {
        return mesclarListaPorData(atual, nova, excluidos);
    }

    function mesclarContribuintesPorData(atual = [], nova = [], excluidos = {}) {
        const map = {};
        atual.forEach((item) => { if(item && item.id) map[item.id] = item; });
        nova.forEach((item) => {
            if(!item || !item.id) return;
            const anterior = map[item.id];
            const escolhido = { ...objetoMaisNovo(anterior, item) };
            escolhido.carros = mesclarListaPorData((anterior && anterior.carros) || [], item.carros || [], (excluidos && excluidos.carros) || {});
            escolhido.pagamentos = mesclarPagamentosPorData((anterior && anterior.pagamentos) || [], item.pagamentos || [], (excluidos && excluidos.pagamentos) || {});
            map[item.id] = escolhido;
        });
        return Object.keys(map)
            .filter((id) => {
                const tomb = excluidos && excluidos.contribuintes && excluidos.contribuintes[id];
                if(!tomb) return true;
                const seqDel = tombstoneSeq(tomb);
                const seqReg = Number(map[id]._serverSeq || 0);
                if(seqDel || seqReg) return seqDel < seqReg;
                return tombstoneTempo(tomb) < Number(map[id].updatedAt || 0);
            })
            .map((id) => map[id]);
    }

    function mesclarBancosPorData(local, nuvem) {
        local = normalizarBanco(local);
        nuvem = normalizarBanco(nuvem);
        const merged = normalizarBanco({ ...local });
        merged._deleted = mesclarExclusoes(local._deleted, nuvem._deleted);
        merged.cooperativa = objetoMaisNovo(local.cooperativa, nuvem.cooperativa);
        merged.cooperativa.pixList = mesclarListaPorData(local.cooperativa.pixList || [], nuvem.cooperativa.pixList || [], merged._deleted.pix);
        merged.configGerais = objetoMaisNovo(local.configGerais, nuvem.configGerais);
        merged.categorias = mesclarListaPorData(local.categorias || [], nuvem.categorias || [], merged._deleted.categorias);
        merged.administradores = mesclarListaPorData(local.administradores || [], nuvem.administradores || [], merged._deleted.administradores);
        merged.auditoria = filtrarAuditoriaRecente(mesclarListaPorData(local.auditoria || [], nuvem.auditoria || [], {}));
        merged.contribuintes = mesclarContribuintesPorData(local.contribuintes || [], nuvem.contribuintes || [], merged._deleted);
        merged.configs = { ...(local.configs || {}), ...(nuvem.configs || {}) };
        merged.configs.url = (local.configs && local.configs.url) || (nuvem.configs && nuvem.configs.url) || '';
        merged.configs.ultimaMudancaLocal = Math.max(Number(local.configs?.ultimaMudancaLocal || 0), Number(nuvem.configs?.ultimaMudancaLocal || 0));
        merged.configs.ultimaSincronizacao = Math.max(Number(local.configs?.ultimaSincronizacao || 0), Number(nuvem.configs?.ultimaSincronizacao || 0));
        merged.configs.syncRevision = Math.max(Number(local.configs?.syncRevision || 0), Number(nuvem.configs?.syncRevision || 0));
        return normalizarBanco(merged);
    }

    function reaplicarMudancasLocaisRecentes(baseServidor, local, syncStartedAt) {
        const server = normalizarBanco(baseServidor);
        local = normalizarBanco(local);
        server._deleted = mesclarExclusoes(server._deleted, local._deleted);
        Object.keys(local._deleted || {}).forEach((tipo) => {
            Object.keys(local._deleted[tipo] || {}).forEach((id) => {
                const tomb = local._deleted[tipo][id];
                if(tombstonePendenteDepois(tomb, syncStartedAt)) {
                    server._deleted[tipo] = server._deleted[tipo] || {};
                    server._deleted[tipo][id] = tomb;
                }
            });
        });

        if(isPendenteDepois(local.cooperativa, syncStartedAt)) server.cooperativa = local.cooperativa;
        if(isPendenteDepois(local.configGerais, syncStartedAt)) server.configGerais = local.configGerais;
        server.categorias = mesclarListaPorData(server.categorias, local.categorias.filter(c => isPendenteDepois(c, syncStartedAt)), server._deleted.categorias);
        server.administradores = mesclarListaPorData(server.administradores, local.administradores.filter(a => isPendenteDepois(a, syncStartedAt)), server._deleted.administradores);
        server.auditoria = filtrarAuditoriaRecente(mesclarListaPorData(server.auditoria || [], (local.auditoria || []).filter(a => isPendenteDepois(a, syncStartedAt)), {}));

        const contribMap = {};
        server.contribuintes.forEach(c => { if(c && c.id) contribMap[c.id] = c; });
        local.contribuintes.forEach(cLocal => {
            if(!cLocal || !cLocal.id) return;
            let cServer = contribMap[cLocal.id] || { ...cLocal, carros: [], pagamentos: [] };
            if(isPendenteDepois(cLocal, syncStartedAt)) cServer = { ...cServer, ...cLocal };
            cServer.carros = mesclarListaPorData(cServer.carros || [], (cLocal.carros || []).filter(car => isPendenteDepois(car, syncStartedAt)), server._deleted.carros);
            cServer.pagamentos = mesclarPagamentosPorData(cServer.pagamentos || [], (cLocal.pagamentos || []).filter(pg => isPendenteDepois(pg, syncStartedAt)), server._deleted.pagamentos);
            contribMap[cLocal.id] = cServer;
        });
        server.contribuintes = Object.values(contribMap).filter(c => {
            const tomb = server._deleted.contribuintes && server._deleted.contribuintes[c.id];
            if(!tomb) return true;
            if(tombstonePendenteDepois(tomb, syncStartedAt)) return false;
            const seqDel = tombstoneSeq(tomb);
            const seqReg = Number(c._serverSeq || 0);
            return seqDel < seqReg;
        });
        return normalizarBanco(server);
    }
    
    function abrirModal(id) {
        let el = document.getElementById(id);
        if(el) {
            el.style.display = 'flex';
            let modalBox = el.querySelector('.modal');
            if(modalBox) {
                modalBox.scrollTop = 0;
            }
        }
    }
    
    function fecharModal(id) { document.getElementById(id).style.display = 'none'; }
    function marcarMudancaEstrutural() { db.configs.ultimaMudancaLocal = Date.now(); salvarBanco(); }

    function aplicarBancoAtualizado(novoBanco, opcoes = {}) {
        if(!validarBancoImportado(novoBanco)) return false;
        let urlSalva = db.configs && db.configs.url;
        const ultimaMudancaAntes = Number(db.configs?.ultimaMudancaLocal || 0);
        const houveMudancaDuranteSync = opcoes.syncStartedAt && ultimaMudancaAntes > opcoes.syncStartedAt;
        db = houveMudancaDuranteSync ? reaplicarMudancasLocaisRecentes(novoBanco, db, opcoes.syncStartedAt) : normalizarBanco(novoBanco);
        if(urlSalva) db.configs.url = urlSalva;
        db.configs.ultimaSincronizacao = houveMudancaDuranteSync ? Number(db.configs.ultimaSincronizacao || 0) : Date.now();
        localStorage.setItem('cooptrans_v1', JSON.stringify(db));

        if(houveMudancaDuranteSync) {
            syncPendente = true;
            clearTimeout(syncTimer);
            syncTimer = setTimeout(() => sincronizarFundo(false, true), 1500);
        }

        if(opcoes.render !== false) {
            aplicarTema();
            renderizarCabecalhoPrincipal();
            atualizarPerfilAdminUI();
            try { atualizarTextoMesGeral(); } catch(e) {}
            if(document.getElementById('modalPainelResultados') && getComputedStyle(document.getElementById('modalPainelResultados')).display !== 'none') {
                renderizarResumoMes();
                gerarGraficosComparativos();
            }
            if(document.getElementById('modalListagem') && getComputedStyle(document.getElementById('modalListagem')).display !== 'none') {
                if(document.getElementById('inputBuscaGerenciarContrib').style.display !== 'none') renderGerenciarContribuintesLista();
            }
            if(document.getElementById('modalAuditoria') && getComputedStyle(document.getElementById('modalAuditoria')).display !== 'none') {
                renderAuditoria();
            }
        }
        return true;
    }

    function estaArquivadoContribuinte(c) {
        return !!(c && (c.arquivado || c.ativo === false));
    }

    function getPermissoesUsuario(usuario) {
        return { cooperativa: false, configGerais: false, usuarios: false, ...(usuario && usuario.permissoes ? usuario.permissoes : {}) };
    }

    function usuarioTemPermissao(chave) {
        if(!adminLogado) return false;
        if(adminLogado.isAdmin) return true;
        return !!(adminLogado.permissoes && adminLogado.permissoes[chave]);
    }

    function negarPermissao() {
        alert("Este usuário não tem acesso a essa área.");
    }

    function getPerfisAdminDisponiveis() {
        let perfis = (db.administradores || [])
            .filter(a => a && a.nome && a.senha)
            .map(a => ({
                id: a.id,
                nome: a.nome,
                senha: String(a.senha),
                isAdmin: a.isAdmin !== false,
                permissoes: getPermissoesUsuario(a)
            }));

        if(perfis.length === 0) {
            perfis.push({
                id: 'admin_padrao',
                nome: 'Administrador',
                senha: String((db.configs && db.configs.senhaAdmin) || '1999'),
                isAdmin: true,
                permissoes: { cooperativa: true, configGerais: true, usuarios: true }
            });
        }
        return perfis;
    }

    function atualizarPerfilAdminUI() {
        let nome = adminLogado ? adminLogado.nome : 'Entrar';
        let nomeCurto = nome.length > 14 ? `${nome.substring(0, 13)}…` : nome;
        let labelHeader = document.getElementById('perfilAdminNome');
        let labelModal = document.getElementById('perfilAtualNome');
        if(labelHeader) labelHeader.innerText = nomeCurto;
        if(labelModal) labelModal.innerText = nome;
    }

    function abrirLoginAdmin(ehTroca = false) {
        let modal = document.getElementById('modalLoginAdmin');
        if(!modal) return;
        document.getElementById('loginAdminSenha').value = '';
        document.getElementById('loginAdminErro').style.display = 'none';
        document.getElementById('loginAdminTexto').innerText = ehTroca ? 'Informe a senha do perfil que deseja usar.' : 'Informe a senha do administrador para entrar.';
        document.getElementById('btnCancelarLoginAdmin').style.display = (ehTroca && adminLogado) ? 'block' : 'none';
        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('loginAdminSenha').focus(), 80);
    }

    function entrarAdmin() {
        let senha = document.getElementById('loginAdminSenha').value.trim();
        let erro = document.getElementById('loginAdminErro');
        let perfil = getPerfisAdminDisponiveis().find(a => a.senha === senha);

        if(!perfil) {
            erro.innerText = 'Senha não encontrada em nenhum perfil de administrador.';
            erro.style.display = 'block';
            document.getElementById('loginAdminSenha').select();
            return;
        }

        adminLogado = { id: perfil.id, nome: perfil.nome, isAdmin: perfil.isAdmin !== false, permissoes: getPermissoesUsuario(perfil) };
        atualizarPerfilAdminUI();
        erro.style.display = 'none';
        fecharModal('modalLoginAdmin');
        fecharModal('modalPerfilAdmin');
    }

    function abrirMenuPerfil() {
        if(!adminLogado) {
            abrirLoginAdmin(false);
            return;
        }
        atualizarPerfilAdminUI();
        abrirModal('modalPerfilAdmin');
    }

    function trocarPerfilAdmin() {
        fecharModal('modalPerfilAdmin');
        abrirLoginAdmin(true);
    }

    function sairPerfilAdmin() {
        adminLogado = null;
        atualizarPerfilAdminUI();
        fecharModal('modalPerfilAdmin');
        abrirLoginAdmin(false);
    }

    function cancelarTrocaPerfil() {
        if(adminLogado) {
            fecharModal('modalLoginAdmin');
            return;
        }
        abrirLoginAdmin(false);
    }

    function abrirCooperativaComPermissao() {
        if(!usuarioTemPermissao('cooperativa')) return negarPermissao();
        abrirModalCooperativa();
    }

    function abrirConfigGeraisComPermissao() {
        if(!usuarioTemPermissao('configGerais')) return negarPermissao();
        abrirModalConfigGerais();
    }

    function abrirUsuariosComPermissao() {
        if(!usuarioTemPermissao('usuarios')) return negarPermissao();
        abrirGerenciar('administradores');
    }

    function abrirAuditoriaComPermissao() {
        if(!adminLogado || (!adminLogado.isAdmin && !usuarioTemPermissao('usuarios'))) return negarPermissao();
        fecharModal('modalPainelUnificado');
        renderAuditoria();
        abrirModal('modalAuditoria');
    }

    function formatarDataHoraAuditoria(item) {
        const valor = Number(item._serverUpdatedAt || item.createdAt || item._clientChangedAt || 0);
        if(!valor) return '-';
        return new Date(valor).toLocaleString('pt-BR');
    }

    function renderAuditoria() {
        const box = document.getElementById('listaAuditoria');
        if(!box) return;
        const busca = (document.getElementById('buscaAuditoria')?.value || '').toLowerCase();
        const itens = [...(db.auditoria || [])]
            .filter(item => {
                const texto = `${item.acao || ''} ${item.detalhes || ''} ${item.usuario || ''}`.toLowerCase();
                return !busca || texto.includes(busca);
            })
            .sort((a,b) => Number(b._serverSeq || b.createdAt || 0) - Number(a._serverSeq || a.createdAt || 0))
            .slice(0, 200);
        if(itens.length === 0) {
            box.innerHTML = '<div class="empty-state">Nenhuma mudança registrada.</div>';
            return;
        }
        box.innerHTML = itens.map(item => `
            <div class="audit-row">
                <div class="audit-main">
                    <strong>${escapeHTML(item.acao || 'Mudança')}</strong>
                    <span>${escapeHTML(item.detalhes || '')}</span>
                </div>
                <div class="audit-meta">
                    <b>${escapeHTML(item.usuario || 'Sistema')}</b>
                    <span>${formatarDataHoraAuditoria(item)}</span>
                    ${item._clientDirty ? '<em>Pendente de sincronização</em>' : `<small>Rev. ${escapeHTML(item._serverSeq || '-')}</small>`}
                </div>
            </div>
        `).join('');
    }

    function aplicarTema() {
        let cor = db.configGerais.corTema || '#008C4A';
        let corSub = db.configGerais.corSubHeader || '#ffffff';
        document.documentElement.style.setProperty('--theme-base', cor);
        document.documentElement.style.setProperty('--theme-sub', corSub);
        document.getElementById('metaThemeColor').setAttribute('content', cor);
    }

    function renderizarCabecalhoPrincipal() {
        let logoImg = document.getElementById('headerLogo');
        let splashLogo = document.getElementById('splashLogoObj');

        if(db.cooperativa.logo) {
            logoImg.src = db.cooperativa.logo;
            logoImg.style.display = 'block';
            if(splashLogo) {
                splashLogo.src = db.cooperativa.logo;
                splashLogo.style.display = 'block';
            }
        } else {
            logoImg.style.display = 'none';
            if(splashLogo) splashLogo.style.display = 'none';
        }
    }

    function getConfigResetCadastroAtualizado() {
        const base = criarBancoBase().configGerais.cadastroAtualizadoReset;
        const cfg = (db.configGerais && db.configGerais.cadastroAtualizadoReset) || {};
        return {
            ...base,
            ...cfg,
            dia: String(cfg.dia || base.dia).padStart(2, '0'),
            mes: String(cfg.mes || base.mes).padStart(2, '0')
        };
    }

    function normalizarDiaMesResetCadastro(diaValor, mesValor) {
        const dia = Math.min(31, Math.max(1, parseInt(diaValor, 10) || 31));
        const mes = Math.min(12, Math.max(1, parseInt(mesValor, 10) || 7));
        return {
            dia: String(dia).padStart(2, '0'),
            mes: String(mes).padStart(2, '0')
        };
    }

    function aplicarResetCadastroAtualizadoSeNecessario() {
        const cfg = getConfigResetCadastroAtualizado();
        const hoje = getHojeSTR();
        const ano = hoje.substring(0, 4);
        const dataReset = `${ano}-${cfg.mes}-${cfg.dia}`;
        if(hoje < dataReset || String(cfg.ultimoResetAno || '') === ano) return;

        let alterouVeiculo = false;
        (db.contribuintes || []).forEach(c => {
            let alterouContribuinte = false;
            (c.carros || []).forEach(car => {
                if(car.cadastroAtualizado) {
                    car.cadastroAtualizado = false;
                    tocarRegistro(car);
                    alterouVeiculo = true;
                    alterouContribuinte = true;
                }
            });
            if(alterouContribuinte) tocarRegistro(c);
        });

        db.configGerais.cadastroAtualizadoReset = { ...cfg, ultimoResetAno: ano };
        tocarRegistro(db.configGerais);
        if(alterouVeiculo) registrarAuditoria('Cadastro atualizado zerado', `Reset anual em ${cfg.dia}/${cfg.mes}/${ano}`);
        salvarBanco();
    }

    document.addEventListener("DOMContentLoaded", () => { 
        document.title = `Cooptrans ${APP_VERSION}`;
        document.getElementById('splashVersao').innerText = APP_VERSION;
        document.getElementById('menuAppVersion').innerText = APP_VERSION;
        document.getElementById('loginAppVersion').innerText = APP_VERSION;
        atualizarPerfilAdminUI();
        aplicarTema();
        renderizarCabecalhoPrincipal();
        aplicarResetCadastroAtualizadoSeNecessario();
        setTimeout(() => {
            document.getElementById('splashScreen').style.opacity = '0';
            setTimeout(()=>{document.getElementById('splashScreen').style.display = 'none';}, 500); 
        }, 1000); 
        
        let hjMes = getHojeSTR().substring(0,7);
        document.getElementById('filtroMesGeral').value = hjMes;
        atualizarTextoMesGeral();
        configurarBloqueioZoom();
        registrarServiceWorker();
        inicializarSincronizacaoAutomatica();
        abrirLoginAdmin(false);
    });

    function configurarBloqueioZoom() {
        document.addEventListener('wheel', (e) => { if(e.ctrlKey) e.preventDefault(); }, { passive: false });
        document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('keydown', (e) => {
            const zoomKeys = ['+', '-', '=', '0'];
            if((e.ctrlKey || e.metaKey) && zoomKeys.includes(e.key)) e.preventDefault();
        }, { capture: true });
    }

    function registrarServiceWorker() {
        if('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }

    function inicializarSincronizacaoAutomatica() {
        if(!db.configs.url) return;
        setTimeout(() => sincronizacaoAutomatica(), 2500);
        setInterval(() => sincronizacaoAutomatica(), SYNC_PULL_INTERVAL_MS);
        window.addEventListener('focus', () => sincronizacaoAutomatica());
    }

    function sincronizacaoAutomatica() {
        if(!db.configs.url || isSyncingFundo) return;
        if(syncPendente || temMudancaLocalPendente()) {
            sincronizarFundo(false, true);
        } else {
            puxarDadosNuvem(true);
        }
    }

    // ATALHO ENTER E ESC E NAVEGACAO LISTA
    document.addEventListener('keydown', function(e) {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && e.key !== 'Escape') {
            return; 
        }

        let modals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => window.getComputedStyle(m).display !== 'none');
        let isModalOpen = modals.length > 0;
        let scrollKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'];

        if(isModalOpen) {
            if(e.key === 'Escape') {
                let topModal = modals.sort((a,b) => (parseInt(window.getComputedStyle(a).zIndex)||0) - (parseInt(window.getComputedStyle(b).zIndex)||0)).pop();
                if(topModal) {
                    let closeBtn = topModal.querySelector('.btn-cancel') || topModal.querySelector('button[onclick*="fechar"]');
                    if(closeBtn) closeBtn.click();
                }
                e.preventDefault();
                return;
            }
            
            if(scrollKeys.includes(e.key)) {
                let topModal = modals.sort((a,b) => (parseInt(window.getComputedStyle(a).zIndex)||0) - (parseInt(window.getComputedStyle(b).zIndex)||0)).pop();
                let modalBox = topModal.querySelector('.modal');
                if(modalBox) {
                    if(e.key === 'ArrowDown') { modalBox.scrollTop += 50; }
                    else if(e.key === 'ArrowUp') { modalBox.scrollTop -= 50; }
                    else if(e.key === 'PageDown') { modalBox.scrollTop += modalBox.clientHeight; }
                    else if(e.key === 'PageUp') { modalBox.scrollTop -= modalBox.clientHeight; }
                    else if(e.key === 'Home') { modalBox.scrollTop = 0; }
                    else if(e.key === 'End') { modalBox.scrollTop = modalBox.scrollHeight; }
                    e.preventDefault(); 
                }
            }
        } else {
            if(e.key === 'Enter') {
                clickFiltroTodos();
                e.preventDefault();
            } else if(scrollKeys.includes(e.key)) {
                let scrollArea = document.querySelector('.scroll-area');
                if(e.key === 'ArrowDown') { scrollArea.scrollTop += 50; e.preventDefault(); }
                else if(e.key === 'ArrowUp') { scrollArea.scrollTop -= 50; e.preventDefault(); }
                else if(e.key === 'PageDown') { scrollArea.scrollTop += scrollArea.clientHeight; e.preventDefault(); }
                else if(e.key === 'PageUp') { scrollArea.scrollTop -= scrollArea.clientHeight; e.preventDefault(); }
                else if(e.key === 'Home') { scrollArea.scrollTop = 0; e.preventDefault(); }
                else if(e.key === 'End') { scrollArea.scrollTop = scrollArea.scrollHeight; e.preventDefault(); }
            }
        }
    });

    // EVENTO DE SCROLL PARA MOSTRAR LETRA
    let scrollTimeout;
    document.querySelector('.scroll-area').addEventListener('scroll', function() {
        let listItems = document.querySelectorAll('#listaPrincipal .item');
        if(listItems.length === 0) return;
        
        let containerTop = this.getBoundingClientRect().top;
        let currentItem = null;
        for(let item of listItems) {
            let rect = item.getBoundingClientRect();
            if(rect.top >= containerTop || rect.bottom > containerTop) {
                currentItem = item;
                break;
            }
        }
        
        if(currentItem) {
            let titleEl = currentItem.querySelector('.item-title');
            if(titleEl) {
                let letter = titleEl.innerText.charAt(0).toUpperCase();
                let ind = document.getElementById('letterIndicator');
                if (ind) {
                    ind.innerText = letter;
                    ind.style.display = 'flex';
                    
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        ind.style.display = 'none';
                    }, 800); 
                }
            }
        }
    });

    // LOGICA CUSTOM MONTH PICKER UNIFICADA
    let mpCurrentYear = new Date().getFullYear();
    let activeMonthTarget = 'filtroMesGeral';
    
    function abrirSeletorMes(target) {
        activeMonthTarget = target;
        let val = document.getElementById(target).value;
        if(val) mpCurrentYear = parseInt(val.split('-')[0]);
        else mpCurrentYear = new Date().getFullYear();
        
        renderizarGridMeses();
        abrirModal('modalMonthPicker');
    }
    function mpChangeYear(dir) {
        mpCurrentYear += dir;
        renderizarGridMeses();
    }
    function renderizarGridMeses() {
        document.getElementById('mpYearLabel').innerText = mpCurrentYear;
        let valAt = document.getElementById(activeMonthTarget).value;
        let mesAt = valAt ? valAt.split('-')[1] : null;
        let anoAt = valAt ? parseInt(valAt.split('-')[0]) : null;

        let html = '';
        for(let i=1; i<=12; i++) {
            let isActive = (i === parseInt(mesAt) && mpCurrentYear === anoAt);
            html += `<div class="month-btn ${isActive ? 'active':''}" onclick="mpSelectMonth(${i})">${getAbrevMes(i)}</div>`;
        }
        document.getElementById('mpMonthGrid').innerHTML = html;
    }
    function mpSelectMonth(m) {
        let mesStr = String(m).padStart(2,'0');
        document.getElementById(activeMonthTarget).value = `${mpCurrentYear}-${mesStr}`;
        fecharModal('modalMonthPicker');
        
        if(activeMonthTarget === 'filtroMesGeral') {
            atualizarTextoMesGeral();
        } else if(activeMonthTarget === 'dashMesSingle') {
            document.getElementById('lblDashMesSingle').innerText = `${getExtensoMes(mesStr)} ${mpCurrentYear}`;
            renderizarResumoMes();
        } else if(activeMonthTarget === 'dashGrafIni') {
            document.getElementById('lblDashGrafIni').innerText = `${getAbrevMes(mesStr)} ${mpCurrentYear}`;
            gerarGraficosComparativos();
        } else if(activeMonthTarget === 'dashGrafFim') {
            document.getElementById('lblDashGrafFim').innerText = `${getAbrevMes(mesStr)} ${mpCurrentYear}`;
            gerarGraficosComparativos();
        } else if(activeMonthTarget === 'pgIni') {
            document.getElementById('lblPgIni').innerText = `${getExtensoMes(mesStr)} ${mpCurrentYear}`;
            calcPgtoMulti(true);
        } else if(activeMonthTarget === 'pgFim') {
            document.getElementById('lblPgFim').innerText = `${getExtensoMes(mesStr)} ${mpCurrentYear}`;
            calcPgtoMulti(true);
        } else if(activeMonthTarget === 'pgMesRefSingle') {
            document.getElementById('lblPgMesRefSingle').innerText = `${getExtensoMes(mesStr)} ${mpCurrentYear}`;
            atualizarStatusSingleAcoes();
        } else if(activeMonthTarget === 'relManualIni') {
            document.getElementById('lblRelManualIni').innerText = `${getAbrevMes(mesStr)} ${mpCurrentYear}`;
            gerarRelatorioManual();
        } else if(activeMonthTarget === 'relManualFim') {
            document.getElementById('lblRelManualFim').innerText = `${getAbrevMes(mesStr)} ${mpCurrentYear}`;
            gerarRelatorioManual();
        }
    }

    function atualizarTextoMesGeral() {
        let val = document.getElementById('filtroMesGeral').value;
        if(val) {
            let partes = val.split('-');
            let mesNome = getExtensoMes(partes[1]);
            document.getElementById('lblMesVisivel').innerText = `${mesNome} ${partes[0]}`;
            atualizarCorMesReferencia(val);
        }
        try { renderizarLista(); } catch(e) { console.error("Erro ao renderizar lista", e); }
    }

    function atualizarCorMesReferencia(val) {
        const box = document.querySelector('.header-month-slot .month-picker-box');
        if(!box || !val) return;
        const mesAtual = getHojeSTR().substring(0,7);
        box.classList.remove('month-ref-past', 'month-ref-future');
        if(val < mesAtual) box.classList.add('month-ref-past');
        if(val > mesAtual) box.classList.add('month-ref-future');
    }

    function calcularValorEsperado(c, mesRef) {
        if(!mesRef || mesRef < COBRANCA_INICIO_MES || estaArquivadoContribuinte(c)) return 0;
        let soma = 0;
        (c.carros || []).forEach(car => {
            if(!car.ativo) return;
            let cadMonth = getMesCadastroCobranca(car);
            if(mesRef >= cadMonth) {
                soma += parseMoeda(car.valor);
            }
        });
        let desc = parseMoeda(c.desconto || "0");
        return Math.max(0, soma - desc);
    }

    // DASHBOARD
    let dashOrigem = 'menu';

    function abrirPainelResultados(fromHome = false) {
        dashOrigem = fromHome ? 'home' : 'menu';
        if(dashOrigem === 'menu') fecharModal('modalPainelUnificado');
        
        let valFiltro = document.getElementById('filtroMesGeral').value || getHojeSTR().substring(0,7);
        let pFiltro = valFiltro.split('-');
        
        document.getElementById('dashMesSingle').value = valFiltro;
        document.getElementById('lblDashMesSingle').innerText = `${getExtensoMes(pFiltro[1])} ${pFiltro[0]}`;
        
        let currYear = new Date().getFullYear();
        document.getElementById('dashGrafIni').value = `${currYear}-01`;
        document.getElementById('lblDashGrafIni').innerText = `Jan ${currYear}`;
        
        document.getElementById('dashGrafFim').value = `${currYear}-12`;
        document.getElementById('lblDashGrafFim').innerText = `Dez ${currYear}`;
        
        renderizarResumoMes();
        abrirModal('modalPainelResultados');
        setTimeout(() => gerarGraficosComparativos(), 300);
    }

    function fecharPainelResultados() {
        fecharModal('modalPainelResultados');
        if(dashOrigem === 'home') {
            // Volta para a home
        } else {
            abrirModal('modalPainelUnificado');
        }
    }

    function toggleDashTipoDado() {
        let isQtd = document.getElementById('dashSwTipoDado').checked;
        document.getElementById('lblSwValor').style.color = isQtd ? '#777' : 'var(--theme-base)';
        document.getElementById('lblSwQtd').style.color = isQtd ? 'var(--theme-base)' : '#777';
        gerarGraficosComparativos();
    }

    function toggleDashTipoGrafico() {
        let isLinha = document.getElementById('dashSwTipoGrafico').checked;
        document.getElementById('lblSwBarra').style.color = isLinha ? '#777' : 'var(--theme-base)';
        document.getElementById('lblSwLinha').style.color = isLinha ? 'var(--theme-base)' : '#777';
        gerarGraficosComparativos();
    }

    function renderizarResumoMes() {
        let mesRef = document.getElementById('dashMesSingle').value;
        if(!mesRef) return;
        
        let totalContribAtivos = 0;
        let totalCarrosAtivos = 0;
        let totalCarrosGrandes = 0;
        let totalCarrosPequenos = 0;
        let recebidoVal = 0;
        let recebidoQtd = 0;
        let pendenteVal = 0;
        let pendenteQtd = 0;

        db.contribuintes.forEach(c => {
            if(estaArquivadoContribuinte(c)) return;
            let valEsp = calcularValorEsperado(c, mesRef);
            let valPen = calcularValorPendenteMes(c, mesRef);
            let carrosAtivosMes = (c.carros || []).filter(car => {
                if(!car.ativo) return false;
                let cadMonth = getMesCadastroCobranca(car);
                return cadMonth <= mesRef;
            });
            let carrosDeste = carrosAtivosMes.length;
            
            if(valEsp > 0 || carrosDeste > 0) {
                totalContribAtivos++;
                totalCarrosAtivos += carrosDeste;
                carrosAtivosMes.forEach(car => {
                    if(normalizarHeaderExcel(car.categoria).includes('grande')) totalCarrosGrandes++;
                    else totalCarrosPequenos++;
                });

                if(isMesPago(c, mesRef)) {
                    recebidoVal += valEsp;
                    recebidoQtd++;
                } else if(valPen > 0) {
                    pendenteVal += valPen;
                    pendenteQtd++;
                }
            }
        });

        let totalEsperadoMes = recebidoVal + pendenteVal;

        document.getElementById('dashTotalContrib').innerText = totalContribAtivos;
        document.getElementById('dashTotalCarros').innerText = totalCarrosAtivos;
        document.getElementById('dashTotalCarrosTipo').innerText = `${totalCarrosGrandes} grandes | ${totalCarrosPequenos} pequenos`;
        document.getElementById('dashTotalEsperado').innerText = `R$ ${formatMoeda(totalEsperadoMes)}`;
        
        document.getElementById('dashRecebidoVal').innerText = `R$ ${formatMoeda(recebidoVal)}`;
        document.getElementById('dashRecebidoQtd').innerText = `${recebidoQtd} contribuintes`;
        document.getElementById('dashPendenteVal').innerText = `R$ ${formatMoeda(pendenteVal)}`;
        document.getElementById('dashPendenteQtd').innerText = `${pendenteQtd} contribuintes`;
    }

    let arrRecebidoVal = []; let arrRecebidoQtd = [];
    let arrPendenteVal = []; let arrPendenteQtd = [];

    function gerarGraficosComparativos() {
        if(typeof Chart === 'undefined') return;

        let ini = document.getElementById('dashGrafIni').value;
        let fim = document.getElementById('dashGrafFim').value;
        if(!ini || !fim) return;
        if(fim < ini) { let temp=ini; ini=fim; fim=temp; }

        let meses = getMesesRange(ini, fim);
        let labelsArr = [];
        arrRecebidoVal = []; arrRecebidoQtd = [];
        arrPendenteVal = []; arrPendenteQtd = [];
        let totalValRecPer = 0; let totalValPenPer = 0;

        let currentRealMonth = getHojeSTR().substring(0,7);

        meses.forEach(m => {
            let p = m.split('-');
            labelsArr.push(`${getAbrevMes(p[1])}/${p[0].substring(2)}`);
            
            let recVal = 0, recQtd = 0;
            let penVal = 0, penQtd = 0;
            
            db.contribuintes.forEach(c => {
                if(estaArquivadoContribuinte(c)) return;
                let valEsp = calcularValorEsperado(c, m);
                if(valEsp > 0) {
                    if(isMesPago(c, m)) {
                        recVal += valEsp;
                        recQtd++;
                    } else {
                        let valPen = calcularValorPendenteMes(c, m);
                        if(valPen > 0) {
                            penVal += valPen;
                            penQtd++;
                        }
                    }
                }
            });

            arrRecebidoVal.push(recVal);
            arrRecebidoQtd.push(recQtd);
            totalValRecPer += recVal;
            
            if (m > currentRealMonth) {
                arrPendenteVal.push(null);
                arrPendenteQtd.push(null);
            } else {
                arrPendenteVal.push(penVal);
                arrPendenteQtd.push(penQtd);
                totalValPenPer += penVal;
            }
        });

        document.getElementById('dashResumoPeriodo').innerHTML = `Recebido (Período): <span style="color:#2E7D32;">R$ ${formatMoeda(totalValRecPer)}</span> <br> Pendente (Período): <span style="color:#D32F2F;">R$ ${formatMoeda(totalValPenPer)}</span>`;

        let isLinha = document.getElementById('dashSwTipoGrafico').checked;
        let isQtd = document.getElementById('dashSwTipoDado').checked;

        let tipoGrafico = isLinha ? 'line' : 'bar';
        let dataRec = isQtd ? arrRecebidoQtd : arrRecebidoVal;
        let dataPen = isQtd ? arrPendenteQtd : arrPendenteVal;
        let lblExt = isQtd ? '(Qtd)' : '(R$)';

        let sharedOptions = {
            responsive: true,
            scales: { y: { ticks: { precision: isQtd ? 0 : undefined } } },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let idx = context.dataIndex;
                            let isArrecadacao = context.dataset.label.includes('Arrecadação');
                            
                            let val = isArrecadacao ? arrRecebidoVal[idx] : arrPendenteVal[idx];
                            let qtd = isArrecadacao ? arrRecebidoQtd[idx] : arrPendenteQtd[idx];
                            
                            if(!isArrecadacao && val === null) return 'N/A (Mês Futuro)';
                            
                            return `R$ ${formatMoeda(val)} (${qtd} contribuintes)`;
                        }
                    }
                }
            }
        };

        let ctxArr = document.getElementById('chartArrecadacao').getContext('2d');
        if(chartArrecadacao) chartArrecadacao.destroy();
        chartArrecadacao = new Chart(ctxArr, {
            type: tipoGrafico,
            data: {
                labels: labelsArr,
                datasets: [{ 
                    label: `Arrecadação ${lblExt}`, 
                    data: dataRec, 
                    backgroundColor: '#2E7D32', 
                    borderColor: '#2E7D32',
                    borderWidth: 2,
                    borderRadius: tipoGrafico === 'bar' ? 4 : 0,
                    tension: 0.3
                }]
            },
            options: { ...sharedOptions, plugins: { ...sharedOptions.plugins, title: { display: true, text: 'Evolução da Arrecadação' } } }
        });

        let ctxInad = document.getElementById('chartInadimplencia').getContext('2d');
        if(chartInadimplencia) chartInadimplencia.destroy();
        chartInadimplencia = new Chart(ctxInad, {
            type: tipoGrafico,
            data: {
                labels: labelsArr,
                datasets: [{ 
                    label: `Inadimplência / Pendente ${lblExt}`, 
                    data: dataPen, 
                    backgroundColor: '#D32F2F', 
                    borderColor: '#D32F2F',
                    borderWidth: 2,
                    borderRadius: tipoGrafico === 'bar' ? 4 : 0,
                    tension: 0.3
                }]
            },
            options: { ...sharedOptions, plugins: { ...sharedOptions.plugins, title: { display: true, text: 'Inadimplência por Mês' } } }
        });
    }

    let isBuscaAberto = false;
    function clickFiltroTodos() {
        if(filtroViewAtual !== 'todos') {
            setFiltroView('todos');
        } else {
            isBuscaAberto = !isBuscaAberto;
            let input = document.getElementById('inputBuscaNome');
            if(isBuscaAberto) {
                input.style.display = 'inline-block';
                input.focus();
            } else {
                input.style.display = 'none';
                input.value = '';
                renderizarLista();
            }
        }
    }

    function setFiltroView(view) {
        filtroViewAtual = view;
        document.getElementById('chipTodos').classList.remove('active');
        document.getElementById('chipPendentes').classList.remove('active');
        document.getElementById('chipVencimentos').classList.remove('active');
        
        if(view === 'todos') document.getElementById('chipTodos').classList.add('active');
        if(view === 'pendentes') document.getElementById('chipPendentes').classList.add('active');
        if(view === 'vencimentos') document.getElementById('chipVencimentos').classList.add('active');
        renderizarLista();
    }

    function checarAlertasCarro(carro) {
        let alertas = [];
        if(!carro.ativo) return alertas;
        let hoje = new Date();
        hoje.setHours(0,0,0,0);
        
        let confAlertas = db.configGerais.alertas || {};
        
        let checkData = (dataStr, nome, confKey, genero) => {
            if(!dataStr || !confAlertas[confKey] || !confAlertas[confKey].ativo) return;
            if(!isDataISOValida(dataStr)) {
                alertas.push(`<span class="alert-chip-home alert-expired">🚨${nome}: data inválida</span>`);
                return;
            }
            let d = new Date(dataStr + "T00:00:00");
            let diffDias = Math.ceil((d - hoje) / (1000 * 60 * 60 * 24));
            let diasAviso = parseInt(confAlertas[confKey].dias) || 7;
            if(diffDias < 0) {
                let diasPassados = Math.abs(diffDias);
                let labelDias = diasPassados === 1 ? 'dia' : 'dias';
                alertas.push(`<span class="alert-chip-home alert-expired">🚨${nome}: há ${diasPassados} ${labelDias}</span>`);
            } else if(diffDias === 0) {
                alertas.push(`<span class="alert-chip-home alert-warning">⚠️${nome}: em 0 dias</span>`);
            } else if(diffDias <= diasAviso) {
                let labelDias = diffDias === 1 ? 'dia' : 'dias';
                alertas.push(`<span class="alert-chip-home alert-warning">⚠️${nome}: em ${diffDias} ${labelDias}</span>`);
            }
        };
        
        checkData(carro.dataLaudo, "Laudo", "laudo", "o");
        checkData(carro.dataSeguro, "Seguro", "seguro", "o");
        checkData(carro.dataLicenca, "Licença", "licenca", "a");
        if(carro.dataCadastro && !isDataISOValida(carro.dataCadastro)) {
            alertas.push(`<span class="alert-chip-home alert-expired">🚨Cadastro: data inválida</span>`);
        }
        return alertas;
    }

    function isMesPago(c, mesRef) {
        if(!c.pagamentos) return false;
        if(c.pagamentos.some(p => !p.parcial && pagamentoRefereMes(p, mesRef))) return true;
        let esperado = calcularValorEsperado(c, mesRef);
        return esperado > 0 && calcularParciaisMes(c, mesRef) >= esperado;
    }

    function pagamentoRefereMes(p, mesRef) {
        return (p.mesesRef && p.mesesRef.includes(mesRef)) || p.mesAno === mesRef;
    }

    function calcularParciaisMes(c, mesRef) {
        if(!c.pagamentos) return 0;
        return c.pagamentos
            .filter(p => p.parcial && pagamentoRefereMes(p, mesRef))
            .reduce((acc, p) => acc + (parseFloat(p.valorPago) || 0), 0);
    }

    function calcularValorPendenteMes(c, mesRef) {
        if(isMesPago(c, mesRef)) return 0;
        let esperado = calcularValorEsperado(c, mesRef);
        let parciais = calcularParciaisMes(c, mesRef);
        return Math.max(0, esperado - parciais);
    }

    function getStatusPagamentoMes(c, mesRef) {
        const valorEsperado = calcularValorEsperado(c, mesRef);
        const valorPendente = calcularValorPendenteMes(c, mesRef);
        const pago = isMesPago(c, mesRef);
        const labelDia = getLabelDiaVencimento(c, mesRef);
        if(valorEsperado <= 0) {
            return { tipo: 'neutral', html: `<span>Sem valor</span><strong>${labelDia}</strong>`, valorPendente, pago };
        }
        if(pago) {
            return { tipo: 'ok', html: `<span>Pago</span><strong>${labelDia}</strong>`, valorPendente: 0, pago: true };
        }
        if(!isDataVencida(c, mesRef)) {
            return { tipo: 'warning', html: `<span>Vence</span><strong>${labelDia}</strong>`, valorPendente, pago: false };
        }
        return { tipo: 'pendente', html: `<span>Falta R$ ${formatMoeda(valorPendente)}</span><strong>${labelDia}</strong>`, valorPendente, pago: false };
    }

    function getAvatarColor(c, temAlerta) {
        let owesPast = false;
        let earliestCar = null;
        (c.carros || []).forEach(car => {
            if(car.ativo) {
                let dataBase = `${getMesCadastroCobranca(car)}-01`;
                if(!earliestCar || dataBase < earliestCar) earliestCar = dataBase;
            }
        });
        if(earliestCar) {
            let startMes = earliestCar.substring(0,7);
            let endMes = getPastMonthStr();
            if(startMes <= endMes) {
                let curr = new Date(startMes + '-01T00:00:00');
                let end = new Date(endMes + '-01T00:00:00');
                while(curr <= end) {
                    let m = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`;
                    if(calcularValorPendenteMes(c, m) > 0) { owesPast = true; break; }
                    curr.setMonth(curr.getMonth() + 1);
                }
            }
        }
        if(owesPast) return '#D32F2F'; // Vermelho
        if(temAlerta) return '#F9A825'; // Laranja claro
        return 'var(--theme-base)'; // Verde
    }

    function renderizarLista() {
        const lista = document.getElementById('listaPrincipal');
        let html = '';
        let mesRef = document.getElementById('filtroMesGeral').value;
        let buscaNome = document.getElementById('inputBuscaNome').value.toLowerCase();

        let contribs = [...db.contribuintes].sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));
        let lastLetra = '';

        contribs.forEach(c => {
            if(estaArquivadoContribuinte(c)) return;
            let carrosAtivos = (c.carros || []).filter(car=>car.ativo).length;
            if (carrosAtivos === 0) return; // Nao mostra se nao tem carro ativo

            if (buscaNome && !(c.nome || '').toLowerCase().includes(buscaNome)) return;

            let valorEsperado = calcularValorEsperado(c, mesRef);
            let valorPendente = calcularValorPendenteMes(c, mesRef);
            let statusMes = getStatusPagamentoMes(c, mesRef);
            let pendente = valorPendente > 0;

            let alertasArr = [];
            (c.carros || []).forEach(car => { alertasArr = alertasArr.concat(checarAlertasCarro(car)); });
            let temAlerta = alertasArr.length > 0;

            if(filtroViewAtual === 'pendentes' && !pendente) return;
            if(filtroViewAtual === 'vencimentos' && !temAlerta) return;

            let avatarCor = getAvatarColor(c, temAlerta);

            let statusClasse = statusMes.tipo === 'ok' ? 'status-ok' : statusMes.tipo === 'warning' ? 'status-warning' : statusMes.tipo === 'pendente' ? 'status-pendente' : '';
            let statusPgtoHtml = `<span class="status-badge ${statusClasse} status-payment-split">${statusMes.html}</span>`;
            
            let emojisCarros = '';
            (c.carros || []).filter(car=>car.ativo).forEach(car => {
                let catObj = db.categorias.find(x => x.nome === car.categoria);
                let emojiCarro = catObj && catObj.emoji ? catObj.emoji : '🚗';
                let tickAtualizado = car.cadastroAtualizado ? '<span class="vehicle-updated-tick">✅</span>' : '';
                emojisCarros += `<span class="vehicle-emoji-wrap">${escapeHTML(emojiCarro)}${tickAtualizado}</span>`;
            });
            let subtitleText = carrosAtivos > 0 
                ? `<div class="item-vehicles">${emojisCarros}</div>` 
                : `<div class="item-subtitle" style="font-size:11px;">Nenhum veículo ativo</div>`;
            
            let alertasHtml = '';
            if(temAlerta) alertasHtml = alertasArr.join('');
            
            let primeiraLetra = (c.nome || '?').charAt(0).toUpperCase();
            let idLetra = '';
            if(primeiraLetra !== lastLetra && buscaNome === '') {
                idLetra = `id="letra-${primeiraLetra}"`;
                lastLetra = primeiraLetra;
            }

            html += `<li class="item" onclick="abrirAcoesContribuinte('${c.id}')" ${idLetra}>
                <div style="display: flex; align-items: center; width: 100%;">
                    <div class="item-avatar" style="background-color:${avatarCor};">${primeiraLetra}</div>
                    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-right: 5px;">
                        <div class="item-title">${escapeHTML(c.nome)}</div>
                        ${subtitleText}
                    </div>
                    <div class="item-side-info">
                        ${temAlerta ? `<div class="alert-home-box"><div class="alert-home-text">${alertasHtml}</div></div>` : ''}
                        <div class="status-home-box">${statusPgtoHtml}</div>
                    </div>
                </div>
            </li>`;
        });

        if(html === '') html = `<li style="padding: 20px; text-align: center; color: #999;">Nenhum contribuinte encontrado.</li>`;
        lista.innerHTML = html;
    }

    function adicionarMeses(mesRef, qtd) {
        let d = new Date(`${mesRef}-01T00:00:00`);
        d.setMonth(d.getMonth() + qtd);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }

    function formatMesManual(mesRef) {
        const [ano, mes] = mesRef.split('-');
        return `${getAbrevMes(mes)}/${String(ano).slice(2)}`;
    }

    function setLabelsRelatorioManual() {
        let ini = document.getElementById('relManualIni').value;
        let fim = document.getElementById('relManualFim').value;
        if(ini) document.getElementById('lblRelManualIni').innerText = formatMesManual(ini);
        if(fim) document.getElementById('lblRelManualFim').innerText = formatMesManual(fim);
    }

    function abrirRelatorioManual() {
        const ini = getMesAtualSTR();
        const fim = adicionarMeses(ini, 5);
        document.getElementById('relManualIni').value = ini;
        document.getElementById('relManualFim').value = fim;
        setLabelsRelatorioManual();
        gerarRelatorioManual();
        abrirModal('modalRelatorioManual');
    }

    function gerarRelatorioManual() {
        let ini = document.getElementById('relManualIni').value || getMesAtualSTR();
        let fim = document.getElementById('relManualFim').value || ini;
        if(fim < ini) {
            fim = ini;
            document.getElementById('relManualFim').value = fim;
        }
        let meses = getMesesRange(ini, fim);
        if(meses.length > 12) {
            meses = meses.slice(0, 12);
            fim = meses[meses.length - 1];
            document.getElementById('relManualFim').value = fim;
        }
        setLabelsRelatorioManual();

        const contribs = [...db.contribuintes]
            .filter(c => !estaArquivadoContribuinte(c) && (c.carros || []).some(car => car.ativo))
            .sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));
        const cabecalhoMeses = meses.map(m => `<th class="pg-col">${escapeHTML(formatMesManual(m))}</th>`).join('');
        const linhas = contribs.map(c => `
            <tr>
                <td class="manual-row-name">${escapeHTML(c.nome || 'Sem nome')}</td>
                <td class="due-col">${String(getDiaVencimento(c)).padStart(2, '0')}</td>
                ${meses.map(() => '<td class="manual-pg-cell"></td>').join('')}
            </tr>
        `).join('');

        const colspanVazio = meses.length + 2;
        document.getElementById('printRelatorioManual').innerHTML = `
            <div class="manual-report-sheet">
                <div class="manual-report-head">
                    <h3>Lista de Acompanhamento</h3>
                    <span>${escapeHTML(formatMesManual(ini))} a ${escapeHTML(formatMesManual(fim))}</span>
                </div>
                <table class="manual-report-table">
                    <thead>
                        <tr>
                            <th class="name-col">Nome</th>
                            <th class="due-col">Dia</th>
                            ${cabecalhoMeses}
                        </tr>
                    </thead>
                    <tbody>${linhas || `<tr><td colspan="${colspanVazio}">Nenhum contribuinte ativo.</td></tr>`}</tbody>
                </table>
            </div>
        `;
    }

    function imprimirRelatorioManual() {
        gerarRelatorioManual();
        window.print();
    }

    function abrirGerenciarContribuintes() {
        fecharModal('modalPainelUnificado');
        document.getElementById('tituloListagem').innerText = "Gerenciar Contribuintes";
        document.getElementById('btnNovoListagem').onclick = () => abrirFormContribuinte(null);
        document.getElementById('btnVoltarListagem').onclick = () => { fecharModal('modalListagem'); abrirModal('modalPainelUnificado'); };
        document.getElementById('boxAcoesExtrasExcel').style.display = 'none';
        document.getElementById('inputBuscaGerenciarContrib').style.display = 'block';
        document.getElementById('inputBuscaGerenciarContrib').value = '';
        renderGerenciarContribuintesLista();
        abrirModal('modalListagem');
    }

    function renderGerenciarContribuintesLista() {
        let busca = (document.getElementById('inputBuscaGerenciarContrib')?.value || '').toLowerCase();
        let htmlLista = '';
        let contribs = [...db.contribuintes].sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));
        contribs.forEach((c) => { 
            if(busca && !(c.nome || '').toLowerCase().includes(busca)) return;
            let carrosQtd = (c.carros || []).length;
            let arquivado = estaArquivadoContribuinte(c);
            htmlLista += `<div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>${escapeHTML(c.nome || 'Sem Nome')}</strong><br><small style="color:#666;">${carrosQtd} Veículo(s) | Total Base: R$ ${escapeHTML(c.valorTotal || '0,00')}</small>${arquivado ? '<br><span class="archived-badge">Arquivado</span>' : ''}</div>
                <div style="flex-shrink:0; margin-left:10px;">
                    <button style="background:none; border:none; font-size:20px; cursor:pointer;" onclick="abrirFormContribuinte('${c.id}')">✏️</button>
                    <button class="archive-btn" title="${arquivado ? 'Restaurar' : 'Arquivar'}" onclick="alternarArquivoContribuinte('${c.id}')">${arquivado ? '↩️' : '📦'}</button>
                    <button class="delete-small-btn" title="Excluir" onclick="excluirContribuinte('${c.id}')">🗑️</button>
                </div>
            </div>`; 
        });
        document.getElementById('conteudoListagem').innerHTML = htmlLista || '<div style="padding:20px; text-align:center; color:#999;">Nenhum contribuinte encontrado.</div>';
    }

    let oldFecharModal = fecharModal;
    fecharModal = function(id) {
        if(id === 'modalListagem') {
            document.getElementById('boxAcoesExtrasExcel').style.display = 'none';
            document.getElementById('inputBuscaGerenciarContrib').style.display = 'none';
        }
        oldFecharModal(id);
    }

    function alternarArquivoContribuinte(id) {
        let c = db.contribuintes.find(x => x.id === id);
        if(!c) return;
        let arquivar = !estaArquivadoContribuinte(c);
        let msg = arquivar ? `Arquivar ${c.nome}? Ele deixará de aparecer na tela inicial.` : `Restaurar ${c.nome}?`;
        if(!confirm(msg)) return;
        c.arquivado = arquivar;
        c.ativo = !arquivar;
        tocarRegistro(c);
        registrarAuditoria(arquivar ? 'Contribuinte arquivado' : 'Contribuinte restaurado', c.nome || id);
        salvarBanco();
        renderGerenciarContribuintesLista();
        renderizarLista();
    }

    function excluirContribuinte(id) {
        let c = db.contribuintes.find(x => x.id === id);
        if(!c) return;
        let frase = prompt(`Para excluir ${c.nome || 'este contribuinte'}, digite: quero excluir`);
        if((frase || '').trim().toLowerCase() !== 'quero excluir') {
            alert("Exclusão cancelada. A frase digitada não confere.");
            return;
        }
        (c.pagamentos || []).forEach(pg => registrarExclusao('pagamentos', pg.id));
        (c.carros || []).forEach(car => registrarExclusao('carros', car.id));
        registrarExclusao('contribuintes', id);
        db.contribuintes = db.contribuintes.filter(x => x.id !== id);
        registrarAuditoria('Contribuinte excluído', c.nome || id);
        salvarBanco();
        renderGerenciarContribuintesLista();
        renderizarLista();
    }

    function recalcularTotalContribuinteRegistro(c) {
        if(!c) return;
        let somaCarros = (c.carros || []).filter(car => car.ativo).reduce((acc, car) => acc + parseMoeda(car.valor), 0);
        let desc = parseMoeda(c.desconto || "0");
        c.valorTotal = formatMoeda(Math.max(0, somaCarros - desc));
        tocarRegistro(c);
    }

    function abrirFormContribuinte(id, fromAcoes = false) {
        fecharModal('modalListagem');
        fecharModal('modalAcoesContribuinte');
        
        document.getElementById('contFromAcoes').value = fromAcoes ? 'true' : 'false';
        tempTelefones = [];
        tempCarros = [];
        tempCarrosExcluidos = [];
        
        if(id) {
            let c = db.contribuintes.find(x => x.id === id);
            document.getElementById('contId').value = c.id;
            document.getElementById('contNome').value = c.nome || '';
            document.getElementById('contDiaVencimento').value = getDiaVencimento(c);
            document.getElementById('contDesconto').value = c.desconto || '';
            if(c.telefones) tempTelefones = [...c.telefones];
            if(c.carros) tempCarros = JSON.parse(JSON.stringify(c.carros));
        } else {
            document.getElementById('contId').value = '';
            document.getElementById('contNome').value = '';
            document.getElementById('contDiaVencimento').value = DIA_VENCIMENTO_PADRAO;
            document.getElementById('contDesconto').value = '';
        }
        renderListaTelefones();
        renderListaCarros();
        abrirModal('modalFormContribuinte');
    }

    function cancelarFormContribuinte() {
        fecharModal('modalFormContribuinte');
        if(document.getElementById('contFromAcoes').value === 'true') {
            abrirModal('modalAcoesContribuinte');
        } else {
            abrirGerenciarContribuintes();
        }
    }

    function calcTotalContribuinte() {
        let somaCarros = tempCarros.filter(c => c.ativo).reduce((acc, c) => acc + parseMoeda(c.valor), 0);
        let desc = parseMoeda(document.getElementById('contDesconto').value);
        document.getElementById('contValor').value = formatMoeda(Math.max(0, somaCarros - desc));
    }

    function validarDatasCarrosTemp() {
        const campos = [
            ['dataLaudo', 'Laudo'],
            ['dataSeguro', 'Seguro'],
            ['dataLicenca', 'Licença'],
            ['dataCadastro', 'Cadastro']
        ];
        for(let car of tempCarros) {
            for(let [chave, label] of campos) {
                if(car[chave] && !isDataISOValida(car[chave])) {
                    alert(`O veículo ${car.placa || 'sem placa'} está com Data ${label} inválida. Corrija antes de salvar.`);
                    return false;
                }
            }
        }
        return true;
    }

    function renderListaTelefones() {
        const box = document.getElementById('listaTelefones');
        if(tempTelefones.length === 0) { box.innerHTML = '<div style="color:#999; font-size:12px; text-align:center;">Nenhum telefone.</div>'; return; }
        box.innerHTML = tempTelefones.map((t, i) => `<div class="list-item-config"><span>${escapeHTML(t)}</span><button onclick="removerTelefone(${i})">X</button></div>`).join('');
    }
    function addTelefone() { let v = document.getElementById('novoTelInput').value.trim(); if(v) { tempTelefones.push(v); document.getElementById('novoTelInput').value = ''; renderListaTelefones(); } }
    function removerTelefone(idx) { tempTelefones.splice(idx, 1); renderListaTelefones(); }

    function salvarContribuinte() {
        let nome = document.getElementById('contNome').value.trim();
        if(!nome) return alert("Digite o nome.");
        if(!validarDatasCarrosTemp()) return;
        
        let id = document.getElementById('contId').value || 'cont_' + Date.now();
        const anterior = db.contribuintes.find(x=>x.id===id);
        tempCarrosExcluidos.forEach(carId => registrarExclusao('carros', carId));
        let novo = {
            id: id,
            nome: nome,
            telefones: tempTelefones,
            diaVencimento: normalizarDiaVencimento(document.getElementById('contDiaVencimento').value),
            desconto: document.getElementById('contDesconto').value,
            valorTotal: document.getElementById('contValor').value,
            carros: tempCarros,
            pagamentos: anterior?.pagamentos || [],
            arquivado: anterior?.arquivado || false,
            ativo: anterior ? anterior.ativo !== false : true,
        };
        tocarRegistro(novo);
        
        const idx = db.contribuintes.findIndex(x => x.id === id);
        if(idx >= 0) db.contribuintes[idx] = novo; else db.contribuintes.push(novo);
        registrarAuditoria(idx >= 0 ? 'Contribuinte alterado' : 'Contribuinte cadastrado', nome);
        
        salvarBanco();
        
        if(document.getElementById('contFromAcoes').value === 'true') {
            fecharModal('modalFormContribuinte');
            abrirAcoesContribuinte(id);
        } else {
            fecharModal('modalFormContribuinte');
            abrirGerenciarContribuintes();
        }
        renderizarLista();
    }

    function renderListaCarros() {
        const box = document.getElementById('listaCarros');
        if(tempCarros.length === 0) { box.innerHTML = '<div style="color:#999; font-size:12px; text-align:center;">Nenhum carro vinculado.</div>'; calcTotalContribuinte(); return; }
        let html = '';
        tempCarros.forEach((c, i) => {
            let catObj = db.categorias.find(x => x.nome === c.categoria);
            let emj = catObj && catObj.emoji ? catObj.emoji : '🚗';
            let badge = c.ativo ? '<span class="vehicle-status active">Ativo</span>' : '<span class="vehicle-status archived">Bloqueado</span>';
            html += `<div class="list-item-config vehicle-temp-card">
                <div class="vehicle-temp-main">
                    <div class="vehicle-temp-title"><span style="font-size:16px;">${escapeHTML(emj)}</span> <strong>${escapeHTML(c.placa)}</strong> - ${escapeHTML(c.ano)}</div>
                    <small>${escapeHTML(c.categoria)} | R$ ${escapeHTML(c.valor)}</small>
                </div>
                <div class="vehicle-temp-actions">${badge}<button class="btn-edit-small" onclick="abrirFormCarro(${i})">✏️</button></div>
            </div>`;
        });
        box.innerHTML = html;
        calcTotalContribuinte();
    }

    function abrirCarroFromAcoes(carIdx) {
        let contId = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === contId);
        tempCarros = c.carros ? JSON.parse(JSON.stringify(c.carros)) : [];
        tempCarrosExcluidos = [];
        abrirFormCarro(carIdx);
    }

    function abrirFormCarro(idx) {
        let selectCat = document.getElementById('carCategoria');
        selectCat.innerHTML = '<option value="">-- Selecione --</option>';
        db.categorias.forEach(c => selectCat.innerHTML += `<option value="${escapeHTML(c.nome)}">${escapeHTML(c.emoji || '🚗')} ${escapeHTML(c.nome)}</option>`);

        if(idx !== null) {
            let c = tempCarros[idx];
            document.getElementById('carroEditId').value = idx;
            document.getElementById('carPlaca').value = c.placa || '';
            document.getElementById('carAno').value = c.ano || '';
            document.getElementById('carCategoria').value = c.categoria || '';
            document.getElementById('carValor').value = c.valor || '';
            document.getElementById('carLaudo').value = c.dataLaudo || '';
            document.getElementById('carSeguro').value = c.dataSeguro || '';
            document.getElementById('carLicenca').value = c.dataLicenca || '';
            document.getElementById('carCadastro').value = c.dataCadastro || getHojeSTR();
            document.getElementById('carCadastroAtualizado').checked = !!c.cadastroAtualizado;
            document.getElementById('carArquivado').checked = !c.ativo;
            document.getElementById('carMotivo').value = c.motivoArquivamento || '';
            let btnExcluirCarro = document.getElementById('btnExcluirCarro');
            if(btnExcluirCarro) btnExcluirCarro.style.display = 'inline-flex';
        } else {
            document.getElementById('carroEditId').value = '';
            document.getElementById('carPlaca').value = '';
            document.getElementById('carAno').value = '';
            document.getElementById('carCategoria').value = '';
            document.getElementById('carValor').value = '';
            document.getElementById('carLaudo').value = '';
            document.getElementById('carSeguro').value = '';
            document.getElementById('carLicenca').value = '';
            document.getElementById('carCadastro').value = getHojeSTR();
            document.getElementById('carCadastroAtualizado').checked = false;
            document.getElementById('carArquivado').checked = false;
            document.getElementById('carMotivo').value = '';
            let btnExcluirCarro = document.getElementById('btnExcluirCarro');
            if(btnExcluirCarro) btnExcluirCarro.style.display = 'none';
        }
        toggleMotivoArquivamento();
        verificarDatasCarroUI();
        abrirModal('modalFormCarro');
    }

    function verificarDatasCarroUI() {
        let hoje = new Date();
        hoje.setHours(0,0,0,0);
        let confAlertas = db.configGerais.alertas || { laudo:{dias:7}, seguro:{dias:7}, licenca:{dias:7} };

        let check = (inputId, avisoId, nome, confKey, genero) => {
            let val = document.getElementById(inputId).value;
            let avisoBox = document.getElementById(avisoId);
            let inputEl = document.getElementById(inputId);
            if(!val) {
                avisoBox.style.display = 'none';
                inputEl.style.color = 'inherit';
                return;
            }
            if(!isDataISOValida(val)) {
                avisoBox.innerHTML = `${nome}: data inválida`;
                avisoBox.style.display = 'block';
                inputEl.style.color = '#D32F2F';
                return;
            }
            let d = new Date(val + "T00:00:00");
            let diffDias = Math.ceil((d - hoje) / (1000 * 60 * 60 * 24));
            let diasAviso = parseInt(confAlertas[confKey].dias) || 7;
            let vencidoWord = genero === 'a' ? 'vencida' : 'vencido';

            if(diffDias < 0) {
                let diasPassados = Math.abs(diffDias);
                avisoBox.innerHTML = `${nome} ${vencidoWord} há ${diasPassados} dias`;
                avisoBox.style.display = 'block';
                inputEl.style.color = '#D32F2F'; // Vermelho
            } else if(diffDias === 0) {
                avisoBox.innerHTML = `${nome} vence HOJE`;
                avisoBox.style.display = 'block';
                inputEl.style.color = '#E65100'; // Laranja
            } else if(diffDias <= diasAviso) {
                avisoBox.innerHTML = `${nome} vence em ${diffDias} dias`;
                avisoBox.style.display = 'block';
                inputEl.style.color = '#E65100';
            } else {
                avisoBox.style.display = 'none';
                inputEl.style.color = 'inherit';
            }
        };

        check('carLaudo', 'avisoCarLaudo', 'Laudo', 'laudo', 'o');
        check('carSeguro', 'avisoCarSeguro', 'Seguro', 'seguro', 'o');
        check('carLicenca', 'avisoCarLicenca', 'Licença', 'licenca', 'a');
        let cadastroVal = document.getElementById('carCadastro').value;
        let avisoCadastro = document.getElementById('avisoCarCadastro');
        let inputCadastro = document.getElementById('carCadastro');
        if(cadastroVal && !isDataISOValida(cadastroVal)) {
            avisoCadastro.innerHTML = 'Cadastro: data inválida';
            avisoCadastro.style.display = 'block';
            inputCadastro.style.color = '#D32F2F';
        } else {
            avisoCadastro.style.display = 'none';
            inputCadastro.style.color = 'inherit';
        }
    }

    function toggleMotivoArquivamento() {
        let isArq = document.getElementById('carArquivado').checked;
        document.getElementById('boxMotivoArqv').style.display = isArq ? 'block' : 'none';
    }

    function autoFillValorCarro() {
        let catNome = document.getElementById('carCategoria').value;
        let cat = db.categorias.find(x => x.nome === catNome);
        if(cat && cat.valor) {
            document.getElementById('carValor').value = cat.valor;
        }
    }

    function salvarCarroTemp() {
        let placa = document.getElementById('carPlaca').value.trim().toUpperCase();
        if(!placa) return alert("Digite a Placa.");
        
        let idx = document.getElementById('carroEditId').value;
        let isArq = document.getElementById('carArquivado').checked;
        let motivo = document.getElementById('carMotivo').value.trim();
        
        if(isArq && !motivo) return alert("Por favor, informe o motivo do bloqueio.");
        if(!validarDataCampo('carLaudo', 'Laudo')) return;
        if(!validarDataCampo('carSeguro', 'Seguro')) return;
        if(!validarDataCampo('carLicenca', 'Licença')) return;
        if(!validarDataCampo('carCadastro', 'Cadastro', true)) return;

        let novoCar = {
            id: (idx !== '' && tempCarros[idx].id) ? tempCarros[idx].id : 'car_'+Date.now(),
            placa: placa,
            ano: document.getElementById('carAno').value,
            categoria: document.getElementById('carCategoria').value,
            valor: document.getElementById('carValor').value,
            dataLaudo: document.getElementById('carLaudo').value,
            dataSeguro: document.getElementById('carSeguro').value,
            dataLicenca: document.getElementById('carLicenca').value,
            dataCadastro: document.getElementById('carCadastro').value,
            cadastroAtualizado: document.getElementById('carCadastroAtualizado').checked,
            ativo: !isArq,
            motivoArquivamento: isArq ? motivo : ''
        };
        tocarRegistro(novoCar);

        if(idx !== '') tempCarros[idx] = novoCar;
        else tempCarros.push(novoCar);

        let isFromAcoes = document.getElementById('modalAcoesContribuinte').style.display === 'flex';
        if (isFromAcoes) {
            let contId = document.getElementById('acoesContId').value;
            let c = db.contribuintes.find(x => x.id === contId);
            c.carros = tempCarros;
            
            let somaCarros = c.carros.filter(car => car.ativo).reduce((acc, car) => acc + parseMoeda(car.valor), 0);
            let desc = parseMoeda(c.desconto || "0");
            c.valorTotal = formatMoeda(Math.max(0, somaCarros - desc));
            tocarRegistro(c);
            registrarAuditoria(idx !== '' ? 'Veículo alterado' : 'Veículo cadastrado', `${c.nome || ''} - ${placa}`);

            salvarBanco();
            abrirAcoesContribuinte(contId); 
        } else {
            renderListaCarros();
        }
        
        fecharModal('modalFormCarro');
    }

    // 6. PAGAMENTOS E AÇÕES
    function enviarChavePixWhatsApp() {
        let c = db.contribuintes.find(x => x.id === document.getElementById('acoesContId').value);
        if(!c || !c.telefones || c.telefones.length === 0) return alert('O contribuinte não possui nenhum telefone (WhatsApp) cadastrado.');
        if(!db.cooperativa.pixList || db.cooperativa.pixList.length === 0) return alert("Nenhuma chave cadastrada nos dados da Cooperativa!");

        if(db.cooperativa.pixList.length === 1) {
            enviarPixSelecionado(0);
            return;
        }

        let box = document.getElementById('listaPixEnvio');
        box.innerHTML = db.cooperativa.pixList.map((p, i) => `
            <button class="pix-choice-card" onclick="enviarPixSelecionado(${i})">
                <span>${escapeHTML(p.tipo)}</span>
                <b>${escapeHTML(p.chave)}</b>
                <small>Beneficiário: ${escapeHTML(p.beneficiario)}</small>
            </button>
        `).join('');
        abrirModal('modalEscolherPix');
    }

    function enviarPixSelecionado(idx) {
        let c = db.contribuintes.find(x => x.id === document.getElementById('acoesContId').value);
        let p = db.cooperativa.pixList[idx];
        if(!c || !p) return;

        let num = c.telefones[0].replace(/\D/g, '');
        let fan = db.cooperativa.fantasia || "Cooperativa";
        let txt = `> PIX da *${fan}:*\n*Tipo:* ${p.tipo}\n*Chave:* ${p.chave}\n*Beneficiário:* ${p.beneficiario}`;
        fecharModal('modalEscolherPix');
        window.open(`https://wa.me/55${num}?text=${encodeURIComponent(txt)}`, '_blank');
    }

    function toggleMultiMes() {
        let isMulti = document.getElementById('switchMultiMes').checked;
        document.getElementById('boxSingleMes').classList.toggle('open', !isMulti);
        document.getElementById('boxMultiMes').classList.toggle('open', isMulti);
        document.getElementById('avisoErroMulti').style.display = 'none';
        if(isMulti) calcPgtoMulti(false);
    }

    function atualizarStatusSingleAcoes() {
        let id = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === id);
        let mesRef = document.getElementById('pgMesRefSingle').value; 
        if(!mesRef) return;
        
        let partes = mesRef.split('-');
        document.getElementById('lblMesAcoes').innerText = `${partes[1]}/${partes[0]}`;
        
        renderizarStatusPagamento(c, mesRef);
    }

    function abrirAcoesContribuinte(id) {
        let c = db.contribuintes.find(x => x.id === id);
        if(!c) return;
        document.getElementById('acoesContId').value = id;
        document.getElementById('tituloAcoesContribuinte').innerText = c.nome;
        
        // Render Botões Whatsapp
        let waBox = document.getElementById('boxWAAcoes');
        waBox.innerHTML = '';
        if(c.telefones && c.telefones.length > 0) {
            let primeiro = c.telefones[0];
            let num = primeiro.replace(/\D/g, '');
            waBox.innerHTML = `<button class="btn-whatsapp" onclick="window.open('https://wa.me/55${num}','_blank')">
                <img src="whatsapp.png" style="width:30px; height:30px; filter:brightness(0) invert(1);"> Falar no WhatsApp
            </button>`;
        }

        let mesRef = document.getElementById('filtroMesGeral').value;
        let partes = mesRef.split('-');
        document.getElementById('lblMesAcoes').innerText = `${partes[1]}/${partes[0]}`;
        
        document.getElementById('switchMultiMes').checked = false;
        toggleMultiMes();

        document.getElementById('pgDataSingle').value = getHojeSTR();
        document.getElementById('pgMesRefSingle').value = mesRef;
        document.getElementById('lblPgMesRefSingle').innerText = `${getExtensoMes(partes[1])} ${partes[0]}`;

        document.getElementById('pgIni').value = mesRef;
        document.getElementById('lblPgIni').innerText = `${getExtensoMes(partes[1])} ${partes[0]}`;
        document.getElementById('pgFim').value = mesRef;
        document.getElementById('lblPgFim').innerText = `${getExtensoMes(partes[1])} ${partes[0]}`;
        
        document.getElementById('pgDescontoMulti').value = '';
        let inputDescPctMulti = document.getElementById('pgDescontoPctMulti');
        if(inputDescPctMulti) inputDescPctMulti.value = '';
        document.getElementById('pgDataMulti').value = getHojeSTR();
        document.getElementById('avisoErroMulti').style.display = 'none';
        
        renderizarStatusPagamento(c, mesRef);
        renderizarHistPagamentos(c);
        renderListaCarrosAcoes(c);
        
        abrirModal('modalAcoesContribuinte');
    }

    function renderListaCarrosAcoes(c) {
        let boxCarros = document.getElementById('listaCarrosAcoes');
        boxCarros.innerHTML = '';
        if(c.carros && c.carros.length > 0) {
            c.carros.forEach((car, idx) => {
                let catObj = db.categorias.find(x => x.nome === car.categoria);
                let emj = catObj && catObj.emoji ? catObj.emoji : '🚗';
                let alertas = checarAlertasCarro(car);
                let status = car.ativo ? '<span class="vehicle-status active">Ativo</span>' : '<span class="vehicle-status archived">Bloqueado</span>';
                boxCarros.innerHTML += `<button class="vehicle-action-card" onclick="abrirCarroFromAcoes(${idx})">
                    <div class="vehicle-action-head">
                        <span><b>${escapeHTML(emj)} ${escapeHTML(car.placa)}</b> ${escapeHTML(car.ano || '')}</span>
                        ${status}
                    </div>
                    <div class="vehicle-action-meta">${escapeHTML(car.categoria || 'Sem categoria')} | R$ ${escapeHTML(car.valor || '0,00')}</div>
                    ${alertas.length ? `<div class="vehicle-alerts">${alertas.join('')}</div>` : ''}
                </button>`;
            });
        } else {
            boxCarros.innerHTML = '<div style="color:#999; font-size:13px; text-align:center; width:100%;">Nenhum veículo vinculado.</div>';
        }
    }

    function renderizarStatusPagamento(c, mesRef) {
        let valorEsperado = calcularValorEsperado(c, mesRef);
        let valorPendente = calcularValorPendenteMes(c, mesRef);
        let pago = isMesPago(c, mesRef);
        let statusMes = getStatusPagamentoMes(c, mesRef);
        
        let box = document.getElementById('boxStatusPagamento');
        let pgSingle = document.getElementById('pgValorSingle');
        let pgSingleBox = document.getElementById('pgValorSingleBox');
        let btnSingle = document.getElementById('btnRegistrarSingle');
        let vencimentoSingle = document.getElementById('pgVencimentoSingle');
        let vencimentoMulti = document.getElementById('pgVencimentoMulti');
        let labelVencimento = getLabelDiaVencimento(c, mesRef);
        if(vencimentoSingle) vencimentoSingle.innerText = labelVencimento;
        if(vencimentoMulti) vencimentoMulti.innerText = labelVencimento;
        box.style.display = 'block';
        box.innerHTML = `<div class="payment-status-value ${statusMes.tipo === 'ok' ? 'paid' : statusMes.tipo === 'warning' ? 'warning' : statusMes.tipo === 'pendente' ? 'pending' : 'neutral'}">${statusMes.html}</div>`;
        pgSingle.classList.remove('amount-due-input', 'amount-paid-input', 'amount-neutral-input');
        if(pgSingleBox) pgSingleBox.classList.remove('amount-due-affix', 'amount-paid-affix', 'amount-neutral-affix');
        btnSingle.classList.remove('payment-disabled-btn');
        btnSingle.disabled = false;

        if(!pago && valorPendente > 0) {
            pgSingle.classList.add('amount-due-input');
            if(pgSingleBox) pgSingleBox.classList.add('amount-due-affix');
            pgSingle.value = formatMoedaInput(valorPendente);
            pgSingle.dataset.esperado = valorPendente;
            pgSingle.readOnly = false;
            btnSingle.innerHTML = '<span class="payment-btn-emoji">💲</span><span>Registrar Pagamento do Mês</span>';
        } else if (pago) {
            pgSingle.classList.add('amount-paid-input');
            if(pgSingleBox) pgSingleBox.classList.add('amount-paid-affix');
            pgSingle.value = formatMoedaInput(valorEsperado);
            pgSingle.dataset.esperado = valorEsperado;
            pgSingle.readOnly = true;
            btnSingle.innerHTML = '<span class="payment-btn-emoji">✅</span><span>Mês já foi Pago</span>';
            btnSingle.disabled = true;
            btnSingle.classList.add('payment-disabled-btn');
        } else {
            pgSingle.classList.add('amount-neutral-input');
            if(pgSingleBox) pgSingleBox.classList.add('amount-neutral-affix');
            pgSingle.value = formatMoedaInput(0);
            pgSingle.dataset.esperado = "0";
            pgSingle.readOnly = true;
            btnSingle.innerHTML = '<span>Sem valor a receber</span>';
            btnSingle.disabled = true;
            btnSingle.classList.add('payment-disabled-btn');
        }
        
        // Mantem destravado para editar a data ref
        document.getElementById('boxSingleMes').style.pointerEvents = 'auto';
        document.getElementById('boxSingleMes').style.opacity = '1';
    }

    function salvarPagamentoSingle(id, c, mesRef, valorPago, dataPgto, opcoes = {}) {
        if(!c.pagamentos) c.pagamentos = [];
        c.pagamentos.push({
            id: 'pg_' + Date.now(),
            mesAno: mesRef,
            mesesRef: [mesRef],
            labelRef: buildLabelRef([mesRef]),
            valorPago: valorPago,
            valorOriginal: opcoes.valorOriginal || valorPago,
            descontoConcedido: opcoes.descontoConcedido || 0,
            parcial: opcoes.parcial || false,
            tipoPagamento: opcoes.tipoPagamento || 'total',
            dataPagamento: dataPgto
        });
        marcarRegistroPendente(c.pagamentos[c.pagamentos.length - 1]);
        tocarRegistro(c);
        registrarAuditoria('Pagamento registrado', `${c.nome || id} - ${buildLabelRef([mesRef])} - R$ ${formatMoeda(valorPago)}`);
        salvarBanco();
        abrirAcoesContribuinte(id);
        renderizarLista();
    }

    function registrarPagamentoSingle() {
        let id = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === id);
        let mesRef = document.getElementById('pgMesRefSingle').value; 
        
        let valorPagoStr = document.getElementById('pgValorSingle').value; 
        let valorPago = parseMoeda(valorPagoStr);
        let dataPgto = document.getElementById('pgDataSingle').value;
        let valorEsperado = parseFloat(document.getElementById('pgValorSingle').dataset.esperado) || calcularValorPendenteMes(c, mesRef);
        let valorOriginalMes = calcularValorEsperado(c, mesRef);
        let jaTemParcial = calcularParciaisMes(c, mesRef) > 0;

        if(!validarDataCampo('pgDataSingle', 'Pagamento', true)) return;
        if(valorPago <= 0) return alert("Digite um valor válido para receber.");

        if(isMesPago(c, mesRef)) return alert("Este mês já consta como pago!");

        if(jaTemParcial) {
            salvarPagamentoSingle(id, c, mesRef, valorPago, dataPgto, {
                valorOriginal: valorOriginalMes,
                parcial: true,
                tipoPagamento: 'parcial'
            });
            return;
        }

        if(valorPago < valorEsperado) {
            pagamentoMenorPendente = { id, mesRef, valorPago, dataPgto, valorEsperado };
            document.getElementById('textoPagamentoMenor').innerHTML = `O valor previsto é <b>R$ ${formatMoeda(valorEsperado)}</b>, mas você informou <b>R$ ${formatMoeda(valorPago)}</b>. Como deseja registrar a diferença de <b>R$ ${formatMoeda(valorEsperado - valorPago)}</b>?`;
            abrirModal('modalPagamentoMenor');
            return;
        }

        salvarPagamentoSingle(id, c, mesRef, valorPago, dataPgto, { valorOriginal: valorEsperado });
    }

    function confirmarPagamentoMenor(tipo) {
        if(!pagamentoMenorPendente) return fecharModal('modalPagamentoMenor');
        let { id, mesRef, valorPago, dataPgto, valorEsperado } = pagamentoMenorPendente;
        let c = db.contribuintes.find(x => x.id === id);
        if(!c) return fecharModal('modalPagamentoMenor');

        fecharModal('modalPagamentoMenor');
        if(tipo === 'parcial') {
            salvarPagamentoSingle(id, c, mesRef, valorPago, dataPgto, {
                valorOriginal: valorEsperado,
                parcial: true,
                tipoPagamento: 'parcial'
            });
        } else {
            salvarPagamentoSingle(id, c, mesRef, valorPago, dataPgto, {
                valorOriginal: valorEsperado,
                descontoConcedido: Math.max(0, valorEsperado - valorPago),
                tipoPagamento: 'desconto'
            });
        }
        pagamentoMenorPendente = null;
    }

    function getMesesRange(mIni, mFim) {
        let res = [];
        let curr = new Date(mIni + '-01T00:00:00');
        let end = new Date(mFim + '-01T00:00:00');
        while(curr <= end) {
            res.push(`${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`);
            curr.setMonth(curr.getMonth() + 1);
        }
        return res;
    }

    function sincronizarDescontoPeriodo(total, origem) {
        let inputValor = document.getElementById('pgDescontoMulti');
        let inputPct = document.getElementById('pgDescontoPctMulti');
        let descValor = parseMoeda(inputValor.value);
        let descPct = inputPct ? parsePercentual(inputPct.value) : 0;

        if(origem === 'pct') {
            descValor = total > 0 ? (total * descPct / 100) : 0;
            inputValor.value = descValor > 0 ? formatMoedaInput(descValor) : '';
            if(inputPct) inputPct.value = descPct > 0 ? `${formatPercentual(descPct)}%` : '';
        } else {
            if(descValor > total) {
                descValor = total;
                inputValor.value = total > 0 ? formatMoedaInput(total) : '';
            }
            descPct = total > 0 ? (descValor / total) * 100 : 0;
            if(inputPct) inputPct.value = descValor > 0 ? `${formatPercentual(descPct)}%` : '';
        }
        return Math.min(descValor, total);
    }

    function calcPgtoMulti(mostrarErro = true, origemDesconto = null) {
        let ini = document.getElementById('pgIni').value;
        let fim = document.getElementById('pgFim').value;
        if(!ini) return;
        if(!fim || fim < ini) { 
            fim = ini; 
            document.getElementById('pgFim').value = ini;
            let partes = ini.split('-');
            document.getElementById('lblPgFim').innerText = `${getExtensoMes(partes[1])} ${partes[0]}`;
        }
        
        let id = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === id);
        let vencimentoMulti = document.getElementById('pgVencimentoMulti');
        if(vencimentoMulti && c) vencimentoMulti.innerText = getLabelDiaVencimento(c, ini);
        let meses = getMesesRange(ini, fim);
        
        let total = 0;
        let erro = null;
        
        meses.forEach(m => {
            if(isMesPago(c, m)) erro = `Mês ${m.split('-').reverse().join('/')} já consta como pago!`;
            else total += calcularValorPendenteMes(c, m);
        });
        
        let iptValor = document.getElementById('pgValorMulti');
        let descExtra = sincronizarDescontoPeriodo(total, origemDesconto);
        let finalVal = Math.max(0, total - descExtra);

        let boxAviso = document.getElementById('avisoErroMulti');

        if(erro) {
            iptValor.value = formatMoedaInput(0);
            iptValor.dataset.esperado = 0;
            boxAviso.innerHTML = `<span style="color:#D32F2F; font-size:13px; font-weight:bold;">⚠️ ${erro}</span>`;
            if(mostrarErro) boxAviso.style.display = 'block';
        } else {
            iptValor.value = formatMoedaInput(finalVal);
            iptValor.dataset.esperado = finalVal;
            boxAviso.style.display = 'none';
        }
    }

    function buildLabelRef(meses) {
        if(meses.length === 1) {
            let p = meses[0].split('-');
            return `${p[1]}/${p[0]}`;
        }
        let mIni = meses[0].split('-');
        let mFim = meses[meses.length-1].split('-');
        if(mIni[0] === mFim[0]) {
            return `${mIni[1]} a ${mFim[1]}/${mIni[0]}`;
        } else {
            return `${mIni[1]}/${mIni[0].substring(2)} a ${mFim[1]}/${mFim[0].substring(2)}`;
        }
    }

    function registrarPagamentoMulti() {
        let id = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === id);
        
        let ini = document.getElementById('pgIni').value;
        let fim = document.getElementById('pgFim').value;
        let dataPgto = document.getElementById('pgDataMulti').value;
        let esperadoFinal = parseFloat(document.getElementById('pgValorMulti').dataset.esperado) || 0;
        
        if(!ini) return alert("Preencha o mês de início.");
        if(!validarDataCampo('pgDataMulti', 'Pagamento', true)) return;
        if(esperadoFinal <= 0) return alert("Não há valor pendente ou válido para este período.");

        let meses = getMesesRange(ini, fim);
        
        for(let m of meses) {
            if(isMesPago(c, m)) return alert(`O mês ${m.split('-').reverse().join('/')} já consta como pago no histórico!`);
        }

        if(!c.pagamentos) c.pagamentos = [];
        c.pagamentos.push({
            id: 'pg_' + Date.now(),
            mesAno: ini, 
            mesesRef: meses,
            labelRef: buildLabelRef(meses),
            valorPago: esperadoFinal,
            dataPagamento: dataPgto
        });
        marcarRegistroPendente(c.pagamentos[c.pagamentos.length - 1]);
        tocarRegistro(c);
        registrarAuditoria('Pagamento por período registrado', `${c.nome || id} - ${buildLabelRef(meses)} - R$ ${formatMoeda(esperadoFinal)}`);
        
        salvarBanco();
        abrirAcoesContribuinte(id); 
        renderizarLista(); 
    }

    function excluirPagamento(contId, pgId) {
        if(!confirm("Remover este pagamento?")) return;
        let c = db.contribuintes.find(x => x.id === contId);
        registrarExclusao('pagamentos', pgId);
        c.pagamentos = c.pagamentos.filter(p => p.id !== pgId);
        tocarRegistro(c);
        registrarAuditoria('Pagamento excluído', c.nome || contId);
        salvarBanco();
        abrirAcoesContribuinte(contId);
        renderizarLista();
    }

    function getMesesPendentes(c) {
        let pending = [];
        let earliestCar = null;
        (c.carros || []).forEach(car => {
            if(car.ativo) {
                let dataBase = `${getMesCadastroCobranca(car)}-01`;
                if(!earliestCar || dataBase < earliestCar) earliestCar = dataBase;
            }
        });
        if(!earliestCar) return pending;

        let startMes = earliestCar.substring(0,7);
        let endMes = getHojeSTR().substring(0,7); // Vai até o mes atual
        
        if(startMes <= endMes) {
            let curr = new Date(startMes + '-01T00:00:00');
            let end = new Date(endMes + '-01T00:00:00');
            while(curr <= end) {
                let m = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`;
                if(calcularValorPendenteMes(c, m) > 0) {
                    pending.push(m);
                }
                curr.setMonth(curr.getMonth() + 1);
            }
        }
        return pending.sort((a,b) => b.localeCompare(a));
    }

    function renderizarHistPagamentos(c) {
        let box = document.getElementById('listaHistoricoPagamentos');
        
        // Pendências Inteligentes
        let pendentes = getMesesPendentes(c);
        let pendentesHtml = '';
        if(pendentes.length > 0) {
            let pTags = pendentes.map(m => {
                let parts = m.split('-');
                return `<span class="pending-month">${parts[1]}/${parts[0]}</span>`;
            }).join('');
            pendentesHtml = `<div class="pending-box">
                <div class="pending-title">Meses Pendentes</div>
                ${pTags}
            </div>`;
        } else {
            pendentesHtml = `<div class="pending-box ok">✅ Nenhuma pendência em aberto.</div>`;
        }

        if(!c.pagamentos || c.pagamentos.length === 0) { 
            box.innerHTML = pendentesHtml + '<div class="empty-state">Nenhum pagamento registrado.</div>'; 
            return; 
        }
        
        let pgtos = [...c.pagamentos].sort((a,b) => b.mesAno.localeCompare(a.mesAno) || new Date(b.dataPagamento) - new Date(a.dataPagamento));
        
        let html3 = '';
        let htmlRest = '';

        pgtos.forEach((p, i) => {
            let label = p.labelRef ? p.labelRef : p.mesAno.split('-').reverse().join('/');
            let detalhe = '';
            if(p.parcial) detalhe = '<span class="history-tag partial">Parcial</span>';
            else if(p.descontoConcedido > 0) detalhe = `<span class="history-tag discount">Desconto R$ ${formatMoeda(p.descontoConcedido)}</span>`;
            let row = `<div class="history-row">
                <div><b>Ref: ${escapeHTML(label)}</b>${detalhe}<br><small>Pago em: ${formatDataBR(p.dataPagamento)}</small></div>
                <div>
                    <b>R$ ${formatMoeda(p.valorPago)}</b>
                    <button onclick="excluirPagamento('${c.id}', '${p.id}')">X</button>
                </div>
            </div>`;
            if(i < 3) html3 += row;
            else htmlRest += row;
        });

        box.innerHTML = pendentesHtml + html3;
        if(pgtos.length > 3) {
            box.innerHTML += `<div id="histRestante" style="display:none;">${htmlRest}</div>
            <button id="btnToggleHist" class="history-toggle" onclick="toggleHistoricoAcoes()">Ver Todo o Histórico</button>`;
        }
    }

    function toggleHistoricoAcoes() {
        let el = document.getElementById('histRestante');
        let btn = document.getElementById('btnToggleHist');
        if(el.style.display === 'none') {
            el.style.display = 'block';
            btn.innerText = 'Ocultar Histórico';
        } else {
            el.style.display = 'none';
            btn.innerText = 'Ver Todo o Histórico';
        }
    }

    // 7. CONFIGURAÇÕES GERAIS E COOPERATIVA
    function abrirModalCooperativa() {
        fecharModal('modalPainelUnificado');
        document.getElementById('coopLogoBase64').value = db.cooperativa.logo || '';
        document.getElementById('previewLogo').innerHTML = db.cooperativa.logo ? `<img src="${db.cooperativa.logo}" style="max-height:50px;">` : '';
        document.getElementById('coopRazao').value = db.cooperativa.razao || '';
        document.getElementById('coopFantasia').value = db.cooperativa.fantasia || '';
        document.getElementById('coopCNPJ').value = db.cooperativa.cnpj || '';
        
        tempPixCoop = db.cooperativa.pixList ? JSON.parse(JSON.stringify(db.cooperativa.pixList)) : [];
        renderListaPixCoop();

        abrirModal('modalFormCooperativa');
    }

    function renderListaPixCoop() {
        const box = document.getElementById('listaPixCoop');
        if(tempPixCoop.length === 0) { box.innerHTML = '<div class="empty-state">Nenhuma chave PIX.</div>'; return; }
        box.innerHTML = tempPixCoop.map((p, i) => `<div class="pix-card">
            <div class="pix-card-main">
                <div class="pix-key"><span>${escapeHTML(p.tipo)}</span><b>${escapeHTML(p.chave)}</b></div>
                <div class="pix-beneficiario">Beneficiário: ${escapeHTML(p.beneficiario)}</div>
            </div>
            <button type="button" onclick="removerPixCoop(${i})" aria-label="Remover chave PIX">X</button>
        </div>`).join('');
    }
    
    function addPixCoop() { 
        let tipo = document.getElementById('novoPixTipoCoop').value; 
        let chv = document.getElementById('novoPixInputCoop').value.trim(); 
        let ben = document.getElementById('novoPixBenCoop').value.trim();
        if(tipo === 'E-mail') { chv = chv.toLowerCase(); if(!chv.includes('@') || !chv.includes('.')) return alert('E-mail inválido.'); }
        if(chv && ben) {
            tempPixCoop.push(marcarRegistroPendente({ id: 'pix_' + Date.now(), tipo: tipo, chave: chv, beneficiario: ben, principal: tempPixCoop.length === 0 }));
            document.getElementById('novoPixInputCoop').value = ''; 
            document.getElementById('novoPixBenCoop').value = ''; 
            renderListaPixCoop(); 
        } else {
            alert('Preencha a chave e o nome do beneficiário.');
        }
    }
    function removerPixCoop(idx) { if(tempPixCoop[idx]?.id) registrarExclusao('pix', tempPixCoop[idx].id); tempPixCoop.splice(idx, 1); if(tempPixCoop.length > 0 && !tempPixCoop.some(p => p.principal)) marcarRegistroPendente(tempPixCoop[0]).principal = true; renderListaPixCoop(); }
    function setPixPrincipal(idx) { tempPixCoop.forEach((p, i) => { p.principal = (i === idx); marcarRegistroPendente(p); }); }

    function salvarCooperativa() {
        db.cooperativa.logo = document.getElementById('coopLogoBase64').value;
        db.cooperativa.razao = document.getElementById('coopRazao').value;
        db.cooperativa.fantasia = document.getElementById('coopFantasia').value;
        db.cooperativa.cnpj = document.getElementById('coopCNPJ').value;
        db.cooperativa.pixList = tempPixCoop;
        tocarRegistro(db.cooperativa);
        registrarAuditoria('Dados da cooperativa alterados', db.cooperativa.fantasia || db.cooperativa.razao || 'Cooperativa');
        salvarBanco();
        renderizarCabecalhoPrincipal();
        fecharModal('modalFormCooperativa');
        abrirModal('modalPainelUnificado');
    }

    function abrirModalConfigGerais() {
        fecharModal('modalPainelUnificado');
        
        let confAlertas = db.configGerais.alertas || { laudo: {ativo:true, dias:7}, seguro: {ativo:true, dias:7}, licenca: {ativo:true, dias:7} };
        
        document.getElementById('confCorTema').value = db.configGerais.corTema || '#008C4A';
        document.getElementById('confCorSub').value = db.configGerais.corSubHeader || '#ffffff';

        document.getElementById('confAlertaLaudo').checked = confAlertas.laudo.ativo;
        document.getElementById('confDiasLaudo').value = confAlertas.laudo.dias;
        toggleConfAlerta('Laudo');

        document.getElementById('confAlertaSeguro').checked = confAlertas.seguro.ativo;
        document.getElementById('confDiasSeguro').value = confAlertas.seguro.dias;
        toggleConfAlerta('Seguro');

        document.getElementById('confAlertaLicenca').checked = confAlertas.licenca.ativo;
        document.getElementById('confDiasLicenca').value = confAlertas.licenca.dias;
        toggleConfAlerta('Licenca');

        let resetCadastro = getConfigResetCadastroAtualizado();
        document.getElementById('confResetCadastroDia').value = parseInt(resetCadastro.dia, 10);
        document.getElementById('confResetCadastroMes').value = parseInt(resetCadastro.mes, 10);

        tempCategorias = db.categorias ? JSON.parse(JSON.stringify(db.categorias)) : [];
        renderListasCategorias();
        cancelarEditCategoria();
        abrirModal('modalConfigGerais');
    }

    function toggleConfAlerta(nome) {
        let isAtivo = document.getElementById(`confAlerta${nome}`).checked;
        document.getElementById(`boxDias${nome}`).style.display = isAtivo ? 'flex' : 'none';
    }

    function renderListasCategorias() {
        const list = document.getElementById('listaCategorias');
        list.innerHTML = tempCategorias.length ? tempCategorias.map((c, i) => `<div class="list-item-config">
            <span><b>${escapeHTML(c.emoji || '🚗')} ${escapeHTML(c.nome)}</b> - R$ ${escapeHTML(c.valor)}</span>
            <div><button class="btn-edit-small" onclick="editarCategoria(${i})">✏️</button><button onclick="removerCategoria(${i})">X</button></div>
        </div>`).join('') : '<div style="color:#999; font-size:12px; text-align:center;">Nenhuma categoria.</div>';
    }

    function addCategoria() {
        let e = document.getElementById('novaCatEmoji').value;
        let n = document.getElementById('novaCatNome').value.trim();
        let v = document.getElementById('novaCatValor').value.trim();
        let editIdx = document.getElementById('editIdxCat').value;
        if(n && v) {
            if(editIdx !== "") { 
                tempCategorias[editIdx] = marcarRegistroPendente({ ...tempCategorias[editIdx], emoji: e, nome: n, valor: v }); 
            } else { 
                tempCategorias.push(marcarRegistroPendente({ id: 'cat_' + Date.now(), emoji: e, nome: n, valor: v })); 
            }
            cancelarEditCategoria();
            renderListasCategorias();
        }
    }
    
    function editarCategoria(idx) {
        let c = tempCategorias[idx];
        document.getElementById('novaCatEmoji').value = c.emoji || '🚗';
        document.getElementById('novaCatNome').value = c.nome;
        document.getElementById('novaCatValor').value = c.valor;
        document.getElementById('editIdxCat').value = idx;
        
        let box = document.getElementById('boxEditCat');
        box.style.background = "var(--theme-light)";
        box.style.borderColor = "var(--theme-base)";
        document.getElementById('lblModoCat').innerText = "Editando Categoria";
        document.getElementById('btnSalvarCat').innerText = "OK";
        document.getElementById('btnCancelarEditCat').style.display = "flex";
    }

    function cancelarEditCategoria() {
        document.getElementById('novaCatEmoji').value = '🚗';
        document.getElementById('novaCatNome').value = '';
        document.getElementById('novaCatValor').value = '';
        document.getElementById('editIdxCat').value = '';
        
        let box = document.getElementById('boxEditCat');
        box.style.background = "#f9f9f9";
        box.style.borderColor = "#ccc";
        document.getElementById('lblModoCat').innerText = "Adicionar Nova Categoria";
        document.getElementById('btnSalvarCat').innerText = "+";
        document.getElementById('btnCancelarEditCat').style.display = "none";
    }

    function removerCategoria(idx) {
        let cat = tempCategorias[idx];
        if(!cat) return;
        document.getElementById('idxCategoriaExcluir').value = idx;
        document.getElementById('nomeCategoriaExcluir').innerText = cat.nome || 'sem nome';
        document.getElementById('fraseExcluirCategoria').value = '';
        document.getElementById('senhaExcluirCategoria').value = '';
        abrirModal('modalExcluirCategoria');
        setTimeout(() => document.getElementById('fraseExcluirCategoria').focus(), 80);
    }

    function confirmarExclusaoCategoria() {
        let frase = document.getElementById('fraseExcluirCategoria').value.trim().toLowerCase();
        let senha = document.getElementById('senhaExcluirCategoria').value.trim();
        let idx = parseInt(document.getElementById('idxCategoriaExcluir').value, 10);
        if(frase !== 'eu quero apagar essa categoria') return alert("Digite a frase exata para confirmar.");
        if(senha !== String(db.configs.senhaAdmin || '1999')) return alert("Senha do painel avançado incorreta.");
        let cat = tempCategorias[idx];
        if(!cat) return fecharModal('modalExcluirCategoria');
        registrarExclusao('categorias', cat?.id || cat?.nome);
        tempCategorias.splice(idx, 1);
        registrarAuditoria('Categoria excluída', cat.nome || '');
        fecharModal('modalExcluirCategoria');
        renderListasCategorias();
    }

    function salvarConfigGerais() {
        db.configGerais.corTema = document.getElementById('confCorTema').value;
        db.configGerais.corSubHeader = document.getElementById('confCorSub').value;
        db.configGerais.alertas = {
            laudo: { ativo: document.getElementById('confAlertaLaudo').checked, dias: document.getElementById('confDiasLaudo').value || 7 },
            seguro: { ativo: document.getElementById('confAlertaSeguro').checked, dias: document.getElementById('confDiasSeguro').value || 7 },
            licenca: { ativo: document.getElementById('confAlertaLicenca').checked, dias: document.getElementById('confDiasLicenca').value || 7 }
        };
        const resetCadastro = normalizarDiaMesResetCadastro(
            document.getElementById('confResetCadastroDia').value,
            document.getElementById('confResetCadastroMes').value
        );
        db.configGerais.cadastroAtualizadoReset = {
            ...getConfigResetCadastroAtualizado(),
            ...resetCadastro
        };
        db.categorias = tempCategorias;
        tocarRegistro(db.configGerais);
        registrarAuditoria('Configurações gerais alteradas', 'Tema, alertas, categorias ou reset de cadastro atualizado');
        salvarBanco();
        aplicarTema();
        fecharModal('modalConfigGerais');
        abrirModal('modalPainelUnificado');
        renderizarLista(); 
    }

    function abrirGerenciar(tipo) {
        if(tipo === 'administradores') {
            fecharModal('modalPainelUnificado');
            document.getElementById('tituloListagem').innerText = "Usuários";
            document.getElementById('btnNovoListagem').onclick = () => abrirFormAdmin(null);
            document.getElementById('btnVoltarListagem').onclick = () => { fecharModal('modalListagem'); abrirModal('modalPainelUnificado'); };
            document.getElementById('boxAcoesExtrasExcel').style.display = 'none';
            document.getElementById('inputBuscaGerenciarContrib').style.display = 'none';
            let htmlLista = '';
            db.administradores.forEach((a) => {
                let tipoUsuario = a.isAdmin === false ? 'Usuário' : 'Administrador';
                htmlLista += `<div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>${escapeHTML(a.nome)}</strong><br><small style="color:#666;">${tipoUsuario}</small></div>
                    <div>
                        <button style="background:none; border:none; font-size:20px; cursor:pointer;" onclick="abrirFormAdmin('${a.id}')">✏️</button>
                        <button style="background:none; border:none; font-size:20px; cursor:pointer; color:#d32f2f;" onclick="excluirUsuario('${a.id}')">🗑️</button>
                    </div>
                </div>`;
            });
            document.getElementById('conteudoListagem').innerHTML = htmlLista;
            abrirModal('modalListagem');
        }
    }

    function solicitarExclusaoCarroTemp() {
        let idx = document.getElementById('carroEditId').value;
        if(idx === '' || !tempCarros[idx]) return;
        let car = tempCarros[idx];
        let frase = prompt(`Para excluir o veículo ${car.placa || ''}, digite: quero excluir`);
        if((frase || '').trim().toLowerCase() !== 'quero excluir') {
            alert("Exclusão cancelada. A frase digitada não confere.");
            return;
        }

        let isFromAcoes = document.getElementById('modalAcoesContribuinte').style.display === 'flex';
        if(isFromAcoes && car.id) registrarExclusao('carros', car.id);
        if(!isFromAcoes && car.id) tempCarrosExcluidos.push(car.id);
        tempCarros.splice(parseInt(idx, 10), 1);
        fecharModal('modalFormCarro');

        if(isFromAcoes) {
            let contId = document.getElementById('acoesContId').value;
            let c = db.contribuintes.find(x => x.id === contId);
            if(!c) return;
            c.carros = tempCarros;
            recalcularTotalContribuinteRegistro(c);
            registrarAuditoria('Veículo excluído', `${c.nome || ''} - ${car.placa || ''}`);
            salvarBanco();
            abrirAcoesContribuinte(contId);
            renderizarLista();
        } else {
            renderListaCarros();
        }
    }

    function togglePermissoesUsuario() {
        document.getElementById('boxPermissoesUsuario').style.display = document.getElementById('adminIsAdmin').checked ? 'none' : 'flex';
    }

    function abrirFormAdmin(id) {
        fecharModal('modalListagem');
        if(id) {
            let a = db.administradores.find(x => x.id === id);
            document.getElementById('adminId').value = a.id;
            document.getElementById('adminNome').value = a.nome;
            document.getElementById('adminSenha').value = a.senha;
            document.getElementById('adminIsAdmin').checked = a.isAdmin !== false;
            let perms = getPermissoesUsuario(a);
            document.getElementById('permCooperativa').checked = !!perms.cooperativa;
            document.getElementById('permConfigGerais').checked = !!perms.configGerais;
            document.getElementById('permUsuarios').checked = !!perms.usuarios;
        } else {
            document.getElementById('adminId').value = '';
            document.getElementById('adminNome').value = '';
            document.getElementById('adminSenha').value = '';
            document.getElementById('adminIsAdmin').checked = db.administradores.length === 0;
            document.getElementById('permCooperativa').checked = false;
            document.getElementById('permConfigGerais').checked = false;
            document.getElementById('permUsuarios').checked = false;
        }
        togglePermissoesUsuario();
        abrirModal('modalFormAdmin');
    }

    function salvarAdmin() {
        let id = document.getElementById('adminId').value || 'adm_' + Date.now();
        let nome = document.getElementById('adminNome').value.trim();
        let senha = document.getElementById('adminSenha').value.trim();
        if(!nome) return alert("Informe o nome do perfil.");
        if(!senha) return alert("Informe a senha do perfil.");

        let isAdmin = document.getElementById('adminIsAdmin').checked;
        let novo = {
            id: id,
            nome: nome,
            senha: senha,
            isAdmin: isAdmin,
            permissoes: {
                cooperativa: isAdmin || document.getElementById('permCooperativa').checked,
                configGerais: isAdmin || document.getElementById('permConfigGerais').checked,
                usuarios: isAdmin || document.getElementById('permUsuarios').checked
            }
        };
        tocarRegistro(novo);
        const idx = db.administradores.findIndex(x => x.id === id);
        if(idx >= 0) db.administradores[idx] = novo; else db.administradores.push(novo);
        if(adminLogado && adminLogado.id === id) {
            adminLogado.nome = nome;
            adminLogado.isAdmin = novo.isAdmin;
            adminLogado.permissoes = novo.permissoes;
            atualizarPerfilAdminUI();
        }
        registrarAuditoria(idx >= 0 ? 'Usuário alterado' : 'Usuário cadastrado', nome);
        salvarBanco(); fecharModal('modalFormAdmin'); abrirGerenciar('administradores');
    }

    function excluirUsuario(id) {
        let user = db.administradores.find(a => a.id === id);
        if(!user) return;
        if(adminLogado && adminLogado.id === id) return alert("Você não pode excluir o usuário que está em uso agora.");
        if(!confirm(`Excluir o usuário ${user.nome}?`)) return;
        registrarExclusao('administradores', id);
        db.administradores = db.administradores.filter(a => a.id !== id);
        registrarAuditoria('Usuário excluído', user.nome || id);
        salvarBanco();
        abrirGerenciar('administradores');
    }

    let colunasExcelMeses = Array.from({ length: 6 }, (_, i) => `${String(i + 1).padStart(2, '0')}-26`);
    const colunasExcelFixas = ["Nome", "Placa", "Ano", "Categoria", "Data Laudo", "Data Seguro", "Data Licença", "Desconto Base (R$)"];

    function colunaValorMesExcel(mes) { return `${mes} (R$)`; }
    function colunaStatusMesExcel(mes) { return `Status ${mes}`; }

    function montarCabecalhoExcel() {
        let headers = [...colunasExcelFixas];
        colunasExcelMeses.forEach(mes => {
            headers.push(colunaValorMesExcel(mes), "Data Pagamento", colunaStatusMesExcel(mes));
        });
        return headers;
    }

    function refMesFromColunaExcel(col) {
        let match = String(col || '').match(/(\d{2})-(\d{2})/);
        if(!match) return "";
        return `20${match[2]}-${match[1]}`;
    }

    function normalizarHeaderExcel(valor) {
        return String(valor || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function indexHeaderExcel(headers, nome) {
        let alvo = normalizarHeaderExcel(nome);
        return headers.findIndex(h => normalizarHeaderExcel(h) === alvo);
    }

    function getCellExcel(row, idx) {
        return idx >= 0 && idx < row.length ? row[idx] : "";
    }

    function montarMapaMesesImportacao(headers) {
        return colunasExcelMeses.map(mes => {
            let valorIdx = headers.findIndex(h => {
                let txt = normalizarHeaderExcel(h);
                return txt === normalizarHeaderExcel(colunaValorMesExcel(mes)) || txt === normalizarHeaderExcel(mes);
            });

            let dataIdx = -1;
            if(valorIdx >= 0 && normalizarHeaderExcel(headers[valorIdx + 1]).startsWith('data pagamento')) {
                dataIdx = valorIdx + 1;
            }

            let statusIdx = indexHeaderExcel(headers, colunaStatusMesExcel(mes));
            if(statusIdx < 0 && valorIdx >= 0 && normalizarHeaderExcel(headers[valorIdx + 2]).startsWith('status')) {
                statusIdx = valorIdx + 2;
            }

            return { mes, ref: refMesFromColunaExcel(mes), valorIdx, dataIdx, statusIdx };
        }).filter(meta => meta.valorIdx >= 0);
    }

    function carExcelKey(car, idx) {
        return car.id || `${car.placa || 'sem_placa'}_${idx}`;
    }

    function arredondar2(valor) {
        return Math.round((parseFloat(valor) || 0) * 100) / 100;
    }

    function somaPagamentosMes(c, mesRef) {
        return (c.pagamentos || [])
            .filter(p => pagamentoRefereMes(p, mesRef))
            .reduce((acc, p) => acc + (parseFloat(p.valorPago) || 0), 0);
    }

    function getInfoPagamentoMes(c, mesRef) {
        let pagamentos = (c.pagamentos || []).filter(p => pagamentoRefereMes(p, mesRef));
        let valor = pagamentos.reduce((acc, p) => acc + (parseFloat(p.valorPago) || 0), 0);
        let dataPagamento = pagamentos
            .map(p => p.dataPagamento || "")
            .filter(Boolean)
            .sort()
            .pop() || "";
        return { valor: arredondar2(valor), dataPagamento };
    }

    function parseValorExcel(raw) {
        if(raw === null || raw === undefined || raw === '') return 0;
        if(typeof raw === 'number') return raw > 0 ? raw : 0;
        let str = String(raw).trim();
        if(!str) return 0;
        str = str.replace(/\s/g, '').replace(/R\$/gi, '');
        if(str.includes(',') && str.includes('.')) str = str.replace(/\./g, '').replace(',', '.');
        else if(str.includes(',')) str = str.replace(',', '.');
        else if(str.includes('.')) {
            let partes = str.split('.');
            if(partes.length > 2 || partes[partes.length - 1].length === 3) str = str.replace(/\./g, '');
        }
        let valor = parseFloat(str.replace(/[^\d.-]/g, ''));
        return isNaN(valor) || valor <= 0 ? 0 : valor;
    }

    function formatValorExcel(valor) {
        valor = arredondar2(valor);
        return valor > 0 ? valor : '';
    }

    function parseDataExcel(dRaw) {
        if(!dRaw) return "";
        if(dRaw instanceof Date && !isNaN(dRaw)) {
            return `${dRaw.getFullYear()}-${String(dRaw.getMonth() + 1).padStart(2, '0')}-${String(dRaw.getDate()).padStart(2, '0')}`;
        }
        if(typeof dRaw === 'number' && window.XLSX && XLSX.SSF && XLSX.SSF.parse_date_code) {
            let parsed = XLSX.SSF.parse_date_code(dRaw);
            if(parsed) return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
        }

        let str = String(dRaw).trim();
        if(!str) return "";
        if(/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        if(str.includes('/')) {
            let p = str.split('/');
            if(p.length === 3) return `${p[2].padStart(4, '20')}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
        }
        return str;
    }

    function parseDiaPagamentoExcel(raw, mesRef) {
        if(raw === null || raw === undefined || raw === '') return "";
        if(raw instanceof Date && !isNaN(raw)) {
            return `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}-${String(raw.getDate()).padStart(2, '0')}`;
        }

        let dia = null;
        if(typeof raw === 'number') dia = Math.trunc(raw);
        else {
            let str = String(raw).trim();
            if(!str) return "";
            if(/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
            if(str.includes('/')) {
                let p = str.split('/');
                if(p.length === 3) return `${p[2].padStart(4, '20')}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                dia = parseInt(p[0], 10);
            } else {
                dia = parseInt(str.replace(/\D/g, ''), 10);
            }
        }

        let partes = mesRef.split('-');
        let ultimoDia = new Date(parseInt(partes[0]), parseInt(partes[1]), 0).getDate();
        if(!dia || dia < 1 || dia > ultimoDia) return "";
        return `${mesRef}-${String(dia).padStart(2, '0')}`;
    }

    function getDiaPagamentoExcel(dataStr) {
        if(!dataStr) return "";
        let partes = String(dataStr).split('-');
        if(partes.length === 3) return parseInt(partes[2], 10);
        return "";
    }

    function statusExcelPermiteImportar(rawStatus, valorPago) {
        if(valorPago <= 0) return false;
        let status = normalizarHeaderExcel(rawStatus);
        if(!status) return true;
        if(status.includes('nao') || status.includes('pendente') || status.includes('aberto')) return false;
        return status.includes('pago') || status.includes('sim') || status.includes('ok') || status.includes('regular') || status.includes('quitado') || status.includes('parcial') || valorPago > 0;
    }

    function calcularValoresExcelPorCarro(c, mesRef) {
        let totalPago = arredondar2(somaPagamentosMes(c, mesRef));
        let mapa = new Map();
        if(totalPago <= 0) return mapa;

        let carrosAtivos = (c.carros || [])
            .map((car, idx) => ({ car, idx }))
            .filter(item => item.car.ativo && getMesCadastroCobranca(item.car) <= mesRef);
        let totalBase = carrosAtivos.reduce((acc, item) => acc + parseMoeda(item.car.valor), 0);
        if(carrosAtivos.length === 0 || totalBase <= 0) return mapa;

        let acumulado = 0;
        carrosAtivos.forEach((item, pos) => {
            let valor = pos === carrosAtivos.length - 1
                ? arredondar2(totalPago - acumulado)
                : arredondar2(totalPago * (parseMoeda(item.car.valor) / totalBase));
            acumulado = arredondar2(acumulado + valor);
            mapa.set(carExcelKey(item.car, item.idx), valor);
        });
        return mapa;
    }

    function montarLinhaExcel(c, car = null, idx = -1) {
        let linha = [
            c.nome || "",
            car ? (car.placa || "") : "",
            car ? (car.ano || "") : "",
            car ? (car.categoria || "") : "",
            car && car.dataLaudo ? formatDataBR(car.dataLaudo) : "",
            car && car.dataSeguro ? formatDataBR(car.dataSeguro) : "",
            car && car.dataLicenca ? formatDataBR(car.dataLicenca) : "",
            formatValorExcel(parseMoeda(c.desconto || "0"))
        ];

        colunasExcelMeses.forEach(mes => {
            let mesRef = refMesFromColunaExcel(mes);
            let info = getInfoPagamentoMes(c, mesRef);
            let valor = info.valor;
            if(car) {
                let mapaMes = calcularValoresExcelPorCarro(c, mesRef);
                valor = mapaMes.get(carExcelKey(car, idx)) || 0;
            }
            linha.push(formatValorExcel(valor), valor > 0 ? getDiaPagamentoExcel(info.dataPagamento) : "", valor > 0 ? "Pago" : "Não Pago");
        });

        return linha;
    }

    function aplicarLargurasExcel(ws, headers) {
        ws['!cols'] = headers.map(h => {
            if(h === 'Nome') return { wch: 24 };
            if(['Placa', 'Categoria'].includes(h)) return { wch: 14 };
            if(h === 'Desconto Base (R$)') return { wch: 18 };
            if(h.startsWith('Data') || h.startsWith('Status')) return { wch: 16 };
            return { wch: 12 };
        });
    }

    function exportarExcel() {
        if(!window.XLSX) return alert("A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.");
        let headers = montarCabecalhoExcel();
        let aoa = [headers];

        db.contribuintes.forEach(c => {
            if(!c.carros || c.carros.length === 0) {
                aoa.push(montarLinhaExcel(c));
            } else {
                c.carros.forEach((car, idx) => aoa.push(montarLinhaExcel(c, car, idx)));
            }
        });

        let ws = XLSX.utils.aoa_to_sheet(aoa);
        aplicarLargurasExcel(ws, headers);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contribuintes");
        XLSX.writeFile(wb, "Contribuintes_" + getHojeSTR() + ".xlsx");
    }

    function baixarModeloExcel() {
        if(!window.XLSX) return alert("A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.");
        let headers = montarCabecalhoExcel();
        let rowsModelo = [
            ["João Silva", "ABC1D23", "2020", "Van", "20/04/2026", "20/04/2026", "20/04/2026", 20],
            ["João Silva", "XYZ9A87", "2022", "Carro", "20/04/2026", "20/04/2026", "20/04/2026", 20]
        ];

        rowsModelo.forEach((linha, idx) => {
            colunasExcelMeses.forEach(mes => {
                let valor = (mes === '02-26' || mes === '03-26') ? (idx === 0 ? 100 : 80) : '';
                linha.push(valor, valor ? 10 : '', valor ? 'Pago' : 'Não Pago');
            });
        });

        let ws = XLSX.utils.aoa_to_sheet([headers, ...rowsModelo]);
        aplicarLargurasExcel(ws, headers);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Modelo");
        XLSX.writeFile(wb, "Modelo_Importacao.xlsx");
    }

    function importarExcel(e) {
        if(!window.XLSX) return alert("A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.");
        let file = e.target.files[0];
        if(!file) return;
        
        let reader = new FileReader();
        reader.onload = function(evt) {
            try {
                let data = new Uint8Array(evt.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let firstSheet = workbook.SheetNames[0];
                let matriz = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1, defval: '' });
                if(matriz.length < 2) throw new Error("Planilha vazia.");

                let headers = matriz[0].map(h => String(h || '').trim());
                let idxNome = indexHeaderExcel(headers, "Nome");
                let idxPlaca = indexHeaderExcel(headers, "Placa");
                let idxAno = indexHeaderExcel(headers, "Ano");
                let idxCategoria = indexHeaderExcel(headers, "Categoria");
                let idxDataLaudo = indexHeaderExcel(headers, "Data Laudo");
                let idxDataSeguro = indexHeaderExcel(headers, "Data Seguro");
                let idxDataLicenca = indexHeaderExcel(headers, "Data Licença");
                let idxDescontoBase = indexHeaderExcel(headers, "Desconto Base (R$)");
                let mesesImportacao = montarMapaMesesImportacao(headers);

                if(idxNome < 0 || mesesImportacao.length === 0) throw new Error("Cabeçalho incompatível.");

                let agrupado = {};
                matriz.slice(1).forEach(row => {
                    let nome = String(getCellExcel(row, idxNome) || '').trim();
                    if(!nome) return;
                    if(!agrupado[nome]) agrupado[nome] = { telefones: [], desconto: "", carros: [], pagamentosPorMes: {} };

                    let descontoBase = parseValorExcel(getCellExcel(row, idxDescontoBase));
                    if(descontoBase > 0) agrupado[nome].desconto = formatMoeda(descontoBase);

                    let pagamentosLinha = [];
                    mesesImportacao.forEach(meta => {
                        let valorPago = parseValorExcel(getCellExcel(row, meta.valorIdx));
                        let status = getCellExcel(row, meta.statusIdx);
                        if(statusExcelPermiteImportar(status, valorPago)) {
                            let dataPagamento = parseDiaPagamentoExcel(getCellExcel(row, meta.dataIdx), meta.ref) || `${meta.ref}-01`;
                            pagamentosLinha.push({ ref: meta.ref, valor: valorPago, data: dataPagamento });
                            if(!agrupado[nome].pagamentosPorMes[meta.ref]) {
                                agrupado[nome].pagamentosPorMes[meta.ref] = { ref: meta.ref, valor: 0, data: dataPagamento };
                            }
                            agrupado[nome].pagamentosPorMes[meta.ref].valor = arredondar2(agrupado[nome].pagamentosPorMes[meta.ref].valor + valorPago);
                            if(dataPagamento > agrupado[nome].pagamentosPorMes[meta.ref].data) {
                                agrupado[nome].pagamentosPorMes[meta.ref].data = dataPagamento;
                            }
                        }
                    });
                    
                    let placa = String(getCellExcel(row, idxPlaca) || '').trim();
                    if(placa) {
                        let primeiroPagamentoLinha = pagamentosLinha.length > 0 ? pagamentosLinha[0].ref : null;

                        agrupado[nome].carros.push({
                            id: 'car_'+Date.now()+Math.random(),
                            placa: placa.toUpperCase(),
                            ano: getCellExcel(row, idxAno) ? String(getCellExcel(row, idxAno)) : "", 
                            categoria: getCellExcel(row, idxCategoria) || "",
                            valor: "0,00",
                            dataLaudo: parseDataExcel(getCellExcel(row, idxDataLaudo)),
                            dataSeguro: parseDataExcel(getCellExcel(row, idxDataSeguro)),
                            dataLicenca: parseDataExcel(getCellExcel(row, idxDataLicenca)),
                            dataCadastro: primeiroPagamentoLinha ? `${primeiroPagamentoLinha}-01` : getHojeSTR(),
                            ativo: true
                        });
                    }
                });

                Object.keys(agrupado).forEach(nome => {
                    let d = agrupado[nome];
                    let cExistente = db.contribuintes.find(c => (c.nome || '').toLowerCase() === nome.toLowerCase());
                    
                    d.carros.forEach(car => {
                        let cat = db.categorias.find(x => x.nome === car.categoria);
                        if(cat && cat.valor) car.valor = cat.valor;
                        marcarRegistroPendente(car);
                    });

                    if(cExistente) {
                        cExistente.carros = d.carros;
                        if(d.desconto) cExistente.desconto = d.desconto;
                    } else {
                        cExistente = { id: 'cont_'+Date.now()+Math.random(), nome: nome, telefones: [], desconto: d.desconto || "0,00", carros: d.carros, pagamentos: [] };
                        db.contribuintes.push(cExistente);
                    }
                    if(!cExistente.pagamentos) cExistente.pagamentos = [];

                    Object.values(d.pagamentosPorMes).forEach(pTmp => {
                        let pgExiste = cExistente.pagamentos.some(pg => pagamentoRefereMes(pg, pTmp.ref));
                        if(!pgExiste) {
                            let valEsperado = calcularValorEsperado(cExistente, pTmp.ref);
                            let valorPago = arredondar2(pTmp.valor);
                            cExistente.pagamentos.push(marcarRegistroPendente({
                                id: 'pg_' + Date.now() + Math.random(),
                                mesAno: pTmp.ref,
                                mesesRef: [pTmp.ref],
                                labelRef: buildLabelRef([pTmp.ref]),
                                valorPago: valorPago,
                                valorOriginal: valEsperado > 0 ? valEsperado : valorPago,
                                parcial: valEsperado > 0 && valorPago < valEsperado,
                                tipoPagamento: valEsperado > 0 && valorPago < valEsperado ? 'parcial' : 'total',
                                dataPagamento: pTmp.data
                            }));
                        }
                    });
                    tocarRegistro(cExistente);
                });
                
                registrarAuditoria('Importação de planilha concluída', `${Object.keys(agrupado).length} contribuinte(s) importado(s)`);
                salvarBanco();
                alert("Importação concluída com sucesso!");
                abrirGerenciarContribuintes();
                renderizarLista();
            } catch(err) {
                console.error(err);
                alert("Ocorreu um erro ao importar. Verifique o formato do arquivo.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = ''; 
    }

    function solicitarAcessoAvancado() { fecharModal('modalPainelUnificado'); document.getElementById('senhaAvancada').value = ''; abrirModal('modalSenhaAvancada'); setTimeout(()=>document.getElementById('senhaAvancada').focus(), 100); }
    document.getElementById('senhaAvancada').addEventListener('input', function(e) { if(this.value === db.configs.senhaAdmin) { this.blur(); this.value = ''; fecharModal('modalSenhaAvancada'); document.getElementById('configUrlApp').value = db.configs.url || ''; abrirModal('modalConfigAvancadas'); } });
    document.getElementById('loginAdminSenha').addEventListener('keydown', function(e) { if(e.key === 'Enter') { e.preventDefault(); entrarAdmin(); } });
    
    async function salvarURL() {
        const inputUrl = document.getElementById('configUrlApp').value.trim();
        if(!inputUrl) return alert("Digite a URL!");

        document.getElementById('loadingOverlay').style.display = 'flex';
        try {
            let fetchUrl = inputUrl + (inputUrl.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
            let res = await fetch(fetchUrl, { redirect: "follow", cache: "no-store" });
            if(!res.ok) throw new Error("Falha ao buscar dados da nuvem");

            let dadosNuvem = await res.json();
            if(!validarBancoImportado(dadosNuvem)) return alert("❌ Dados incompatíveis.");

            let nuvemDB = normalizarBanco(dadosNuvem);
            nuvemDB.configs.url = inputUrl;
            nuvemDB.configs.dadosBaixados = true;
            nuvemDB.configs.ultimaSincronizacao = Date.now();
            db = nuvemDB;
            salvarBanco({ sincronizar: false, marcarLocal: false });
            alert("✅ Concluído!");
            location.reload();
        } catch(e) {
            alert("❌ Falha.");
        } finally {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
    }

    async function sincronizarFundo(forcado = false, apenasEmpurrar = false) {
        if(!db.configs.url || isSyncingFundo) return;

        syncPendente = false;
        isSyncingFundo = true;
        const syncStartedAt = Date.now();
        let indicador = document.getElementById('syncIndicador');
        indicador.style.opacity = '1';

        try {
            let res = await fetch(db.configs.url, {
                method: 'POST',
                redirect: "follow",
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'salvar_banco', dados: db, baseRevision: db.configs.syncRevision || 0 })
            });
            if(!res.ok) throw new Error("Falha ao salvar na nuvem");
            let retorno = await res.json().catch(() => null);
            if(retorno && retorno.ok) {
                if(retorno.dados && validarBancoImportado(retorno.dados)) {
                    aplicarBancoAtualizado(retorno.dados, { syncStartedAt });
                } else {
                    db.configs.syncRevision = retorno.revision || db.configs.syncRevision || 0;
                    db.configs.ultimaSincronizacao = Date.now();
                    localStorage.setItem('cooptrans_v1', JSON.stringify(db));
                }
            }
        } catch(e) {
            syncPendente = true;
        } finally {
            isSyncingFundo = false;
            indicador.style.opacity = '0';
            if(syncPendente) {
                clearTimeout(syncTimer);
                syncTimer = setTimeout(() => sincronizarFundo(false, true), 5000);
            }
        }
    }

    async function puxarDadosNuvem(silencioso = true) {
        if(!db.configs.url || isSyncingFundo) return;
        if(syncPendente || temMudancaLocalPendente()) {
            sincronizarFundo(false, true);
            return;
        }

        try {
            let fetchUrl = db.configs.url + (db.configs.url.includes('?') ? '&' : '?') + 'nocache=' + Date.now();
            let res = await fetch(fetchUrl, { redirect: "follow", cache: "no-store" });
            if(!res.ok) throw new Error("Falha ao puxar dados da nuvem");
            let nuvemDB = await res.json();
            if(!validarBancoImportado(nuvemDB)) return;

            nuvemDB = normalizarBanco(nuvemDB);
            let revisaoNuvem = parseInt(nuvemDB.configs.syncRevision || 0);
            let revisaoLocal = parseInt(db.configs.syncRevision || 0);
            if(revisaoNuvem <= revisaoLocal) return;

            aplicarBancoAtualizado(nuvemDB);
        } catch(e) {
            if(!silencioso) alert("Não foi possível puxar os dados da nuvem.");
        }
    }
    async function forcarEnvioNuvemCompleto() { if(!db.configs.url) return alert("Configure a URL!"); document.getElementById('loadingOverlay').style.display = 'flex'; try { let syncStartedAt = Date.now(); let res = await fetch(db.configs.url, { method: 'POST', redirect: "follow", headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'salvar_banco', dados: db }) }); if(!res.ok) throw new Error("Erro"); let retorno = await res.json().catch(() => null); if(retorno && retorno.dados && validarBancoImportado(retorno.dados)) aplicarBancoAtualizado(retorno.dados, { syncStartedAt }); alert("✅ Backup salvo!"); } catch(e) { alert("❌ Falha."); } finally { document.getElementById('loadingOverlay').style.display = 'none'; } }
    
    function exportarDadosBackup() { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db)); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", "cooptrans_bkp_" + getHojeSTR() + ".json"); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); }
    function importarDadosBackup(event) {
        const file = event.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedDb = JSON.parse(e.target.result);
                if(!validarBancoImportado(importedDb)) return alert("Backup inválido ou incompatível.");

                let urlSalva = db.configs.url;
                db = normalizarBanco(importedDb);
                if(urlSalva) db.configs.url = urlSalva;
                salvarBanco();
                alert("✅ Restaurado!");
                location.reload();
            } catch(err) {
                alert("Erro ao ler.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    function validarBancoImportado(dados) {
        return !!(dados && dados.app_id === "cooptrans" && dados.cooperativa && typeof dados.cooperativa === 'object');
    }
    async function excluirTodoHistorico() { let frase = document.getElementById('inputExcluirTudo').value.trim().toLowerCase(); if(frase === "quero excluir todo o histórico") { if(!confirm("⚠️ TEM CERTEZA?")) return; db.contribuintes.forEach(c => { (c.pagamentos || []).forEach(pg => registrarExclusao('pagamentos', pg.id)); c.pagamentos = []; tocarRegistro(c); }); registrarAuditoria('Histórico de pagamentos apagado', 'Todos os lançamentos foram removidos'); marcarMudancaEstrutural(); document.getElementById('inputExcluirTudo').value = ''; fecharModal('modalConfigAvancadas'); alert("✅ Limpo!"); renderizarLista(); } else { alert("Frase incorreta."); } }
    async function forcarAtualizacao() {
        if(!confirm("Deseja forçar a atualização do aplicativo?")) return;
        try {
            if('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(registration => registration.unregister()));
            }
            if(window.caches) {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            }
        } catch(e) {
            console.warn("Não foi possível limpar todo o cache automaticamente.", e);
        }
        window.location.replace(window.location.pathname + '?nocache=' + Date.now());
    }







