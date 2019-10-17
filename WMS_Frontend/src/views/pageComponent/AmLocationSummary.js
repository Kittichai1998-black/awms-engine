import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState, useRef } from 'react'

import { apicall, createQueryString } from "../../components/function/CoreFunction2"
import Aux from '../../components/AmAux'

import "../../assets/css/AmLocationSummary.css";

const Axios = new apicall()

const AmLocationSummary = props => {
    const [dataTop, setDataTop] = useState()
    const [dataSide, setDataSide] = useState()
    const [dataDetail, setDataDetail] = useState([])
    const [dataAll, setDataAll] = useState()
    const refDetail = useRef();
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
        if (dataDetail.length)
            refDetail.current.scrollIntoView()
    }, [dataDetail])

    useEffect(() => {
        Axios.get(createQueryString(locationSummary)).then((row) => {
            if (row.data.datas.length)
                setDataAll(row.data.datas)
        })
    }, [])

    useEffect(() => {
        if (dataAll) {
            dataAll.map(x => {
                let chkBank = bank.find(y => y.Bank === x.Bank),
                    chkBay = bay.find(y => y.Bay === x.Bay),
                    chkLevel = level.find(y => y.Level === x.Level)
                if (!chkBank) {
                    bank.push(x)
                    // bank.push(x)
                }

                if (!chkBay) {
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                    bay.push(x)
                }
                if (!chkLevel)
                    level.push(x)
            })

            let bayPercen_10 = (bay.length - 1) * 0.1,
                padding = "5px",
                dataT = bank.map((x, xi) => {
                    return (
                        <tr className={"HoverTable"} onClick={() => clickRow(x.Bank)} key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code })
                                if (xi === 0 && yi && yi % bayPercen_10 === 0) { // header แกน x
                                    return <td colspan={bayPercen_10} key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (yi === 0 && xi) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{xi}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Bank\Bay</td>
                                } else if (yi && xi) {
                                    let color = dataFil.length ? dataFil.length * 0.1 : 0,
                                        cssBg = `rgba(255, 0, 0, ${color})`
                                    return (
                                        <td key={yi} style={{
                                            padding: padding,
                                            backgroundColor: cssBg,
                                            border: "1px solid black"
                                        }}></td>
                                    )
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
            let padding = "8px",
                dataS = level.map((x, xi) => {
                    return (
                        <tr key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Level === x.Level && z.Bay === y.Bay && z.Bank === rowBank && z.bsto_Code })

                                // wid = 100 / (bay.length + 1) + "%"

                                if (xi === 0 && yi) {
                                    return <td key={yi} style={{ fontSize: "8px", transform: "rotate(-90deg)", textAlign: "center" }}>{yi}</td>
                                } else if (yi === 0 && xi) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{xi}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Level\Bay</td>
                                } else {
                                    let color = dataFil.length ? (dataFil.length + 1) * 0.1 : 0,
                                        cssBg = `rgba(255, 0, 0, ${color})`
                                    return (
                                        <td
                                            className={"HoverTable"}
                                            key={yi}
                                            onClick={() => clickData(rowBank, y.Bay, x.Level)}
                                            style={{
                                                padding: padding,
                                                backgroundColor: cssBg,
                                                border: "1px solid black"
                                            }}></td>
                                    )
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
        let dataD = dataFil.map((x, xi) => {
            return (
                <Grid key={xi} item xs={6} sm={6} md={6} lg={6} xl={6} ref={xi === 0 ? refDetail : null} >
                    <Card>
                        <CardContent>
                            <p>{x.Code}</p>
                            <p>{x.bsto_Code}</p>
                            <p>{x.psto_Code}</p>
                            <p>{x.psto_Name}</p>
                            <p>{x.Quantity}</p>
                            <p>{x.ut_Code}</p>
                        </CardContent>
                        {/* <CardActions>

                        </CardActions> */}
                    </Card>
                </Grid>
            )
        })
        // setHiddenDetail(!dataD.length)
        setDataDetail(dataD)
    }

    return (
        <Aux>
            <Grid
                container
                // spacing={3}
                direction="row"
                justify="center"
                alignItems="flex-start">
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
                    <b style={{ fontSize: "20px" }}>Top View</b>
                    <div style={{ overflow: "auto", height: (window.innerHeight - 200) / 2, marginLeft: "40px" }}>
                        <table style={{ align: "center" }} >
                            <tbody>
                                {dataTop}
                            </tbody>
                        </table>
                    </div>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
                    <b style={{ fontSize: "20px" }}>Side View</b>
                    <div style={{ overflow: "auto", height: (window.innerHeight - 200) / 2, marginLeft: "40px" }}>
                        <table style={{ align: "center" }} >
                            <tbody>
                                {dataSide}
                            </tbody>
                        </table>
                    </div>
                </Grid>
                {dataDetail.length ? <Aux>
                    <b style={{ fontSize: "20px" }}>Detail</b>
                    <Grid
                        container
                        // spacing={3}
                        direction="row"
                        justify="center"
                        alignItems="flex-start">
                        {dataDetail}
                    </Grid>
                </Aux> : null
                }
            </Grid>
        </Aux>
    )
}

export default AmLocationSummary
