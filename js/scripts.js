class ApiRedemet {
    tipoMsg
    arrResposta
    constructor(tipo) {
        this.tipoMsg = tipo
    }

    get(callBack, localidade, datai, dataf) {

        async function getPages(url, lastPage, callBack, arg, obj) {

            for (let i = 2; i <= lastPage; i++) {
                const response = await fetch(url + i);
                let { data, total_pages } = await response.json();
                data.data.forEach(mens => arg = arg.concat([mens]))
            }
            obj.arrResposta.concat([arg]) //copia o array
            callBack(arg, obj.tipoMsg)
        }

        function getUrlPages(url) {//'/?page_tam=150&data_ini=2023030900&data_fim=2023031005&page=2'
            return url.split("page=")[0] + "page="

        }
        let dataIni = datai, dataFim = dataf
        let resp = []

        const chaveAPI = 'U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'
        let urlBase = `https://api-redemet.decea.mil.br/mensagens/${this.tipoMsg.toLowerCase()}/${localidade}?api_key=${chaveAPI}&data_ini=${dataIni}&data_fim=${dataFim}`
        fetch(urlBase)
            .then((response) => {
                if (response.ok)
                    return response.json()
            })
            .then(response => {
                this.arrResposta = []

                response.data.data.map((mens) => (

                    resp = resp.concat([mens])
                )

                )
                if (response.data.last_page > 1) {
                    let urlPages = getUrlPages(response.data.next_page_url)
                    getPages(urlBase + urlPages, response.data.last_page, callBack, resp, this)
                }
                else {
                    this.arrResposta.concat([resp])
                    callBack(resp, this.tipoMsg)
                }



            })
    }


    getResposta() {
        if (Array.isArray(arrResposta))
            return this.arrResposta.splice(0)
        else
            return false
    }
    arraySize(arr) {
        return arr.length
    }



}

class Metar extends ApiRedemet {

    constructor() {
        super("METAR");
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

class SIGMET extends ApiRedemet {

    constructor() {
        super("SIGMET");
    }
}

class AIRMET extends ApiRedemet {

    constructor() {
        super("AIRMET");
    }
}

class TAF extends ApiRedemet {

    constructor() {
        super("TAF");
    }

    getLocalidade(taf) {
        var campos = [];

        var idxLoc = 1;
        if (taf.indexOf(" COR ") > 0) {
            idxLoc = idxLoc + 1;
        }

        campos = taf.split(" ");

        return campos[idxLoc];
    }

}

function trataResposta(r, tipo) {

    let msgs = ""
    let cont = 0
    let contAMD = 0
    r.forEach(m => {
        msgs += m.mens + "<br>"
        if (m.mens.includes(tipo + " AMD"))
            contAMD++
        cont++
    });

    document.getElementById("resposta" + tipo).innerHTML = msgs + '<br>' + `Total de Mensagens ${tipo}: ${cont}<br>` 
         + `Total de Mensagens ${tipo} AMD: ${contAMD}`

    console.log(r)
}

let data_ini = "2023030100"
let data_fin = "2023041323"
let localidades = "sbcf"

/*let metar = new Metar()
metar.get(trataResposta, localidades, data_ini, data_fin)
*/
let taf = new TAF()
taf.get(trataResposta, localidades, data_ini, data_fin)

/*
let sigmet = new SIGMET()
sigmet.get(trataResposta, "", data_ini+"00", data_fin+"59")

let airmet = new AIRMET()
airmet.get(trataResposta, "", data_ini+"00", data_fin+"59")
*/
