class Metar {
    parametroTeto = { vermelho: 200, ambar: 500, amarelo: 1500, verde: 5000 }
    parametoVisibilidade = { vermelho: 1000, ambar: 2500, amarelo: 5000, verde: 10000 }
    parametroTurno = { manha: 8, tarde: 15, noite: 21, noiteFim: 23 }

    constructor(manha, tarde, noite, noiteFim) {
        if (manha)
            this.setParametroTurno(manha, tarde, noite, noiteFim)
    }

    get(callBack, localidade, datai, dataf) {

        async function getPages(url, lastPage, callBack, arg, obj) {

            for (let i = 2; i <= lastPage; i++) {
                const response = await fetch(url + i);
                let { data, total_pages } = await response.json();
                data.data.forEach(mens => arg = arg.concat([[mens.mens, obj.getVisibilidade(mens.mens), obj.getTeto(mens.mens)[2], obj.getColorMetar(obj.getVisibilidade(mens.mens), obj.getTeto(mens.mens)[2]), obj.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]]))
            }
            callBack(arg)
        }

        function getUrlPages(url) {//'/?page_tam=150&data_ini=2023030900&data_fim=2023031005&page=2'
            return url.split("page=")[0] + "page="

        }
        let dataIni = datai, dataFim = dataf
        let resp = []

        const chaveAPI = 'U9Q2PoK6e5uhykrMXrsrGAQssG8htAnPIqXsxmei'
        if (dataFim.length < 10)
            dataFim += "23"
        let urlBase = `https://api-redemet.decea.mil.br/mensagens/metar/${localidade}?api_key=${chaveAPI}&data_ini=${dataIni}00&data_fim=${dataFim}`
        fetch(urlBase)
            .then((response) => {
                if (response.ok)
                    return response.json()
                //setMetares(response.data)
            })
            .then(response => {
                //response.data.next_page_url = ""
                response.data.data.map((mens) => (

                    resp = resp.concat([[mens.mens, this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2], this.getColorMetar(this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2]), this.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]])
                )

                )
                if (response.data.last_page > 1){ 
                    let urlPages = getUrlPages(response.data.next_page_url)
                    getPages(urlBase + urlPages, response.data.last_page, callBack, resp,this)
                }
                else
                    callBack(resp)

                //pagesRequired = resp.data.pagesRequired;

                /*
                                    Promise.all(apiPromises)
                                        .then(responses => {
                                            //  const processedResponses = [];
                                            responses.map(response => {
                                                if (response.ok)
                                                    return response.json()
                                            })
                                        }
                
                                        )
                                }).then(response => {
                                    response.data.data.map((mens) => {
                                        resp = resp.concat([[mens.mens, this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2], this.getColorMetar(this.getVisibilidade(mens.mens), this.getTeto(mens.mens)[2]), this.getTurnoMetar(mens.validade_inicial, dataIni.substr(6, 2))]])
                                    })
                                }
                */


            })
        //return resp.slice(0)
    }

    setParametroTurno(manha, tarde, noite, noiteFim) {
        this.parametroTurno.manha = parseInt(manha)
        this.parametroTurno.tarde = parseInt(tarde)
        this.parametroTurno.noite = parseInt(noite)
        this.parametroTurno.noiteFim = parseInt(noiteFim)
    }

    getTurnoMetar(inicioValidade, diaRef) {
        diaRef = parseInt(diaRef)

        let inicio = new Date(inicioValidade).getHours()
        if (diaRef < new Date(inicioValidade).getDate())
            inicio += 24

        if (inicio > this.parametroTurno.noiteFim)
            return ""
        else if (inicio >= this.parametroTurno.noite)
            return "NOITE"
        else if (inicio >= this.parametroTurno.tarde)
            return "TARDE"
        else if (inicio >= this.parametroTurno.manha)
            return "MANHÃ"
        return ""
    }

    getColorMetar(vis, teto) {
        teto = parseInt(teto)
        //if (teto === 0)
        //    teto = 1500
        if (vis < this.parametoVisibilidade.vermelho || teto < this.parametroTeto.vermelho)
            return "VERMELHO"
        if (vis < this.parametoVisibilidade.ambar || teto < this.parametroTeto.ambar)
            return "AMBAR"
        if (vis < this.parametoVisibilidade.amarelo || teto < this.parametroTeto.amarelo)
            return "AMARELO"
        if (vis < this.parametoVisibilidade.verde || teto < this.parametroTeto.verde)
            return "VERDE"

        return "AZUL"
    }

    getTeto(metar) {
        var resultado = [3];

        let ibkn = metar.indexOf(" BKN0");;
        let iovc = metar.indexOf(" OVC0");;
        let ivv = metar.indexOf(" VV00");;

        var bkn0 = ibkn > -1;
        var bknbbb = metar.includes(" BKN///");
        var bkn = bkn0 || bknbbb;

        var ovc0 = iovc > -1;
        var ovcbbb = metar.includes(" OVC///");
        var ovc = ovc0 || ovcbbb;

        var vv00 = ivv > -1;
        var vvbbb = metar.includes(" VV///");
        var vv = vv00 || vvbbb;

        resultado[1] = "F";
        resultado[2] = "99999";
        resultado[3] = "NIL";



        var inicio = 0;
        var valorTeto = 0;

        if (bkn0) {
            inicio = metar.indexOf(" BKN0") + 5;
            valorTeto = metar.substr(inicio, 2);
            resultado[2] = valorTeto * 100;
            resultado[3] = "BKN" + valorTeto.padStart(3, "0");
        }

        if (ovc0) {
            if ((iovc < ibkn) || (ibkn === -1)) {
                inicio = metar.indexOf(" OVC0") + 5;
                valorTeto = metar.substr(inicio, 2);
                resultado[2] = valorTeto * 100;
                resultado[3] = "OVC" + valorTeto.padStart(3, "0");
            }
        }

        if (vv00) {
            inicio = metar.indexOf(" VV00") + 5;
            valorTeto = metar.substr(inicio, 1);
            resultado[2] = valorTeto * 100;
            resultado[3] = "VV00" + valorTeto;
        }

        if (bknbbb)
            resultado[3] = "BKN///";
        if (ovcbbb)
            resultado[3] = "OVC///";
        if (vvbbb)
            resultado[3] = "VV///";


        if (bkn || ovc || vv) {
            resultado[1] = "T";
        }

        return resultado;
    }

    getposVis(metar) {
        var posVis = 4;

        if (metar.includes(" COR ")) {
            posVis = posVis + 1;
        }

        if (metar.includes(" AUTO ")) {
            posVis = posVis + 1;
        }

        return posVis;
    }

    arraySize(arr) {
        return arr.length
    }

    getVisibilidade(metar) {

        var campos = [];
        var posVis;
        let visib
        if (metar.includes(" CAVOK ") || metar.includes(" 9999 ")) {
            return 10000
        }

        posVis = this.getposVis(metar);

        campos = metar.split(" ");

        if (posVis < this.arraySize(campos)) {
            visib = campos[posVis] + "";
        }
        else {
            return -1;
        }

        if (visib.length > 4) {
            if (visib.indexOf("V") > -1) { //vento variando
                posVis = posVis + 1;
                visib = campos[posVis];
                return visib;
            }
            else {
                return -1
            }
        }
        else {
            return visib
        }

    }

    getColorTeto(teto, parametro) {

    }

    getColorVisibilidade(visibilidade, parametro) {

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

    /*getColorMetar(metar, parametroTeto, parametroVisibilidade) {
    }*/
}

metar = new Metar()