document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addPassagemBtn').addEventListener('click', function() {
        const passagensContainer = document.getElementById('passagensContainer');
        const novaPassagem = document.createElement('div');
        novaPassagem.classList.add('passagem');
        novaPassagem.innerHTML = `
            <label for="valor">Valor da Passagem:</label>
            <input type="text" class="valor" required>
        `;
        passagensContainer.appendChild(novaPassagem);
    });

    document.getElementById('passagemForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const partida = document.getElementById('partida').value.trim();
        const destino = document.getElementById('destino').value.trim();
        const passagens = document.querySelectorAll('.passagem');
        let totalGasto = 0;
        let detalhesPassagens = '';

        passagens.forEach(function(passagem, index) {
            const valor = parseFloat(passagem.querySelector('.valor').value.replace(',', '.'));

            if (!isNaN(valor)) {
                totalGasto += valor;
                detalhesPassagens += `R$ ${valor.toFixed(2).replace('.', ',')} `;
            }
        });

        if (partida && destino && detalhesPassagens) {
            const data = new Date().toLocaleDateString('pt-BR');
            const passagemList = JSON.parse(localStorage.getItem('passagemList')) || [];
            passagemList.push(`${data} - ${partida} -> ${destino} (${detalhesPassagens.trim()})`);
            localStorage.setItem('passagemList', JSON.stringify(passagemList));
            localStorage.setItem('totalGasto', (parseFloat(localStorage.getItem('totalGasto') || '0') + totalGasto).toFixed(2).replace('.', ','));

            document.getElementById('passagemForm').reset();
            document.getElementById('passagensContainer').innerHTML = `
                <div class="passagem">
                    <label for="valor">Valor da Passagem:</label>
                    <input type="text" class="valor" required>
                </div>
            `;

            // Feedback visual com mensagem flutuante
            showNotification('Passagem adicionada com sucesso!', 'success');
        } else {
            showNotification('Por favor, preencha todos os campos e adicione ao menos uma passagem válida.', 'error');
        }
    });

    document.getElementById('verPassagensBtn').addEventListener('click', function() {
        window.location.href = 'passagens.html';
    });

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(function() {
            notification.remove();
        }, 3000); // Remove a notificação após 3 segundos
    }
});
