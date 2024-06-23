document.getElementById('formSearch').addEventListener('submit', (e) => {

    e.preventDefault()

    const cnpj = encodeURIComponent(document.getElementById('cnpjInput').value);
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = `<div class="mb-0 alert alert-light">Carregando dados!</div>`;

    // fetch(`https://opencnpj.inapplet.com/api/cnpj/${cnpj}`)
    fetch(`http://learn1.inapplet.com:3004/api/cnpj/${cnpj}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar CNPJ.');
            }

            return response.json();
        })
        .then(data => {
            resultDiv.innerHTML = `<div class="alert alert-primary"><pre class="mb-0">${JSON.stringify(data, null, 2)}</pre></div>`;
        })
        .catch(error => {
            console.error(error);
            resultDiv.innerHTML = `<div class="alert alert-danger"><p class="mb-0">${error.message}</p></div>`;
        });


});

document.getElementById('btnEx1').addEventListener('click', function (e) {
    document.getElementById('cnpjInput').value = '40.154.884/0001-53'
})
document.getElementById('btnEx2').addEventListener('click', function (e) {
    document.getElementById('cnpjInput').value = '00.623.904/0001-73'
})
document.getElementById('btnEx3').addEventListener('click', function (e) {
    document.getElementById('cnpjInput').value = '06.990.590/0001-23'
})