class ApiRedemet {
    tipoMsg = ""
    constructor(tipo) {
        tipoMsg = tipo
    }

    get(callBack, localidade, datai, dataf) {

        async function getPages(url, lastPage, callBack, arg, obj) {

            for (let i = 2; i <= lastPage; i++) {
                const response = await fetch(url + i);
                let { data, total_pages } = await response.json();
                data.data.forEach(mens => arg = arg.concat([mens.mens, mens.validade_inicial]))
            }
            callBack(arg)
        }

        function getUrlPages(url) {//'/?page_tam=150&data_ini=2023030900&data_fim=2023031005&page=2'
            return url.split("page=")[0] + "page="

        }
        let dataIni = datai, dataFim = dataf
        let resp = []

        const chaveAPI = 'U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'
        let urlBase = `https://api-redemet.decea.mil.br/mensagens/metar/${localidade}?api_key=${chaveAPI}&data_ini=${dataIni}&data_fim=${dataFim}`
        fetch(urlBase)
            .then((response) => {
                if (response.ok)
                    return response.json()
            })
            .then(response => {
                response.data.data.map((mens) => (

                    resp = resp.concat([mens.mens,mens.validade_inicial])
                )

                )
                if (response.data.last_page > 1){ 
                    let urlPages = getUrlPages(response.data.next_page_url)
                    getPages(urlBase + urlPages, response.data.last_page, callBack, resp,this)
                }
                else
                    callBack(resp)



            })
    }



    arraySize(arr) {
        return arr.length
    }


    getLocalidade(metar) {
        var campos = [];

        var idxLoc = 1;
        if (metar.indexOf(" COR ") > 0) {
            idxLoc = idxLoc + 1;
        }

        campos = metar.split(" ");

        return campos[idxLoc];
    }

}

metar = new Metar()
