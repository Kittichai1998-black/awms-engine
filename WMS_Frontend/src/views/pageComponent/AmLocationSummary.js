import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react'

import { apicall, createQueryString } from "../../components/function/CoreFunction2"
import Aux from '../../components/AmAux'

import "../../assets/css/AmLocationSummary.css";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

const Axios = new apicall()

const AmLocationSummary = props => {
    const [dataTop, setDataTop] = useState()
    const [dataSide, setDataSide] = useState()
    const [dataDetail, setDataDetail] = useState()
    const [dataAll, setDataAll] = useState()
    const [hiddenDetail, setHiddenDetail] = useState(true)
    const locationSummary = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "LocationSummary",
        q: '',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: "",
        all: ""
    }

    let bank = [{}],
        bay = [{}],
        level = [{}]

    useEffect(() => {
        Axios.get(createQueryString(locationSummary)).then((row) => {
            console.log(row.data.datas);
            if (row.data.datas.length) {
                setDataAll(row.data.datas)
            }
        })
    }, [])

    useEffect(() => {
        if (dataAll) {
            dataAll.map(x => {
                let chkBank = bank.find(y => y.Bank === x.Bank),
                    chkBay = bay.find(y => y.Bay === x.Bay),
                    chkLevel = level.find(y => y.Level === x.Level)
                if (!chkBank)
                    bank.push(x)
                if (!chkBay)
                    bay.push(x)
                if (!chkLevel)
                    level.push(x)
            })

            let dataT = bank.map((x, xi) => {
                return (
                    <tr className={xi === 0 ? null : "HoverTable"} onClick={() => clickRow(x.Bank)} key={xi}>{
                        bay.map((y, yi) => {
                            let dataFil = dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code }),
                                color = dataFil.length ? (dataFil.length + 1) * 0.1 : 0,
                                cssBg = `rgba(255, 0, 0, ${color})`,
                                wid = 100 / (bay.length + 1) + "%"

                            if (xi === 0 && yi) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>{yi}</td>
                            } else if (yi === 0 && xi) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>{xi}</td>
                            } else if (yi === 0 && xi === 0) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>Bank\Bay</td>
                            } else {
                                return (<td key={yi} style={{
                                    width: wid,
                                    backgroundColor: cssBg,
                                    border: "1px solid black"
                                }}></td>)
                            }
                        })
                    }</tr>
                )
            })
            setDataTop(dataT)
        }
    }, [dataAll])

    const clickRow = (rowBank) => {
        if (rowBank) {
            // data
            // console.log(bank);
            // console.log(bay);
            // console.log(level);
            // console.log(dataAll);
            // console.log(dataTop);


            let dataS = level.map((x, xi) => {
                return (
                    <tr key={xi}>{
                        bay.map((y, yi) => {
                            // console.log(x.Level);

                            let dataFil = dataAll.filter(z => { return z.Level === x.Level && z.Bay === y.Bay && z.Bank === rowBank && z.bsto_Code }),
                                color = dataFil.length ? (dataFil.length + 1) * 0.1 : 0,
                                cssBg = `rgba(255, 0, 0, ${color})`,
                                wid = 100 / (bay.length + 1) + "%"
                            if (dataFil.length)
                                console.log(dataFil);

                            if (xi === 0 && yi) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>{yi}</td>
                            } else if (yi === 0 && xi) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>{xi}</td>
                            } else if (yi === 0 && xi === 0) {
                                return <td key={yi} style={{ width: wid, textAlign: "center" }}>Level\Bay</td>
                            } else {
                                return (<td
                                    className={"HoverTable"}
                                    key={yi}
                                    onClick={() => clickData(rowBank, y.Bay, x.Level)}
                                    style={{
                                        width: wid,
                                        backgroundColor: cssBg,
                                        border: "1px solid black"
                                    }}></td>)
                            }
                        })
                    }</tr>
                )
            })
            setDataSide(dataS)
        }
    }

    const clickData = (selBank, selBay, selLevel) => {
        let dataFil = dataAll.filter(z => { return z.Level === selLevel && z.Bay === selBay && z.Bank === selBank && z.bsto_Code })
        // console.log(dataFil);
        // if (dataFil.length) {
        let chkDetail = false
        let dataD = dataFil.map(x => {

            return (
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} style={{ textAlign: "center" }}>
                    <Card>
                        <CardContent>

                            <p>{x.Code}</p>
                            <p>{x.bsto_Code}</p>
                            <p>{x.psto_Code}</p>
                            <p>{x.psto_Name}</p>
                            <p>{x.Quantity}</p>
                            <p>{x.ut_Code}</p>
                        </CardContent>
                        <CardActions>

                        </CardActions>
                    </Card>
                </Grid>
            )
        })
        // console.log(dataD);
        if (!dataD.length)
            chkDetail = true

        setHiddenDetail(chkDetail)
        setDataDetail(dataD)
        // }
    }

    return (
        <Aux>
            <Grid
                container
                spacing={3}
                direction="row"
                justify="center"
                alignItems="flex-start">
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{ textAlign: "center" }}>
                    <b style={{ fontSize: "20px" }}>Top View</b>
                    <table style={{ width: '100%', height: window.innerHeight - 170 }}>
                        <tbody>
                            {dataTop}
                        </tbody>
                    </table>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{ textAlign: "center" }}>
                    <b style={{ fontSize: "20px" }}>Side View</b>
                    <table style={{ width: '100%', height: window.innerHeight - 170 }}>
                        <tbody>
                            {dataSide}
                        </tbody>
                    </table>
                </Grid>
                {hiddenDetail ? null :
                    <Aux>
                        <b style={{ fontSize: "20px" }}>Detail</b>
                        <Grid container
                            spacing={3}
                            direction="row"
                            justify="center"
                            alignItems="flex-start">
                            {dataDetail}
                        </Grid>
                    </Aux>
                }
            </Grid>
            {/* {hiddenDetail ? null :
                <Aux>
                    <b style={{ fontSize: "20px" ,textAlign:"center"}}>Detail</b>
                    <Grid
                        container
                        spacing={3}
                        direction="row"
                        justify="center"
                        alignItems="flex-start"
                        >
                        {dataDetail}
                    </Grid>
                </Aux>
            } */}
        </Aux>
    )
}

export default AmLocationSummary
