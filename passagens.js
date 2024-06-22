document.addEventListener('DOMContentLoaded', function() {
    const passagemList = JSON.parse(localStorage.getItem('passagemList')) || [];
    let totalGasto = parseFloat(localStorage.getItem('totalGasto')) || 0.00;
    const passagemListElement = document.getElementById('passagemList');
    const currentDateElement = document.getElementById('currentDate');
    let currentDateIndex = 0;
    const groupedPassagens = {};

    passagemList.forEach(function(passagem) {
        const [data, detalhes] = passagem.split(' - ');
        if (!groupedPassagens[data]) {
            groupedPassagens[data] = [];
        }
        groupedPassagens[data].push(passagem);
    });

    const sortedDates = Object.keys(groupedPassagens).sort((a, b) => {
        const [diaA, mesA, anoA] = a.split('/');
        const [diaB, mesB, anoB] = b.split('/');
        return new Date(`${anoA}-${mesA}-${diaA}`) - new Date(`${anoB}-${mesB}-${diaB}`);
    });

    function updatePassagemList() {
        passagemListElement.innerHTML = '';
        const currentDate = sortedDates[currentDateIndex];
        const passagens = groupedPassagens[currentDate];
        passagens.forEach(function(passagem, index) {
            const li = document.createElement('li');
            li.textContent = passagem;

            const deleteIcon = document.createElement('span');
            deleteIcon.innerHTML = '🗑️';
            deleteIcon.style.cursor = 'pointer';
            deleteIcon.style.marginLeft = '10px';
            deleteIcon.addEventListener('click', function() {
                deletePassagem(currentDate, index);
            });

            li.appendChild(deleteIcon);
            passagemListElement.appendChild(li);
        });
        currentDateElement.textContent = formatDate(currentDate);
    }

    function formatDate(dateStr) {
        const [dia, mes] = dateStr.split('/');
        return `${dia}/${mes}`;
    }

    function deletePassagem(date, index) {
        const passagem = groupedPassagens[date][index];
        const detalhes = passagem.split(' - ')[1];
        const valor = parseFloat(detalhes.match(/\(([^)]+)\)/)[1].replace('R$', '').replace(',', '.'));

        totalGasto -= valor;
        document.getElementById('totalGasto').textContent = totalGasto.toFixed(2);
        localStorage.setItem('totalGasto', totalGasto.toFixed(2));

        groupedPassagens[date].splice(index, 1);
        if (groupedPassagens[date].length === 0) {
            delete groupedPassagens[date];
        }
        localStorage.setItem('passagemList', JSON.stringify(Object.values(groupedPassagens).flat()));
        updatePassagemList();
    }

    document.getElementById('prevDayBtn').addEventListener('click', function() {
        if (currentDateIndex > 0) {
            currentDateIndex--;
            updatePassagemList();
        }
    });

    document.getElementById('nextDayBtn').addEventListener('click', function() {
        if (currentDateIndex < sortedDates.length - 1) {
            currentDateIndex++;
            updatePassagemList();
        }
    });

    document.getElementById('totalGasto').textContent = totalGasto.toFixed(2);
    updatePassagemList();

    document.getElementById('gerarRelatorioBtn').addEventListener('click', function() {
        const relatorioTexto = generateRelatorioTexto();
        showPopup(relatorioTexto);
    });

    function generateRelatorioTexto() {
        let relatorioTexto = '';

        for (const data in groupedPassagens) {
            const dataFormatada = formatDate(data);
            relatorioTexto += `*${dataFormatada}*\n${groupedPassagens[data].map(p => {
                const [_, detalhes] = p.split(' - ');
                const [origemDestino, valores] = detalhes.split(' (');
                return `\`\`\`${origemDestino}\`\`\` *(${valores})*`;
            }).join('\n')}\n\n`;
        }

        return relatorioTexto.trim();
    }

    function showPopup(content) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popup.style.color = '#ffffff';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.zIndex = '1000';
        popup.style.maxWidth = '80%';
        popup.style.maxHeight = '80%';
        popup.style.overflowY = 'auto';

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '10px';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fechar';
        closeButton.style.padding = '10px';
        closeButton.style.backgroundColor = '#00c6ff';
        closeButton.style.color = '#ffffff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', function() {
            document.body.removeChild(popup);
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Relatório';
        copyButton.style.padding = '10px';
        copyButton.style.backgroundColor = '#00c6ff';
        copyButton.style.color = '#ffffff';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '5px';
        copyButton.style.cursor = 'pointer';
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(content).then(function() {
                alert('Relatório copiado para a área de transferência!');
            }, function(err) {
                alert('Erro ao copiar o relatório: ', err);
            });
        });

        const pre = document.createElement('pre');
        pre.textContent = content;

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(closeButton);
        popup.appendChild(pre);
        popup.appendChild(buttonContainer);
        document.body.appendChild(popup);
    }
});
