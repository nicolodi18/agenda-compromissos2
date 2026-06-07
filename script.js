const form = document.getElementById("formCompromisso");
const lista = document.getElementById("listaCompromissos");
const pesquisa = document.getElementById("pesquisa");

const API_URL = "https://6a24aac1420469ff067b286f.mockapi.io/api/v1/Compromissos";

let compromissos = [];
let editandoId = null;

document.addEventListener("DOMContentLoaded", carregarCompromissos);

form.addEventListener("submit", salvarCompromisso);
pesquisa.addEventListener("input", atualizarTela);

async function carregarCompromissos() {
    try {

        console.log("URL:", API_URL);

        const response = await fetch(API_URL);

        console.log("Status:", response.status);

        const dados = await response.json();

        console.log("Dados:", dados);

        compromissos = dados;

        atualizarTela();

    } catch (error) {

        console.error(error);

        alert("Erro ao carregar compromissos.");
    }
}
async function salvarCompromisso(e) {

    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;
    const descricao = document.getElementById("descricao").value;

    const compromisso = {
        titulo,
        data,
        hora,
        descricao,
        concluido: false
    };

    try {

        if (editandoId) {

            await fetch(`${API_URL}/${editandoId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(compromisso)
            });

            editandoId = null;

        } else {

            await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(compromisso)
            });
        }

        form.reset();

        carregarCompromissos();

    } catch (error) {

        alert("Erro ao salvar compromisso.");

    }
}

function atualizarTela() {

    lista.innerHTML = "";

    const filtro = pesquisa.value.toLowerCase();

    const filtrados = compromissos.filter(item =>
        item.titulo.toLowerCase().includes(filtro)
    );

    filtrados.forEach(item => {

        const card = document.createElement("div");

        card.classList.add("compromisso");

        if (item.concluido) {
            card.classList.add("concluido");
        }

        card.innerHTML = `
            <h3>${item.titulo}</h3>

            <p><strong>📅 Data:</strong> ${item.data}</p>

            <p><strong>⏰ Hora:</strong> ${item.hora}</p>

            <p>${item.descricao}</p>

            <div class="acoes">

                <button class="btn-concluir"
                    onclick="concluir(${item.id})">
                    ✓
                </button>

                <button class="btn-editar"
                    onclick="editar(${item.id})">
                    Editar
                </button>

                <button class="btn-excluir"
                    onclick="excluir(${item.id})">
                    Excluir
                </button>

            </div>
        `;

        lista.appendChild(card);
    });

    atualizarDashboard();
}

async function concluir(id) {

    const item = compromissos.find(c => String(c.id) === String(id));

    if (!item) {
        alert("Compromisso não encontrado.");
        return;
    }

    const atualizado = {
        ...item,
        concluido: !item.concluido
    };

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(atualizado)
        });

        carregarCompromissos();

    } catch (error) {

        console.error(error);
        alert("Erro ao atualizar compromisso.");

    }
}

async function excluir(id) {

    if (!confirm("Deseja excluir este compromisso?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    carregarCompromissos();
}

function editar(id) {

    const item = compromissos.find(c => String(c.id) === String(id));

    if (!item) return;

    document.getElementById("titulo").value = item.titulo;
    document.getElementById("data").value = item.data;
    document.getElementById("hora").value = item.hora;
    document.getElementById("descricao").value = item.descricao;

    editandoId = id;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function atualizarDashboard() {

    document.getElementById("total").textContent =
        compromissos.length;

    document.getElementById("pendentes").textContent =
        compromissos.filter(c => !c.concluido).length;

    document.getElementById("concluidos").textContent =
        compromissos.filter(c => c.concluido).length;
}