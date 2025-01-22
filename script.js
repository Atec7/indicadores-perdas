document.getElementById('targetForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nature = document.getElementById('nature').value;
    const code = document.getElementById('code').value;
    const description = document.getElementById('description').value;
    const date = formatDate(document.getElementById('date').value);
    const category = document.getElementById('category').value;
    const achievedTargets = parseInt(document.getElementById('achievedTargets').value);
    const team = document.getElementById('team').value;

    const record = { nature, code, description, date, category, achievedTargets, team };
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));
    updateRecords();
});

function formatDate(date) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

function updateRecords() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const tbody = document.querySelector('#recordTable tbody');
    tbody.innerHTML = '';

    records.forEach((record, index) => {
        const row = document.createElement('tr');
        Object.keys(record).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = record[key];
            row.appendChild(cell);
        });
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = function() {
            records.splice(index, 1);
            localStorage.setItem('records', JSON.stringify(records));
            updateRecords();
        };
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });

    // Atualizar gráficos individuais
    updateChart('fiscalizacaoChart', 'Fiscalização Alvo Projeto', 15966);
    updateChart('normalizacaoChart', 'Normalização Alvo Projeto', 3606);
    updateChart('fraudeChart', 'Fraude Alvo Projeto', 1797);
    updateTotalChart();
    updateMonthlyChart();
}

function updateChart(canvasId, category, target) {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const achievedCount = records
        .filter(record => record.category === category)
        .reduce((sum, record) => sum + record.achievedTargets, 0);

    const pendingCount = target - achievedCount;

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Limpar gráfico existente antes de criar um novo
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    const data = {
        labels: ['Concluído', 'Pendente'],
        datasets: [{
            data: [achievedCount, pendingCount],
            backgroundColor: ['rgb(46, 207, 14)', 'rgb(244, 67, 54)'],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBackgroundColor: ['rgb(39, 174, 96)', 'rgb(231, 76, 60)']
        }]
    };

    canvas.chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: ``,
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            const total = target;
                            const percentage = (value / total * 100).toFixed(2);
                            return `${tooltipItem.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTotalChart() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const achievedCount = records.reduce((sum, record) => sum + record.achievedTargets, 0);

    const totalTarget = 21692;  // Altera a meta de alvos totais
    const pendingCount = totalTarget - achievedCount;

    const canvas = document.getElementById('totalChart');
    const ctx = canvas.getContext('2d');

    // Limpar gráfico existente antes de criar um novo
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    const data = {
        labels: ['Total Concluído', 'Total Pendente'],
        datasets: [{
            data: [achievedCount, pendingCount],
            backgroundColor: ['rgb(46, 207, 14)', 'rgb(231, 76, 60)'],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBackgroundColor: ['rgb(39, 174, 96)', 'rgb(192, 57, 43)']
        }]
    };

    canvas.chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            const total = totalTarget;
                            const percentage = (value / total * 100).toFixed(2);
                            return `${tooltipItem.label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateMonthlyChart() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const monthlyData = Array(12).fill(0);  // Array para armazenar a quantidade de alvos atingidos por mês

    records.forEach(record => {
        const [day, month, year] = record.date.split('/');
        const monthIndex = parseInt(month) - 1;  // Índice do mês (0 a 11)
        monthlyData[monthIndex] += record.achievedTargets;
    });

    const canvas = document.getElementById('monthlyChart');
    const ctx = canvas.getContext('2d');

    // Aumentar a largura do canvas em 3x
    canvas.width = canvas.width * 4.5;
    canvas.height = canvas.height * 2.0;

    // Limpar gráfico existente antes de criar um novo
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    const data = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        datasets: [{
            label: 'Evolução dos Alvos Atingidos ao longo do ano',
            data: monthlyData,
            backgroundColor: 'rgba(46, 207, 14, 0.2)',
            borderColor: 'rgba(46, 207, 14, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(46, 207, 14, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(46, 207, 14, 1)',
            fill: true,
            tension: 0.4
        }]
    };

    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Progresso Mensal dos Alvos Atingidos - Setor de perdas - Grupo Partnership - Unidade Rio Verde/GO',
                    font: {
                        size: 18
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `Alvos Atingidos: ${tooltipItem.raw}`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Mês',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        autoSkip: false // Garantir que todos os meses sejam exibidos
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total de Alvos',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}


document.getElementById('exportBtn').addEventListener('click', function() {
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
    XLSX.writeFile(workbook, 'registros.xlsx');
});

updateRecords();
