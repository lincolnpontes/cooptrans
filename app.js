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
    function maskMoeda(el) { let v = el.value.replace(/\D/g, ""); if(!v) { el.value = ""; return; } v = (parseFloat(v) / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2}); el.value = v; }
    function parseMoeda(str) { if(!str) return 0; return parseFloat(String(str).replace(/\./g, "").replace(",", ".")); }
    function formatMoeda(val) { return parseFloat(val).toLocaleString('pt-BR', {minimumFractionDigits: 2}); }
    function formatDataBR(dataStr) { if(!dataStr) return ""; const partes = dataStr.split('-'); if(partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`; return dataStr; }
    function escapeHTML(valor) { return String(valor ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
    function getHojeSTR() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    function getPastMonthStr() { let d = new Date(); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
    function getExtensoMes(mesNum) { const m = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]; return m[parseInt(mesNum)-1] || ""; }
    function getAbrevMes(mesNum) { const m = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; return m[parseInt(mesNum)-1] || ""; }

    // DADOS BASE E TEMA
    let db = carregarBanco(); 
    let isSyncingFundo = false;
    let tempCategorias = [];
    let tempTelefones = [];
    let tempCarros = [];
    let tempPixCoop = [];
    let filtroViewAtual = 'todos'; 
    let chartArrecadacao = null;
    let chartInadimplencia = null;
    let syncTimer = null;
    let syncPendente = false;

    function criarBancoBase() {
        return {
            app_id: "cooptrans",
            cooperativa: { logo: "", razao: "", fantasia: "", cnpj: "", pixList: [] },
            categorias: [], 
            contribuintes: [], 
            administradores: [],
            configGerais: { 
                corTema: "#008C4A",
                corSubHeader: "#ffffff",
                alertas: {
                    laudo: { ativo: true, dias: 7 },
                    seguro: { ativo: true, dias: 7 },
                    licenca: { ativo: true, dias: 7 }
                }
            },
            configs: { url: "", dadosBaixados: false, ultimaMudancaLocal: 0, senhaAdmin: "1999" }
        };
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

        const alertas = (dados.configGerais && dados.configGerais.alertas) || {};
        dados.configGerais = { ...base.configGerais, ...(dados.configGerais || {}) };
        dados.configGerais.alertas = {
            laudo: { ...base.configGerais.alertas.laudo, ...(alertas.laudo || {}) },
            seguro: { ...base.configGerais.alertas.seguro, ...(alertas.seguro || {}) },
            licenca: { ...base.configGerais.alertas.licenca, ...(alertas.licenca || {}) }
        };

        dados.configs = { ...base.configs, ...(dados.configs || {}) };
        return dados;
    }
    
    function salvarBanco(opcoes = {}) {
        localStorage.setItem('cooptrans_v1', JSON.stringify(db));
        if(opcoes.sincronizar !== false) agendarSincronizacao();
    }

    function agendarSincronizacao() {
        if(!db.configs || !db.configs.url) return;
        syncPendente = true;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => sincronizarFundo(false, true), 1500);
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

    document.addEventListener("DOMContentLoaded", () => { 
        aplicarTema();
        renderizarCabecalhoPrincipal();
        setTimeout(() => {
            document.getElementById('splashScreen').style.opacity = '0';
            setTimeout(()=>{document.getElementById('splashScreen').style.display = 'none';}, 500); 
        }, 1000); 
        
        let hjMes = getHojeSTR().substring(0,7);
        document.getElementById('filtroMesGeral').value = hjMes;
        atualizarTextoMesGeral();
    });

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
        }
    }

    function atualizarTextoMesGeral() {
        let val = document.getElementById('filtroMesGeral').value;
        if(val) {
            let partes = val.split('-');
            let mesNome = getExtensoMes(partes[1]);
            document.getElementById('lblMesVisivel').innerText = `${mesNome} ${partes[0]}`;
        }
        try { renderizarLista(); } catch(e) { console.error("Erro ao renderizar lista", e); }
    }

    function calcularValorEsperado(c, mesRef) {
        let soma = 0;
        (c.carros || []).forEach(car => {
            if(!car.ativo) return;
            let cadMonth = car.dataCadastro ? car.dataCadastro.substring(0,7) : '2000-01'; 
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
        let recebidoVal = 0;
        let recebidoQtd = 0;
        let pendenteVal = 0;
        let pendenteQtd = 0;

        db.contribuintes.forEach(c => {
            let valEsp = calcularValorEsperado(c, mesRef);
            let carrosDeste = (c.carros || []).filter(car => car.ativo && car.dataCadastro.substring(0,7) <= mesRef).length;
            
            if(valEsp > 0 || carrosDeste > 0) {
                totalContribAtivos++;
                totalCarrosAtivos += carrosDeste;

                if(isMesPago(c, mesRef)) {
                    recebidoVal += valEsp;
                    recebidoQtd++;
                } else if(valEsp > 0) {
                    pendenteVal += valEsp;
                    pendenteQtd++;
                }
            }
        });

        let totalEsperadoMes = recebidoVal + pendenteVal;

        document.getElementById('dashTotalContrib').innerText = totalContribAtivos;
        document.getElementById('dashTotalCarros').innerText = totalCarrosAtivos;
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
                let valEsp = calcularValorEsperado(c, m);
                if(valEsp > 0) {
                    if(isMesPago(c, m)) {
                        recVal += valEsp;
                        recQtd++;
                    } else {
                        penVal += valEsp;
                        penQtd++;
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
            let d = new Date(dataStr + "T00:00:00");
            let diffDias = Math.ceil((d - hoje) / (1000 * 60 * 60 * 24));
            let diasAviso = parseInt(confAlertas[confKey].dias) || 7;
            let vencidoWord = genero === 'a' ? 'vencida' : 'vencido';
            
            if(diffDias < 0) {
                let diasPassados = Math.abs(diffDias);
                alertas.push(`<b>${nome} ${vencidoWord} há ${diasPassados} dias (${escapeHTML(carro.placa)})</b>`);
            } else if(diffDias === 0) {
                alertas.push(`<b>${nome} vence HOJE (${escapeHTML(carro.placa)})</b>`);
            } else if(diffDias <= diasAviso) {
                alertas.push(`<b>${nome} vence em ${diffDias} dias (${escapeHTML(carro.placa)})</b>`);
            }
        };
        
        checkData(carro.dataLaudo, "Laudo", "laudo", "o");
        checkData(carro.dataSeguro, "Seguro", "seguro", "o");
        checkData(carro.dataLicenca, "Licença", "licenca", "a");
        return alertas;
    }

    function isMesPago(c, mesRef) {
        if(!c.pagamentos) return false;
        return c.pagamentos.some(p => (p.mesesRef && p.mesesRef.includes(mesRef)) || p.mesAno === mesRef);
    }

    function getAvatarColor(c, temAlerta) {
        let owesPast = false;
        let earliestCar = null;
        (c.carros || []).forEach(car => {
            if(car.ativo) { if(!earliestCar || car.dataCadastro < earliestCar) earliestCar = car.dataCadastro; }
        });
        if(earliestCar) {
            let startMes = earliestCar.substring(0,7);
            let endMes = getPastMonthStr();
            if(startMes <= endMes) {
                let curr = new Date(startMes + '-01T00:00:00');
                let end = new Date(endMes + '-01T00:00:00');
                while(curr <= end) {
                    let m = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`;
                    if(calcularValorEsperado(c, m) > 0 && !isMesPago(c, m)) { owesPast = true; break; }
                    curr.setMonth(curr.getMonth() + 1);
                }
            }
        }
        if(owesPast) return '#D32F2F'; // Vermelho
        if(temAlerta) return '#E65100'; // Laranja
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
            let carrosAtivos = (c.carros || []).filter(car=>car.ativo).length;
            if (carrosAtivos === 0) return; // Nao mostra se nao tem carro ativo

            if (buscaNome && !(c.nome || '').toLowerCase().includes(buscaNome)) return;

            let valorEsperado = calcularValorEsperado(c, mesRef);
            let pago = isMesPago(c, mesRef);
            let pendente = !pago && valorEsperado > 0;

            let alertasArr = [];
            (c.carros || []).forEach(car => { alertasArr = alertasArr.concat(checarAlertasCarro(car)); });
            let temAlerta = alertasArr.length > 0;

            if(filtroViewAtual === 'pendentes' && !pendente) return;
            if(filtroViewAtual === 'vencimentos' && !temAlerta) return;

            let avatarCor = getAvatarColor(c, temAlerta);

            let statusPgtoHtml = pendente 
                ? `<span class="status-badge status-pendente">Falta Pagar R$ ${formatMoeda(valorEsperado)}</span>` 
                : `<span class="status-badge status-ok">Pago / Regular</span>`;
            
            let emojisCarros = '';
            (c.carros || []).filter(car=>car.ativo).forEach(car => {
                let catObj = db.categorias.find(x => x.nome === car.categoria);
                emojisCarros += catObj && catObj.emoji ? catObj.emoji : '🚗';
            });
            let subtitleText = carrosAtivos > 0 
                ? `<div class="item-subtitle" style="font-size:14px; letter-spacing:1px; margin-top:2px;">${emojisCarros}</div>` 
                : `<div class="item-subtitle" style="font-size:11px;">Nenhum veículo ativo</div>`;
            
            let alertasHtml = '';
            if(temAlerta) alertasHtml = alertasArr.join('<br>');
            
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
                    <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-right: 5px;">
                        ${statusPgtoHtml}
                    </div>
                    ${temAlerta ? `<div style="text-align: right; flex-shrink: 0; display:flex; align-items:center;"><div class="alert-home-text">${alertasHtml}</div></div>` : ''}
                </div>
            </li>`;
        });

        if(html === '') html = `<li style="padding: 20px; text-align: center; color: #999;">Nenhum contribuinte encontrado.</li>`;
        lista.innerHTML = html;
    }

    function abrirGerenciarContribuintes() {
        fecharModal('modalPainelUnificado');
        document.getElementById('tituloListagem').innerText = "Gerenciar Contribuintes";
        document.getElementById('btnNovoListagem').onclick = () => abrirFormContribuinte(null);
        document.getElementById('btnVoltarListagem').onclick = () => { fecharModal('modalListagem'); abrirModal('modalPainelUnificado'); };
        document.getElementById('boxAcoesExtrasExcel').style.display = 'flex';
        
        let htmlLista = '';
        let contribs = [...db.contribuintes].sort((a,b) => (a.nome || '').localeCompare(b.nome || ''));
        contribs.forEach((c) => { 
            let carrosQtd = (c.carros || []).length;
            htmlLista += `<div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><strong>${escapeHTML(c.nome || 'Sem Nome')}</strong><br><small style="color:#666;">${carrosQtd} Veículo(s) | Total Base: R$ ${escapeHTML(c.valorTotal || '0,00')}</small></div>
                <div style="flex-shrink:0; margin-left:10px;">
                    <button style="background:none; border:none; font-size:20px; cursor:pointer;" onclick="abrirFormContribuinte('${c.id}')">✏️</button>
                    <button style="background:none; border:none; font-size:20px; cursor:pointer; color:#d32f2f;" onclick="excluirContribuinte('${c.id}')">🗑️</button>
                </div>
            </div>`; 
        });
        document.getElementById('conteudoListagem').innerHTML = htmlLista;
        abrirModal('modalListagem');
    }

    let oldFecharModal = fecharModal;
    fecharModal = function(id) {
        if(id === 'modalListagem') document.getElementById('boxAcoesExtrasExcel').style.display = 'none';
        oldFecharModal(id);
    }

    function excluirContribuinte(id) {
        if(confirm("Deseja realmente excluir este contribuinte e todo o seu histórico?")) {
            db.contribuintes = db.contribuintes.filter(x => x.id !== id);
            salvarBanco();
            abrirGerenciarContribuintes();
            renderizarLista();
        }
    }

    function abrirFormContribuinte(id, fromAcoes = false) {
        fecharModal('modalListagem');
        fecharModal('modalAcoesContribuinte');
        
        document.getElementById('contFromAcoes').value = fromAcoes ? 'true' : 'false';
        tempTelefones = [];
        tempCarros = [];
        
        if(id) {
            let c = db.contribuintes.find(x => x.id === id);
            document.getElementById('contId').value = c.id;
            document.getElementById('contNome').value = c.nome || '';
            document.getElementById('contDesconto').value = c.desconto || '';
            if(c.telefones) tempTelefones = [...c.telefones];
            if(c.carros) tempCarros = JSON.parse(JSON.stringify(c.carros));
        } else {
            document.getElementById('contId').value = '';
            document.getElementById('contNome').value = '';
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
        
        let id = document.getElementById('contId').value || 'cont_' + Date.now();
        let novo = {
            id: id,
            nome: nome,
            telefones: tempTelefones,
            desconto: document.getElementById('contDesconto').value,
            valorTotal: document.getElementById('contValor').value,
            carros: tempCarros,
            pagamentos: db.contribuintes.find(x=>x.id===id)?.pagamentos || []
        };
        
        const idx = db.contribuintes.findIndex(x => x.id === id);
        if(idx >= 0) db.contribuintes[idx] = novo; else db.contribuintes.push(novo);
        
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
            let badge = c.ativo ? '<span style="color:#2E7D32; font-weight:bold; font-size:11px;">Ativo</span>' : '<span style="color:#D32F2F; font-weight:bold; font-size:11px;">Arquivado</span>';
            html += `<div class="list-item-config" style="align-items:flex-start;">
                <div><span style="font-size:16px;">${escapeHTML(emj)}</span> <strong>${escapeHTML(c.placa)}</strong> - ${escapeHTML(c.ano)}<br><small>${escapeHTML(c.categoria)} | R$ ${escapeHTML(c.valor)}</small><br>${badge}</div>
                <div><button class="btn-edit-small" onclick="abrirFormCarro(${i})">✏️</button></div>
            </div>`;
        });
        box.innerHTML = html;
        calcTotalContribuinte();
    }

    function abrirCarroFromAcoes(carIdx) {
        let contId = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === contId);
        tempCarros = c.carros ? JSON.parse(JSON.stringify(c.carros)) : [];
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
            document.getElementById('carArquivado').checked = !c.ativo;
            document.getElementById('carMotivo').value = c.motivoArquivamento || '';
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
            document.getElementById('carArquivado').checked = false;
            document.getElementById('carMotivo').value = '';
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
        
        if(isArq && !motivo) return alert("Por favor, informe o motivo do arquivamento.");

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
            ativo: !isArq,
            motivoArquivamento: isArq ? motivo : ''
        };

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
        let num = c.telefones[0].replace(/\D/g, ''); 
        
        if(!db.cooperativa.pixList || db.cooperativa.pixList.length === 0) return alert("Nenhuma chave cadastrada nos dados da Cooperativa!");
        let p = db.cooperativa.pixList.find(x => x.principal) || db.cooperativa.pixList[0];
        let fan = db.cooperativa.fantasia || "Cooperativa";

        let txt = `> PIX da *${fan}:*\n*Tipo:* ${p.tipo}\n*Chave:* ${p.chave}\n*Beneficiário:* ${p.beneficiario}`;
        window.open(`https://wa.me/55${num}?text=${encodeURIComponent(txt)}`, '_blank');
    }

    function toggleMultiMes() {
        let isMulti = document.getElementById('switchMultiMes').checked;
        document.getElementById('boxSingleMes').style.display = isMulti ? 'none' : 'block';
        document.getElementById('boxMultiMes').style.display = isMulti ? 'block' : 'none';
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

        let alertasArr = [];
        (c.carros || []).forEach(car => { alertasArr = alertasArr.concat(checarAlertasCarro(car)); });
        let boxAlertas = document.getElementById('boxAlertasAcoes');
        if(alertasArr.length > 0) {
            boxAlertas.innerHTML = `<div style="font-size:16px; color:#D32F2F; text-align:center; line-height:1.4;">${alertasArr.join('<br>')}</div>`;
            boxAlertas.style.display = 'block';
        } else {
            boxAlertas.style.display = 'none';
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
                boxCarros.innerHTML += `<button class="btn-outline" style="flex:1; min-width:100px; padding:10px; font-size:14px; font-weight:bold; text-align:center; border-radius:8px;" onclick="abrirCarroFromAcoes(${idx})">${escapeHTML(emj)} ${escapeHTML(car.placa)}</button>`;
            });
        } else {
            boxCarros.innerHTML = '<div style="color:#999; font-size:13px; text-align:center; width:100%;">Nenhum veículo vinculado.</div>';
        }
    }

    function renderizarStatusPagamento(c, mesRef) {
        let valorEsperado = calcularValorEsperado(c, mesRef);
        let pago = isMesPago(c, mesRef);
        
        let box = document.getElementById('boxStatusPagamento');
        let pgSingle = document.getElementById('pgValorSingle');

        if(!pago && valorEsperado > 0) {
            box.innerHTML = `<div style="font-size:24px; font-weight:bold; color:#D32F2F;">Falta Pagar: R$ ${formatMoeda(valorEsperado)}</div>`;
            pgSingle.value = formatMoeda(valorEsperado);
            pgSingle.dataset.esperado = valorEsperado;
        } else if (pago) {
            box.innerHTML = `<div style="font-size:24px; font-weight:bold; color:#2E7D32;">✅ Mês já foi Pago</div>`;
            pgSingle.value = formatMoeda(valorEsperado);
            pgSingle.dataset.esperado = valorEsperado;
        } else {
            box.innerHTML = `<div style="font-size:18px; font-weight:bold; color:#666;">Isento / Sem Valor Devido</div>`;
            pgSingle.value = "0,00";
            pgSingle.dataset.esperado = "0";
        }
        
        // Mantem destravado para editar a data ref
        document.getElementById('boxSingleMes').style.pointerEvents = 'auto';
        document.getElementById('boxSingleMes').style.opacity = '1';
    }

    function registrarPagamentoSingle() {
        let id = document.getElementById('acoesContId').value;
        let c = db.contribuintes.find(x => x.id === id);
        let mesRef = document.getElementById('pgMesRefSingle').value; 
        
        let valorPagoStr = document.getElementById('pgValorSingle').value; 
        let valorPago = parseMoeda(valorPagoStr);
        let dataPgto = document.getElementById('pgDataSingle').value;

        if(!dataPgto) return alert("Preencha a data do pagamento.");
        if(valorPago <= 0) return alert("Digite um valor válido para receber.");

        if(isMesPago(c, mesRef)) return alert("Este mês já consta como pago!");

        if(!c.pagamentos) c.pagamentos = [];
        c.pagamentos.push({
            id: 'pg_' + Date.now(),
            mesAno: mesRef,
            mesesRef: [mesRef],
            labelRef: buildLabelRef([mesRef]),
            valorPago: valorPago,
            dataPagamento: dataPgto
        });
        
        salvarBanco();
        abrirAcoesContribuinte(id);
        renderizarLista();
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

    function calcPgtoMulti(mostrarErro = true) {
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
        let meses = getMesesRange(ini, fim);
        
        let total = 0;
        let erro = null;
        
        meses.forEach(m => {
            if(isMesPago(c, m)) erro = `Mês ${m.split('-').reverse().join('/')} já consta como pago!`;
            else total += calcularValorEsperado(c, m);
        });
        
        let iptValor = document.getElementById('pgValorMulti');
        let descExtra = parseMoeda(document.getElementById('pgDescontoMulti').value);
        let finalVal = Math.max(0, total - descExtra);

        let boxAviso = document.getElementById('avisoErroMulti');

        if(erro) {
            iptValor.value = '0,00';
            iptValor.dataset.esperado = 0;
            boxAviso.innerHTML = `<span style="color:#D32F2F; font-size:13px; font-weight:bold;">⚠️ ${erro}</span>`;
            if(mostrarErro) boxAviso.style.display = 'block';
        } else {
            iptValor.value = formatMoeda(finalVal);
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
        
        if(!ini || !dataPgto) return alert("Preencha o mês de início e a data de pagamento.");
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
        
        salvarBanco();
        abrirAcoesContribuinte(id); 
        renderizarLista(); 
    }

    function excluirPagamento(contId, pgId) {
        if(!confirm("Remover este pagamento?")) return;
        let c = db.contribuintes.find(x => x.id === contId);
        c.pagamentos = c.pagamentos.filter(p => p.id !== pgId);
        salvarBanco();
        abrirAcoesContribuinte(contId);
        renderizarLista();
    }

    function getMesesPendentes(c) {
        let pending = [];
        let earliestCar = null;
        (c.carros || []).forEach(car => {
            if(car.ativo) { if(!earliestCar || car.dataCadastro < earliestCar) earliestCar = car.dataCadastro; }
        });
        if(!earliestCar) return pending;

        let startMes = earliestCar.substring(0,7);
        let endMes = getHojeSTR().substring(0,7); // Vai até o mes atual
        
        if(startMes <= endMes) {
            let curr = new Date(startMes + '-01T00:00:00');
            let end = new Date(endMes + '-01T00:00:00');
            while(curr <= end) {
                let m = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}`;
                if(calcularValorEsperado(c, m) > 0 && !isMesPago(c, m)) {
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
                return `<span style="background:#FFEBEE; color:#D32F2F; padding:2px 6px; border-radius:4px; font-weight:bold; margin-right:4px; margin-bottom:4px; display:inline-block;">${parts[1]}/${parts[0]}</span>`;
            }).join('');
            pendentesHtml = `<div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed #ccc;">
                <div style="font-weight:bold; color:#D32F2F; margin-bottom:5px;">Meses Pendentes:</div>
                ${pTags}
            </div>`;
        } else {
            pendentesHtml = `<div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px dashed #ccc; color:#2E7D32; font-weight:bold;">✅ Nenhuma pendência em aberto.</div>`;
        }

        if(!c.pagamentos || c.pagamentos.length === 0) { 
            box.innerHTML = pendentesHtml + '<div style="color:#999; text-align:center;">Nenhum pagamento registrado.</div>'; 
            return; 
        }
        
        let pgtos = [...c.pagamentos].sort((a,b) => b.mesAno.localeCompare(a.mesAno) || new Date(b.dataPagamento) - new Date(a.dataPagamento));
        
        let html3 = '';
        let htmlRest = '';

        pgtos.forEach((p, i) => {
            let label = p.labelRef ? p.labelRef : p.mesAno.split('-').reverse().join('/');
            let row = `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding:8px 0;">
                <div><b>Ref: ${label}</b><br><small style="color:#666;">Pago em: ${formatDataBR(p.dataPagamento)}</small></div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <b style="color:#2E7D32;">R$ ${formatMoeda(p.valorPago)}</b>
                    <button style="background:none; border:none; color:#d32f2f; cursor:pointer; font-weight:bold; font-size:16px;" onclick="excluirPagamento('${c.id}', '${p.id}')">X</button>
                </div>
            </div>`;
            if(i < 3) html3 += row;
            else htmlRest += row;
        });

        box.innerHTML = pendentesHtml + html3;
        if(pgtos.length > 3) {
            box.innerHTML += `<div id="histRestante" style="display:none;">${htmlRest}</div>
            <button id="btnToggleHist" class="btn-outline" style="width:100%; margin-top:10px; font-size:12px; padding:6px;" onclick="toggleHistoricoAcoes()">Ver Todo o Histórico</button>`;
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
        if(tempPixCoop.length === 0) { box.innerHTML = '<div style="color:#999; font-size:12px; text-align:center;">Nenhuma chave PIX.</div>'; return; }
        box.innerHTML = tempPixCoop.map((p, i) => `<div class="list-item-config" style="align-items:flex-start;">
            <div><span style="word-break: break-all;">${escapeHTML(p.tipo)}: <b>${escapeHTML(p.chave)}</b></span><br><small>Ben: ${escapeHTML(p.beneficiario)}</small><br>
            <label class="radio-custom"><input type="radio" name="pixPrinc" onchange="setPixPrincipal(${i})" ${p.principal ? 'checked' : ''}> Principal</label></div>
            <button onclick="removerPixCoop(${i})" style="margin-top:5px;">X</button>
        </div>`).join('');
    }
    
    function addPixCoop() { 
        let tipo = document.getElementById('novoPixTipoCoop').value; 
        let chv = document.getElementById('novoPixInputCoop').value.trim(); 
        let ben = document.getElementById('novoPixBenCoop').value.trim();
        if(tipo === 'E-mail') { chv = chv.toLowerCase(); if(!chv.includes('@') || !chv.includes('.')) return alert('E-mail inválido.'); }
        if(chv && ben) {
            tempPixCoop.push({ tipo: tipo, chave: chv, beneficiario: ben, principal: tempPixCoop.length === 0 });
            document.getElementById('novoPixInputCoop').value = ''; 
            document.getElementById('novoPixBenCoop').value = ''; 
            renderListaPixCoop(); 
        } else {
            alert('Preencha a chave e o nome do beneficiário.');
        }
    }
    function removerPixCoop(idx) { tempPixCoop.splice(idx, 1); if(tempPixCoop.length > 0 && !tempPixCoop.some(p => p.principal)) tempPixCoop[0].principal = true; renderListaPixCoop(); }
    function setPixPrincipal(idx) { tempPixCoop.forEach((p, i) => p.principal = (i === idx)); }

    function salvarCooperativa() {
        db.cooperativa.logo = document.getElementById('coopLogoBase64').value;
        db.cooperativa.razao = document.getElementById('coopRazao').value;
        db.cooperativa.fantasia = document.getElementById('coopFantasia').value;
        db.cooperativa.cnpj = document.getElementById('coopCNPJ').value;
        db.cooperativa.pixList = tempPixCoop;
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
                tempCategorias[editIdx] = {emoji: e, nome: n, valor: v}; 
            } else { 
                tempCategorias.push({emoji: e, nome: n, valor: v}); 
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

    function removerCategoria(idx) { tempCategorias.splice(idx, 1); renderListasCategorias(); }

    function salvarConfigGerais() {
        db.configGerais.corTema = document.getElementById('confCorTema').value;
        db.configGerais.corSubHeader = document.getElementById('confCorSub').value;
        db.configGerais.alertas = {
            laudo: { ativo: document.getElementById('confAlertaLaudo').checked, dias: document.getElementById('confDiasLaudo').value || 7 },
            seguro: { ativo: document.getElementById('confAlertaSeguro').checked, dias: document.getElementById('confDiasSeguro').value || 7 },
            licenca: { ativo: document.getElementById('confAlertaLicenca').checked, dias: document.getElementById('confDiasLicenca').value || 7 }
        };
        db.categorias = tempCategorias;
        salvarBanco();
        aplicarTema();
        fecharModal('modalConfigGerais');
        abrirModal('modalPainelUnificado');
        renderizarLista(); 
    }

    function abrirGerenciar(tipo) {
        if(tipo === 'administradores') {
            fecharModal('modalPainelUnificado');
            document.getElementById('tituloListagem').innerText = "Administradores";
            document.getElementById('btnNovoListagem').onclick = () => abrirFormAdmin(null);
            document.getElementById('btnVoltarListagem').onclick = () => { fecharModal('modalListagem'); abrirModal('modalPainelUnificado'); };
            let htmlLista = '';
            db.administradores.forEach((a) => { htmlLista += `<div style="padding:10px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center;"><div><strong>${escapeHTML(a.nome)}</strong></div><div><button style="background:none; border:none; font-size:20px; cursor:pointer;" onclick="abrirFormAdmin('${a.id}')">✏️</button></div></div>`; });
            document.getElementById('conteudoListagem').innerHTML = htmlLista;
            abrirModal('modalListagem');
        }
    }

    function abrirFormAdmin(id) {
        fecharModal('modalListagem');
        if(id) {
            let a = db.administradores.find(x => x.id === id);
            document.getElementById('adminId').value = a.id;
            document.getElementById('adminNome').value = a.nome;
            document.getElementById('adminSenha').value = a.senha;
        } else {
            document.getElementById('adminId').value = '';
            document.getElementById('adminNome').value = '';
            document.getElementById('adminSenha').value = '';
        }
        abrirModal('modalFormAdmin');
    }

    function salvarAdmin() {
        let id = document.getElementById('adminId').value || 'adm_' + Date.now();
        let novo = { id: id, nome: document.getElementById('adminNome').value, senha: document.getElementById('adminSenha').value };
        const idx = db.administradores.findIndex(x => x.id === id);
        if(idx >= 0) db.administradores[idx] = novo; else db.administradores.push(novo);
        salvarBanco(); fecharModal('modalFormAdmin'); abrirGerenciar('administradores');
    }

    let colunasExcelMeses = ['01-26', '02-26', '03-26', '04-26'];

    function exportarExcel() {
        if(!window.XLSX) return alert("A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.");
        let data = [];
        db.contribuintes.forEach(c => {
            if(!c.carros || c.carros.length === 0) {
                let row = { "Nome": c.nome, "Placa": "", "Ano": "", "Categoria": "", "Data Laudo": "", "Data Seguro": "", "Data Licença": "" };
                colunasExcelMeses.forEach(mesRef => row[mesRef] = "");
                data.push(row);
            } else {
                c.carros.forEach(car => {
                    let row = { "Nome": c.nome, "Placa": car.placa, "Ano": car.ano, "Categoria": car.categoria, "Data Laudo": car.dataLaudo ? formatDataBR(car.dataLaudo) : "", "Data Seguro": car.dataSeguro ? formatDataBR(car.dataSeguro) : "", "Data Licença": car.dataLicenca ? formatDataBR(car.dataLicenca) : "" };
                    colunasExcelMeses.forEach(col => {
                        let partesCol = col.split('-');
                        let keyBusca = `20${partesCol[1]}-${partesCol[0]}`; 
                        let pg = (c.pagamentos || []).find(p => (p.mesesRef && p.mesesRef.includes(keyBusca)) || p.mesAno === keyBusca);
                        if(pg) {
                            let dia = pg.dataPagamento.split('-')[2];
                            row[col] = dia;
                        } else {
                            row[col] = "";
                        }
                    });
                    data.push(row);
                });
            }
        });
        let ws = XLSX.utils.json_to_sheet(data);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Contribuintes");
        XLSX.writeFile(wb, "Contribuintes_" + getHojeSTR() + ".xlsx");
    }

    function baixarModeloExcel() {
        if(!window.XLSX) return alert("A biblioteca do Excel não foi carregada. Verifique sua conexão com a internet.");
        let row = { "Nome": "João Silva", "Placa": "ABC1D23", "Ano": "2020", "Categoria": "Van", "Data Laudo": "20/04/2026", "Data Seguro": "20/04/2026", "Data Licença": "20/04/2026" };
        colunasExcelMeses.forEach(mes => row[mes] = "15"); 
        
        let ws = XLSX.utils.json_to_sheet([row]);
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
                let rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
                
                let agrupado = {};
                rows.forEach(r => {
                    let nome = r["Nome"];
                    if(!nome) return;
                    if(!agrupado[nome]) agrupado[nome] = { telefones: [], desconto: "0,00", carros: [], pagamentosTemp: [] };
                    
                    if(r["Placa"]) {
                        let parseData = (dRaw) => {
                            if(!dRaw) return "";
                            let str = dRaw.toString();
                            return str.includes('/') ? str.split('/').reverse().join('-') : str;
                        };

                        agrupado[nome].carros.push({
                            id: 'car_'+Date.now()+Math.random(),
                            placa: r["Placa"].toString().toUpperCase(), ano: r["Ano"] ? r["Ano"].toString() : "", 
                            categoria: r["Categoria"]||"", valor: "0,00",
                            dataLaudo: parseData(r["Data Laudo"]),
                            dataSeguro: parseData(r["Data Seguro"]),
                            dataLicenca: parseData(r["Data Licença"]),
                            dataCadastro: getHojeSTR(),
                            ativo: true
                        });
                    }

                    colunasExcelMeses.forEach(col => {
                        if(r[col]) {
                            let dia = String(r[col]).padStart(2, '0');
                            let pCol = col.split('-');
                            let mesAnoRef = `20${pCol[1]}-${pCol[0]}`;
                            let dtPgto = `20${pCol[1]}-${pCol[0]}-${dia}`;
                            agrupado[nome].pagamentosTemp.push({ ref: mesAnoRef, dt: dtPgto });
                        }
                    });
                });

                Object.keys(agrupado).forEach(nome => {
                    let d = agrupado[nome];
                    let cExistente = db.contribuintes.find(c => (c.nome || '').toLowerCase() === nome.toLowerCase());
                    
                    d.carros.forEach(car => {
                        let cat = db.categorias.find(x => x.nome === car.categoria);
                        if(cat && cat.valor) car.valor = cat.valor;
                    });

                    if(cExistente) {
                        cExistente.carros = d.carros;
                    } else {
                        cExistente = { id: 'cont_'+Date.now()+Math.random(), nome: nome, telefones: [], desconto: "0,00", carros: d.carros, pagamentos: [] };
                        db.contribuintes.push(cExistente);
                    }

                    // Aplica pagamentos achados
                    d.pagamentosTemp.forEach(pTmp => {
                        let pgExiste = isMesPago(cExistente, pTmp.ref);
                        if(!pgExiste) {
                            let valEsperado = calcularValorEsperado(cExistente, pTmp.ref);
                            cExistente.pagamentos.push({
                                id: 'pg_' + Date.now() + Math.random(),
                                mesAno: pTmp.ref,
                                mesesRef: [pTmp.ref],
                                labelRef: buildLabelRef([pTmp.ref]),
                                valorPago: valEsperado > 0 ? valEsperado : 0,
                                dataPagamento: pTmp.dt
                            });
                        }
                    });
                });
                
                salvarBanco();
                alert("Importação concluída com sucesso!");
                abrirGerenciarContribuintes();
                renderizarLista();
            } catch(err) {
                alert("Ocorreu um erro ao importar. Verifique o formato do arquivo.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = ''; 
    }

    function solicitarAcessoAvancado() { fecharModal('modalPainelUnificado'); document.getElementById('senhaAvancada').value = ''; abrirModal('modalSenhaAvancada'); setTimeout(()=>document.getElementById('senhaAvancada').focus(), 100); }
    document.getElementById('senhaAvancada').addEventListener('input', function(e) { if(this.value === db.configs.senhaAdmin) { this.blur(); this.value = ''; fecharModal('modalSenhaAvancada'); document.getElementById('configUrlApp').value = db.configs.url || ''; abrirModal('modalConfigAvancadas'); } });
    
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
            db = nuvemDB;
            salvarBanco({ sincronizar: false });
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
        let indicador = document.getElementById('syncIndicador');
        indicador.style.opacity = '1';

        try {
            let res = await fetch(db.configs.url, {
                method: 'POST',
                redirect: "follow",
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'salvar_banco', dados: db })
            });
            if(!res.ok) throw new Error("Falha ao salvar na nuvem");
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
    async function forcarEnvioNuvemCompleto() { if(!db.configs.url) return alert("Configure a URL!"); document.getElementById('loadingOverlay').style.display = 'flex'; try { let res = await fetch(db.configs.url, { method: 'POST', redirect: "follow", headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'salvar_banco', dados: db }) }); if(!res.ok) throw new Error("Erro"); alert("✅ Backup salvo!"); } catch(e) { alert("❌ Falha."); } finally { document.getElementById('loadingOverlay').style.display = 'none'; } }
    
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
    async function excluirTodoHistorico() { let frase = document.getElementById('inputExcluirTudo').value.trim().toLowerCase(); if(frase === "quero excluir todo o histórico") { if(!confirm("⚠️ TEM CERTEZA?")) return; db.contribuintes.forEach(c => c.pagamentos = []); marcarMudancaEstrutural(); document.getElementById('inputExcluirTudo').value = ''; fecharModal('modalConfigAvancadas'); alert("✅ Limpo!"); renderizarLista(); } else { alert("Frase incorreta."); } }
    function forcarAtualizacao() { if(confirm("Deseja forçar a atualização do aplicativo?")) { if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(registrations) { for(let registration of registrations) registration.update(); }); } window.location.href = window.location.pathname + '?nocache=' + new Date().getTime(); } }

