class API {
    tipoMsg
    arrResposta
    apiKey
    proxy = 'true'
    constructor(tipo, key) {
        this.apiKey = key
        this.tipoMsg = tipo
    }

    getDate(d) {
        let ano = d.substr(0, 4)
        let mes = d.substr(4, 2) - 1
        let dia = d.substr(6, 2)
        return new Date(ano, mes, dia)
    }

    getProxy() {
        return this.proxy
    }

    incDay(d) {
        return d.setDate(d.getDate() + 1)

    }

    fillZero(n) {
        return parseInt(n) < 10 ? "0" + n : "" + n
    }

    dateToStr(d) {
        return d.getFullYear() + this.fillZero(d.getMonth() + 1) + this.fillZero(d.getDate())
    }

    intervalToArray(di, df, urlData) {
        function makeArrayDiDf(di, df, arr) {
            let arrUrl = []
            let idi, idf
            arr.forEach((e, idx) => {
                if (idx == 0) {
                    idi = di
                    idf = arr[1] + "00"
                } else {
                    idi = e + "00"
                    if (idx < arr.length - 1)
                        idf = arr[idx + 1] + "00"
                    else
                        idf = df
                }
                arrUrl.push({ di: idi, df: idf })

            })
            return arrUrl
        }

        function makeArrayUrl(arrDias, urlData) {
            let r = []
            arrDias.forEach(e => {
                r.push(`/WebServiceOPMET/getMetarOPMET.php?local=${urlData.localidade}&msg=${urlData.tipoMsg}&data_ini=${e.di}&data_fim=${e.df}&proxy=${urlData.proxy}`)
            })
            return r
        }

        let r = []
        let xdf = df
        df = this.getDate(df)
        let next = this.getDate(di)
        r.push(this.dateToStr(new Date(next)))
        next = new Date(this.incDay(next))

        while (next <= df) {
            r.push(this.dateToStr(new Date(next)))
            next = new Date(this.incDay(next))
        }
        if (r.length == 1)
            r.push(this.dateToStr(new Date(df)))

        return makeArrayUrl(makeArrayDiDf(di, xdf, r), urlData)

    }


    getApiKey() {
        return this.apiKey
    }

    getOpmet(callBack, localidade, datai, dataf) {

        async function getPages(arrDias, pg, callBack, arr, obj) {

            for (let i = pg; i <= arrDias.length; i++) {
                const response = await fetch(arrDias[i]);
                let data = await response.text();
                let r
                r = data.split("=")
                r = r.splice(0, r.length - 1)
                r.map((mens) => (

                    arr = arr.concat([{ mens: mens.replace('\n', '') + "=" }])
                )
                )
                if (data.includes("*#*Erro na consulta"))
                    i--
            }
            obj.arrResposta.concat([arr]) //copia o array
            callBack(arr, obj.tipoMsg)
        }

        function getUrlPage(arrDias, pg) {//'/?page_tam=150&data_ini=2023030900&data_fim=2023031005&page=2'
            //return url.split("page=")[0] + "page="

            return arrDias[pg]

        }
        let dataIni = datai, dataFim = dataf
        let resp = []

        let arrDias = this.intervalToArray(datai, dataf, { localidade, tipoMsg: this.tipoMsg.toLowerCase(), proxy: this.getProxy() })
        let numPages = arrDias.length
        let paginaAtual = 0
        //let urlBase = `/WebServiceOPMET/getMetarOPMET.php?local=${localidade}&msg=${this.tipoMsg.toLowerCase()}&data_ini=${dataIni}&data_fim=${dataFim}&proxy=true`
        //let urlBase = `https://api-redemet.decea.mil.br/mensagens/${this.tipoMsg.toLowerCase()}/${localidade}?api_key=${this.getApiKey()}&data_ini=${dataIni}&data_fim=${dataFim}`
        let urlBase = getUrlPage(arrDias, paginaAtual)
        fetch(urlBase)
            .then((response) => {
                if (response.ok)
                    return response.text()
            })
            .then(response => {
                this.arrResposta = []
                let r
                r = response.split("=")
                r = r.splice(0, r.length - 1)
                r.map((mens) => (

                    resp = resp.concat([{ mens: mens.replace('\n', '') + "=" }])
                )
                )

                if (numPages > 1) {
                    //if (false) {
                    paginaAtual++
                    let urlPage = getUrlPage(arrDias, paginaAtual)
                    getPages(arrDias, paginaAtual, callBack, resp, this)
                }
                else {
                    this.arrResposta.concat([resp])
                    callBack(resp, this.tipoMsg)
                }



            })
    }

