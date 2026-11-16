//
// FASE 1: Modelagem dos dados
//
class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        nome = nome.trim();
        preco = Number(preco);
        quantidade = Number(quantidade);

        if (nome === "") {
            throw new Error("O nome do produto não pode ficar vazio.");
        }
        if (!Number.isFinite(preco) || preco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }
        if (!Number.isSafeInteger(quantidade) || quantidade < 1) {
            throw new Error("A quantidade deve ser um número inteiro maior que zero.");
        }

        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() { return this.#preco; }
    get quantidade() { return this.#quantidade; }

    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}

//
// FASE 2: Estado dos produtos e persistência localStorage
//
const listaDeProdutos = [];
let indiceEdicao = null;

function salvarNoLocalStorage() {
    const dadosParaSalvar = listaDeProdutos.map(p => ({
        nome: p.nome,
        preco: p.preco,
        quantidade: p.quantidade
    }));
    localStorage.setItem("produtos_estoque_v6", JSON.stringify(dadosParaSalvar));
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem("produtos_estoque_v6");
    if (dadosSalvos) {
        try {
            const arrayDados = JSON.parse(dadosSalvos);
            arrayDados.forEach(item => {
                listaDeProdutos.push(new Produto(item.nome, item.preco, item.quantidade));
            });
        } catch (e) {
            console.error("Erro ao carregar dados salvos.", e);
        }
    }
}

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Seletores de Elementos
const formProduto = document.getElementById("produto-form");
const botaoSalvar = formProduto.querySelector(".btn-primary");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const botaoLimpar = document.getElementById("limpar-tabela");
const campoBusca = document.getElementById("busca");
const campoOrdenacao = document.getElementById("ordenacao");
const divMensagemErro = document.getElementById("mensagem-erro");

// Novos Seletores V6
const btnExportarCsv = document.getElementById("btn-exportar-csv");
const btnBackupJson = document.getElementById("btn-backup-json");
const inputRestaurarJson = document.getElementById("input-restaurar-json");

// Elementos do Modal Customizado
const modalCustomizado = document.getElementById("modal-customizado");
const modalTitulo = document.getElementById("modal-titulo");
const modalTexto = document.getElementById("modal-texto");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");
const botaoConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");

// Funções de Mensagem
function exibirMensagemErro(mensagem) {
    divMensagemErro.innerHTML = mensagem.replace(/\n/g, "<br>");
    divMensagemErro.style.display = "block";
    divMensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
}

function limparMensagemErro() {
    divMensagemErro.textContent = "";
    divMensagemErro.style.display = "none";
}

// Modal Customizado
function abrirModal(titulo, texto, callbackConfirmacao, mostrarCancelar = true) {
    modalTitulo.textContent = titulo;
    modalTexto.innerHTML = texto;
    modalCustomizado.style.display = "flex";

    modalBtnCancelar.style.display = mostrarCancelar ? "inline-block" : "none";

    const novoBtnConfirmar = modalBtnConfirmar.cloneNode(true);
    const novoBtnCancelar = modalBtnCancelar.cloneNode(true);
    modalBtnConfirmar.parentNode.replaceChild(novoBtnConfirmar, modalBtnConfirmar);
    modalBtnCancelar.parentNode.replaceChild(novoBtnCancelar, modalBtnCancelar);

    document.getElementById("modal-btn-confirmar").addEventListener("click", function() {
        modalCustomizado.style.display = "none";
        if (callbackConfirmacao) callbackConfirmacao();
    });

    document.getElementById("modal-btn-cancelar").addEventListener("click", function() {
        modalCustomizado.style.display = "none";
    });
}

if (botaoConceitoBootstrap) {
    botaoConceitoBootstrap.addEventListener("click", function() {
        abrirModal(
            "Conceito Bootstrap & V6",
            "O Bootstrap acelera o desenvolvimento da UI fornecendo classes utilitárias e componentes prontos. Na Versão 6, adicionamos inteligência comercial com renderização condicional de estoque crítico, ordenação imutável com .sort(), exportação CSV via Blob e backup completo em JSON via FileReader.",
            null,
            false
        );
    });
}

//
// FASE 3: Formulário, validação e eventos
//
formProduto.addEventListener("submit", function(event) {
    event.preventDefault();
    limparMensagemErro();

    const nomeInput = campoNome.value.trim();
    const precoInput = campoPreco.value;
    const quantidadeInput = campoQuantidade.value;

    const preco = Number(precoInput);
    const quantidade = Number(quantidadeInput);

    if (
        nomeInput === "" ||
        precoInput.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        quantidadeInput.trim() === "" ||
        !Number.isSafeInteger(quantidade) ||
        quantidade < 1
    ) {
        exibirMensagemErro(
            "Dados inválidos!<br>" +
            "• Informe o nome do produto.<br>" +
            "• O preço deve ser maior que zero.<br>" +
            "• A quantidade deve ser um número inteiro maior que zero."
        );
        return;
    }

    try {
        const novoProduto = new Produto(nomeInput, preco, quantidade);

        if (indiceEdicao === null) {
            listaDeProdutos.push(novoProduto);
        } else {
            if (indiceEdicao < 0 || indiceEdicao >= listaDeProdutos.length) {
                indiceEdicao = null;
                botaoSalvar.textContent = "Adicionar Produto";
                exibirMensagemErro("Não foi possível localizar o produto para editar.");
                return;
            }
            listaDeProdutos[indiceEdicao] = novoProduto;
        }

        salvarNoLocalStorage();
        renderizarTabela();
        formProduto.reset();
        indiceEdicao = null;
        botaoSalvar.textContent = "Adicionar Produto";

    } catch (erro) {
        exibirMensagemErro(erro.message);
    }
});

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];
    if (!produto) return;

    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    botaoSalvar.textContent = "Salvar Alterações";
    limparMensagemErro();

    formProduto.scrollIntoView({ behavior: "smooth", block: "start" });
}

