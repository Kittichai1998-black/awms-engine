import React, { useEffect, useState } from 'react'
import Aux from '../../components/AmAux'
import { apicall, createQueryString } from "../../components/function/CoreFunction2"
import { red } from '@material-ui/core/colors'
const Axios = new apicall()

const AmLocationSummary = props => {
    const [data, setData] = useState()
    const [test, setTest] = useState("")
    const locationSummary = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "LocationSummary",
        q: '',
        f: "*",
        g: "",
        s: "[{'f':'Bank','od':'asc'},{'f':'Bay','od':'asc'},{'f':'Level','od':'asc'}]",
        sk: 0,
        l: "",
        all: ""
    }

    const bank = 15,
        bay = 20,
        level = 9
        console.log(window.innerHeight);
        
console.log(window.innerHeight/15);

    useEffect(() => {

        Axios.get(createQueryString(locationSummary)).then((row) => {
            console.log(row.data.datas);
            setData(row.data.datas)
            if (row.data.datas) {
                let htmlString = "<table style='width: 100%;'>"
                for (let ibank = 0; ibank <= bank; ibank++) { //Bank col
                    htmlString += `<tr style="height: ${window.innerHeight/(bank+4)}px;">`
                    for (let ibay = 0; ibay <= bay; ibay++) { //Bay row
                        let dataTop = row.data.datas.filter(x => { return parseInt(x.Bank) === ibank && x.Bay === ibay && x.bsto_Code })

                        let txt = ""
                        let idColor = 0
                        if (dataTop.length) {
                            idColor = (dataTop.length + 1) * 0.1
                            console.log(dataTop);
                            txt = `background-color: rgba(255, 0, 0, ${idColor});`
                        }
                        if(ibank===0){
                            htmlString += `<td >${ibay}</td>`
                        }else if(ibay===0){
                            htmlString += `<td style="display: block;">${ibank}</td>`
                        }else{
                            htmlString += `<td style='border: 1px solid black;${txt}'></td>`
                        }
                        
                    }
                    htmlString += "</tr>"
                }
                htmlString += "</table>"
                setTest(htmlString)
            }



            // if (row.data.datas.length > 0) {
            //     setDataWarehouse(row.data.datas[0])
            // }
        })
    }, [])

    return (
        <Aux>
            {/* <table style={{ border: "1px solid black" }}> */}
            {<div dangerouslySetInnerHTML={{ __html: test }}></div>}
            {/* </table> */}
        </Aux>
    )
}

export default AmLocationSummary
