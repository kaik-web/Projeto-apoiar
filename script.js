const container = document.querySelector(".card-container");
const modalOverlay = document.getElementById('person-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');
const backgroundMusic = document.getElementById('background-music');
let dados = []; // Cache para armazenar os dados do JSON

// Carrega os dados uma vez quando a página é iniciada
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resposta = await fetch("data.json");
        dados = await resposta.json();
        renderizarCards(dados); // Renderiza todos os cards inicialmente

        // Evento para fechar o modal
        modalCloseBtn.addEventListener('click', () => modalOverlay.style.display = 'none');
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.style.display = 'none';
            }
        });

        // --- LÓGICA DA MÚSICA DE FUNDO ---
        const startMusic = () => {
            backgroundMusic.play().catch(error => {
                console.log("Autoplay bloqueado. A música começará com a primeira interação do usuário.");
                // Se o autoplay falhar, espera por um clique para tentar de novo.
                document.body.addEventListener('click', () => backgroundMusic.play(), { once: true });
            });
        };
        startMusic(); // Tenta iniciar a música

        // Pausa a música quando o usuário muda de aba ou navega para outro site
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                backgroundMusic.pause();
            } else if (backgroundMusic.paused) {
                backgroundMusic.play().catch(e => console.log("Não foi possível retomar a música."));
            }
        });

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        container.innerHTML = "<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>";
    }
});

function renderizarCards(pessoas) {
    // Limpa o container antes de renderizar novos cards
    container.innerHTML = '';

    if (pessoas.length === 0) {
        container.innerHTML = "<p>Nenhum resultado encontrado.</p>";
        return;
    }

    pessoas.forEach((pessoa) => {
        const article = document.createElement("article");
        article.classList.add("card");

        // Lógica para criar a imagem ou o avatar de iniciais
        let imageHtml;
        if (pessoa.foto) {
            // Estilo especial para a foto do Moacir (ID 1) para que ela não seja cortada.
            const specialStyle = pessoa.id === 1 ? 'style="object-fit: contain;"' : '';
            imageHtml = `<img class="card-image" src="${pessoa.foto}" alt="Foto de ${pessoa.nome}" ${specialStyle}>`;
        } else {
            const initials = pessoa.nome.split(' ').map(n => n[0]).slice(0, 2).join('');
            const placeholderColor = '#3c4043'; // Um cinza escuro e neutro, menos chamativo
            imageHtml = `<div class="card-image-placeholder" style="background-color: ${placeholderColor};">
                           <span class="initials">${initials}</span>
                         </div>`;
        }

        article.innerHTML = `
            ${imageHtml}
            <div class="card-content">
                <h2>${pessoa.nome}</h2>
            </div>
        `;

        // Adiciona o evento de clique para ABRIR O MODAL
        article.addEventListener('click', () => {
            // Decide se o botão de ajuda é um link ou um botão PIX
            const ajudaHtml = pessoa.tipo_ajuda === 'pix'
                ? `<button class="btn-ajuda pix-btn" data-pix="${pessoa.link}">Quero Ajudar (PIX)</button>`
                : `<a href="${pessoa.link}" target="_blank" class="btn-ajuda">Quero Ajudar (Link)</a>`;

            modalBody.innerHTML = `
                ${imageHtml.replace('card-image', 'modal-image')}
                <h2>${pessoa.nome}</h2>
                <p>${pessoa.historia}</p>
                <div class="modal-ajuda-container">${ajudaHtml}</div>
            `;

            modalOverlay.style.display = 'flex';

            // Adiciona o evento específico para o botão PIX DENTRO do modal
            const pixButton = modalBody.querySelector('.pix-btn');
            if (pixButton) {
                pixButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // Impede que o modal feche ao clicar no botão
                    const pixKey = pixButton.dataset.pix;
                    const pixInfoElement = document.createElement('p');
                    pixInfoElement.className = 'pix-info';
                    pixInfoElement.innerHTML = `<strong>Chave PIX:</strong> ${pixKey}`;
                    pixButton.parentElement.replaceWith(pixInfoElement);
                });
            }
        });

        container.appendChild(article);
    });
}