botaoLimpar.addEventListener("click", function() {
    if (listaDeProdutos.length === 0) {
        exibirMensagemErro("A tabela já está vazia!");
        return;
    }

    abrirModal(
        "Limpar Tudo",
        "Tem certeza que deseja apagar todos os registros do estoque? Esta ação não pode ser desfeita.",
        function() {
            listaDeProdutos.length = 0;
            indiceEdicao = null;
            formProduto.reset();
            botaoSalvar.textContent = "Adicionar Produto";
            if (campoBusca) campoBusca.value = "";
            salvarNoLocalStorage();
            limparMensagemErro();
            renderizarTabela();
        }
    );
});

//
// FASE 4: Renderização, Busca e Ordenação Dinâmica (V6)
//
function obterProdutosFiltradosEOrdenados() {
    // 1. Filtrar pelo campo de busca
    let produtosFiltrados = listaDeProdutos;
    if (campoBusca) {
        const termoBusca = campoBusca.value.toLowerCase().trim();
        produtosFiltrados = listaDeProdutos.filter(produto =>
            produto.nome.toLowerCase().includes(termoBusca)
        );
    }

    // 2. Criar cópia com Spread Operator ([...produtos]) para ordenação imutável
    let produtosOrdenados = [...produtosFiltrados];
    const criterio = campoOrdenacao ? campoOrdenacao.value : "padrao";

    if (criterio === "menor-qtd") {
        produtosOrdenados.sort((a, b) => a.quantidade - b.quantidade);
    } else if (criterio === "maior-preco") {
        produtosOrdenados.sort((a, b) => b.preco - a.preco);
    } else if (criterio === "menor-preco") {
        produtosOrdenados.sort((a, b) => a.preco - b.preco);
    } else if (criterio === "alfabetica") {
        produtosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
    }
    // "padrao" preserva a ordem original de cadastro

    return produtosOrdenados;
}

if (campoBusca) {
    campoBusca.addEventListener("input", renderizarTabela);
}