    getRedemet(callBack, localidade, datai, dataf) {

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

        let urlBase = `https://api-redemet.decea.mil.br/mensagens/${this.tipoMsg.toLowerCase()}/${localidade}?api_key=${this.getApiKey()}&data_ini=${dataIni}&data_fim=${dataFim}`
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

class METAR extends API {

    constructor(apiKey) {
        super("METAR", apiKey);
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

class SIGMET extends API {

    constructor(apiKey) {
        super("SIGMET", apiKey);
    }
}

class AIRMET extends API {

    constructor(apiKey) {
        super("AIRMET", apiKey);
    }
}

class TAF extends API {

    constructor(apiKey) {
        super("TAF", apiKey);
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

class GAMET extends API {

    constructor(apiKey) {
        super("GAMET", apiKey);
    }

    getLocalidade(gamet) {
        var campos = [];

        var idxLoc = 1;
        if (gamet.indexOf(" COR ") > 0) {
            idxLoc = idxLoc + 1;
        }

        campos = gamet.split(" ");

        return campos[idxLoc];
    }

}

class AVISO extends API {

    constructor(apiKey, tipo = "AVISO") {
        super(tipo, apiKey);
    }

}

function trataResposta(r, tipo) {

    let msgs = ""
    let cont = 0
    let contAMD = 0
    let contCOR = 0
    let contWS = 0
    let txtWS = ""
    //tipo = tipo == "AVISO" ? "VALID" : tipo
    //r = [...new Set(r)];//remove dados repetidos

    /*r = r.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.mens === value.mens
        ))
    )*/
    r = r.map(i => i.mens)
    r = [...new Set(r)];//remove dados repetidos

    r.forEach(m => {
        msgs += m + "<br>"
        if (m.includes(tipo + " AMD "))
            contAMD++
        if (m.includes(tipo + " WS WRNG "))
            contWS++
        if (m.includes(" COR "))
            contCOR++
        //if (m.mens.replace("SPECI", "METAR").includes("METAR"))
        cont++
    });

    if (contWS > 0)
        txtWS = `<br>Total de Mensagens CORTANTE DE VENTO: ${contWS}`
    tipo = tipo == "AVISO_AERODROMO" ? "AVISO" : tipo
    tipo = tipo == "AVISO_CORTANTE_VENTO" ? "AVISOWS" : tipo
    txtTipo = (tipo == "METAR") ? "METAR / SPECI" : tipo
    txtTipo = (tipo == "AVISO") ? "AVISO DE AERODROMO" : txtTipo
    txtTipo = (tipo == "AVISOWS") ? "AVISO DE CORTANTE DE VENTO" : txtTipo
    document.getElementById("resposta" + tipo).innerHTML = msgs + '<br>' + `Total de Mensagens ${txtTipo}: ${cont}`
        + `<br>Total de Mensagens ${txtTipo} AMD: ${contAMD}`
        + `<br>Total de Mensagens ${txtTipo} COR: ${contCOR}`
        + `<br>${txtWS}<br><br>`

    $.LoadingOverlay("hide");
}

function consultar(api = 1, tipoMsg=false, localidades=false) {
    let data_ini = document.getElementById("dataIni").value
    let data_fin = document.getElementById("dataFin").value
    
    
    if (!localidades)
        localidades = document.getElementById("localidades").value.replace(/ /g, '')

    if (!tipoMsg)
        tipoMsg = document.getElementById('tipoMsg').value.toUpperCase()
    else
        tipoMsg = tipoMsg.toUpperCase()

    let consulta,apiKey=document.getElementById("apiKey").value
    
    if (tipoMsg == "METAR")
        consulta = new METAR(apiKey)

    else if (tipoMsg == "TAF")
        consulta = new TAF(apiKey)

    else if (tipoMsg == "GAMET")
        consulta = new GAMET(apiKey)

    else if (tipoMsg == "SIGMET")
        consulta = new SIGMET(apiKey)

    else if (tipoMsg == "AIRMET")
        consulta = new AIRMET(apiKey)

    else if (tipoMsg == "AVISOAD")
        if (api == 1)
            consulta = new AVISO(apiKey, "AVISO")
        else
            consulta = new AVISO(apiKey, "AVISO_AERODROMO")

    else if (tipoMsg == "AVISOWS")
        if (api == 1)
            consulta = new AVISO(apiKey, "AVISO")
        else
            consulta = new AVISO(apiKey, "AVISO_CORTANTE_VENTO")

    $.LoadingOverlay("show");

    if (api == 2)
        consulta.getOpmet(trataResposta, localidades, data_ini, data_fin)
    else
        consulta.getRedemet(trataResposta, localidades, data_ini, data_fin)
    /*
    let taf = new TAF()
    taf.get(trataResposta, localidades, data_ini, data_fin)

    /*
    let sigmet = new SIGMET()
    sigmet.get(trataResposta, "", data_ini+"00", data_fin+"59")
    
    let airmet = new AIRMET()
    airmet.get(trataResposta, "", data_ini+"00", data_fin+"59")
    */
}

function consultaProdutividade() {
    consultar(2,"avisoad","SBGL,SBEG,SBPA,SBRE,SBGR,SBBR"); 
    consultar(2,"avisows","SBGL,SBEG,SBPA,SBRE,SBGR,SBBR"); 
    consultar(2,"sigmet","SBAZ,SBBS,SBRE,SBAO,SBCW"); 
    consultar(2,"airmet","SBAZ,SBBS,SBRE,SBAO,SBCW"); 
    consultar(2,"taf","SBPA,SBPK,SBCO,SBSM,SBBG,SBNM,SBUG,SBPF,SBCX,SWKQ,SBCT,SBFI,SBBI,SBYS,SBAF,SBSC,SBGW,SBAN,SBPG,SNCP,SBFL,SBNF,SBJV,SBCH,SBJA,SBMN,SBCC,SBGP,SBUF,SBLJ"); 
    consultar(2,"gamet","SBAZ,SBBS,SBRE,SBAO,SBCW"); 
}
