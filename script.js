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
// FASE 2: Estado dos produtos
//
const listaDeProdutos = [];
let indiceEdicao = null;

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Seletores de Elementos da V5
const formProduto = document.getElementById("produto-form");
const botaoSalvar = formProduto.querySelector(".btn-primary");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const botaoLimpar = document.getElementById("limpar-tabela");
const campoBusca = document.getElementById("busca");
const divMensagemErro = document.getElementById("mensagem-erro");

// Elementos do Modal Customizado
const modalCustomizado = document.getElementById("modal-customizado");
const modalTitulo = document.getElementById("modal-titulo");
const modalTexto = document.getElementById("modal-texto");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");
const botaoConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");

// Função auxiliar para exibir mensagens inline (Substitui alert de erro)
function exibirMensagemErro(mensagem) {
    divMensagemErro.innerHTML = mensagem.replace(/\n/g, "<br>");
    divMensagemErro.style.display = "block";
    divMensagemErro.scrollIntoView({ behavior: "smooth", block: "center" });
}

function limparMensagemErro() {
    divMensagemErro.textContent = "";
    divMensagemErro.style.display = "none";
}

// Função para abrir o Modal Customizado genérico
function abrirModal(titulo, texto, callbackConfirmacao, mostrarCancelar = true) {
    modalTitulo.textContent = titulo;
    modalTexto.innerHTML = texto;
    modalCustomizado.style.display = "flex";

    modalBtnCancelar.style.display = mostrarCancelar ? "inline-block" : "none";

    // Remove eventos anteriores clonando os botões
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

// Botão Conceito Bootstrap
if (botaoConceitoBootstrap) {
    botaoConceitoBootstrap.addEventListener("click", function() {
        abrirModal(
            "Conceito Bootstrap",
            "O Bootstrap acelera o desenvolvimento da UI fornecendo classes utilitárias e componentes prontos (como grids, modais e alertas). Neste projeto, aplicamos conceitos visuais inspirados no Bootstrap combinados com CSS customizado para garantir uma experiência leve, responsiva e alinhada ao design fofo do sistema.",
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
                botaoSalvar.textContent = "Adicionar produto";
                exibirMensagemErro("Não foi possível localizar o produto para editar.");
                return;
            }
            listaDeProdutos[indiceEdicao] = novoProduto;
        }

        renderizarTabela();
        formProduto.reset();
        indiceEdicao = null;
        botaoSalvar.textContent = "Adicionar produto";

    } catch (erro) {
        exibirMensagemErro(erro.message);
    }
});

// Preparar produto para edição
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

// Botão Limpar tudo (com Modal de Confirmação V5)
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
            botaoSalvar.textContent = "Adicionar produto";
            if (campoBusca) campoBusca.value = "";
            limparMensagemErro();
            renderizarTabela();
        }
    );
});

//
// FASE 4: Renderização da tabela e Busca Dinâmica
//
function obterProdutosFiltrados() {
    if (!campoBusca) return listaDeProdutos;
    const termoBusca = campoBusca.value.toLowerCase().trim();
    return listaDeProdutos.filter(produto =>
        produto.nome.toLowerCase().includes(termoBusca)
    );
}

if (campoBusca) {
    campoBusca.addEventListener("input", function() {
        renderizarTabela();
    });
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    const produtosVisiveis = obterProdutosFiltrados();

    if (produtosVisiveis.length === 0 && listaDeProdutos.length > 0) {
        const linhaVazia = document.createElement("tr");
        const celulaVazia = document.createElement("td");
        celulaVazia.colSpan = 5;
        celulaVazia.textContent = "Ops! Nenhum produto foi encontrado com esse nome.";
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

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = "R$ " + formatarMoeda(produto.preco);

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

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

        // Botão Remover (com Modal de Confirmação V5)
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
                        botaoSalvar.textContent = "Adicionar produto";
                    } else if (indiceEdicao !== null && indiceEdicao > indexReal) {
                        indiceEdicao--;
                    }

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