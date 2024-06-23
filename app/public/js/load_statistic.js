fetch(`/statistic`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar CNPJ.');
        }
        
        return response.json();
    })
    .then(data => {
        console.log(data)
        document.getElementById('stt_cnpjs').innerText = data['cnpjs']
        document.getElementById('stt_qtde').innerText = data['qtde']
        document.getElementById('stt_time').innerText = data['avg_time'].toFixed(1) + ' ms'
    })