if (campoOrdenacao) {
    campoOrdenacao.addEventListener("change", renderizarTabela);
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltradosEOrdenados();

    if (produtosVisiveis.length === 0 && listaDeProdutos.length > 0) {
        const linhaVazia = document.createElement("tr");
        const celulaVazia = document.createElement("td");
        celulaVazia.colSpan = 5;
        celulaVazia.textContent = "Ops! Nenhum produto foi encontrado com esse critério.";
        celulaVazia.style.padding = "20px";
        celulaVazia.style.color = "#a44a5e";
        celulaVazia.style.fontStyle = "italic";
        linhaVazia.appendChild(celulaVazia);
        tabelaBody.appendChild(linhaVazia);

        document.getElementById("total-estoque").textContent = "Total em estoque: R$ 0,00";
        return;
    }

    produtosVisiveis.forEach((produto) => {
        const indexReal = listaDeProdutos.indexOf(produto);
        const linha = document.createElement("tr");

        // Regra de Negócio V6: Destaque de Estoque Crítico (quantidade <= 3)
        if (produto.quantidade <= 3) {
            linha.style.backgroundColor = "#ffe6ea";
            linha.style.borderLeft = "4px solid #c9184a";
        }

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = "R$ " + formatarMoeda(produto.preco);

        const celulaQuantidade = document.createElement("td");
        if (produto.quantidade <= 3) {
            celulaQuantidade.innerHTML = `${produto.quantidade} <span style="background-color: #c9184a; color: white; padding: 2px 6px; border-radius: 8px; font-size: 11px; font-weight: 700; margin-left: 5px;">Repor</span>`;
        } else {
            celulaQuantidade.textContent = produto.quantidade;
        }

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent = "R$ " + formatarMoeda(produto.calcularSubtotal());

        const celulaAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.type = "button";
        botaoEditar.textContent = "Editar";
        botaoEditar.className = "btn-editar";
        botaoEditar.addEventListener("click", function() {
            prepararEdicao(indexReal);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";
        botaoRemover.className = "btn-remover";
        botaoRemover.addEventListener("click", function() {
            abrirModal(
                "Remover Produto",
                `Deseja realmente remover o produto <b>"${produto.nome}"</b> do estoque?`,
                function() {
                    listaDeProdutos.splice(indexReal, 1);

                    if (indiceEdicao === indexReal) {
                        indiceEdicao = null;
                        formProduto.reset();
                        botaoSalvar.textContent = "Adicionar Produto";
                    } else if (indiceEdicao !== null && indiceEdicao > indexReal) {
                        indiceEdicao--;
                    }

                    salvarNoLocalStorage();
                    renderizarTabela();
                }
            );
        });

        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoRemover);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaPreco);
        linha.appendChild(celulaQuantidade);
        linha.appendChild(celulaSubtotal);
        linha.appendChild(celulaAcoes);

        tabelaBody.appendChild(linha);
    });

    const totalEstoque = produtosVisiveis.reduce(
        (total, produto) => total + produto.calcularSubtotal(),
        0
    );

    document.getElementById("total-estoque").textContent =
        "Total em estoque: R$ " + formatarMoeda(totalEstoque);
}

// 1. Exportar CSV
if (btnExportarCsv) {
    btnExportarCsv.addEventListener("click", function() {
        if (listaDeProdutos.length === 0) {
            exibirMensagemErro("Não há produtos cadastrados para exportar.");
            return;
        }

        let csvConteudo = "Nome;Preco;Quantidade;Subtotal\n";
        listaDeProdutos.forEach(p => {
            csvConteudo += `${p.nome};${p.preco.toFixed(2).replace('.', ',')};${p.quantidade};${p.calcularSubtotal().toFixed(2).replace('.', ',')}\n`;
        });

        const blob = new Blob([csvConteudo], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "estoque.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// 2. Backup JSON
if (btnBackupJson) {
    btnBackupJson.addEventListener("click", function() {
        if (listaDeProdutos.length === 0) {
            exibirMensagemErro("Não há produtos no estoque para gerar backup.");
            return;
        }

        const dadosBackup = JSON.stringify(listaDeProdutos.map(p => ({
            nome: p.nome,
            preco: p.preco,
            quantidade: p.quantidade
        })), null, 2);

        const blob = new Blob([dadosBackup], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "backup_estoque.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// 3. Restaurar JSON via FileReader
if (inputRestaurarJson) {
    inputRestaurarJson.addEventListener("change", function(event) {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const conteudo = e.target.result;
                const arrayDados = JSON.parse(conteudo);

                if (!Array.isArray(arrayDados)) {
                    throw new Error("O arquivo JSON enviado não tem um formato válido de lista.");
                }

                const novosProdutos = arrayDados.map(item => new Produto(item.nome, item.preco, item.quantidade));

                listaDeProdutos.length = 0;
                novosProdutos.forEach(p => listaDeProdutos.push(p));

                salvarNoLocalStorage();
                renderizarTabela();
                formProduto.reset();
                indiceEdicao = null;
                botaoSalvar.textContent = "Adicionar Produto";
                limparMensagemErro();

                abrirModal("Sucesso!", "Backup restaurado com sucesso no navegador!", null, false);
            } catch (erro) {
                exibirMensagemErro("Erro ao restaurar o backup: " + erro.message);
            }
        };
        reader.readAsText(arquivo);
        event.target.value = "";
    });
}

carregarDoLocalStorage();
renderizarTabela();