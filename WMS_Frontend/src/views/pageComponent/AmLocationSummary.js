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
    // const refDetail = useRef();
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
        level = [{}],
        topTr


    // useEffect(() => {
    //     if (dataDetail.length)
    //         refDetail.current.scrollIntoView()
    // }, [dataDetail])

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
                        <tr className={"HoverTable"} onClick={(e) => clickRow(x.Bank, e)} key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code })
                                if (xi === 0 && yi && yi % bayPercen_10 === 0) { // header แกน x
                                    return <td colSpan={bayPercen_10} key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (yi === 0 && xi) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{xi}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Bank\Bay</td>
                                } else if (yi && xi) {
                                    let color = dataFil.length ? dataFil.length * 0.1 : 0,
                                        cssBg = `rgba(210, 105, 30, ${color})`
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

    const clickRow = (rowBank, e) => {
        if (rowBank) {
            if (topTr) {
                topTr.classList.remove("active");
                // topTr.removeAttribute("style")
            }

            // e.currentTarget.setAttribute("style", "border: 2px solid yellow;");
            e.currentTarget.classList.add("active");
            topTr = e.currentTarget

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
                                        cssBg = `rgba(210, 105, 30, ${color})`
                                    return (
                                        <td
                                            className={"HoverTable"}
                                            key={yi}
                                            onClick={(e) => clickData(rowBank, y.Bay, x.Level, e)}
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

    const clickData = (selBank, selBay, selLevel, e) => {
        if (e.currentTarget.style.border.search("black") !== -1) {
            e.currentTarget.style.border = "2px solid red"
        }
        else {
            e.currentTarget.style.border = "1px solid black"
        }

        let dataFil = dataAll.filter(z => { return z.Level === selLevel && z.Bay === selBay && z.Bank === selBank && z.bsto_Code })
        // let dataD = dataFil.map((x, xi) => {
        //     return (
        //         <Grid key={xi} item xs={12} sm={12} md={12} lg={12} xl={12}>
        //             <Card>
        //                 <CardContent>
        //                     <p>{x.Code}</p>
        //                     <p>{x.bsto_Code}</p>
        //                     <p>{x.psto_Code}</p>
        //                     <p>{x.psto_Name}</p>
        //                     <p>{x.Quantity}</p>
        //                     <p>{x.ut_Code}</p>
        //                 </CardContent>
        //                 {/* <CardActions>

        //                 </CardActions> */}
        //             </Card>
        //         </Grid>
        //     )
        // })
        // setHiddenDetail(!dataD.length)
        console.log(dataFil);

        setDataDetail(dataFil)
    }

    return (
        <Aux>
            <Grid
                container
                // spacing={3}
                direction="row"
                justify="center"
                alignItems="flex-start">
                <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <div style={{ textAlign: "center" }}>
                        <b style={{ fontSize: "20px" }}>Detail</b>
                    </div>


                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9} xl={9}>
                    <Grid
                        container
                        // spacing={3}
                        direction="row"
                        justify="center"
                        alignItems="flex-start">
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
                        <b style={{ fontSize: "20px" }}>Top View</b>
                        <div id={"divTableTopView"} style={{ height: (window.innerHeight - 200) / 2 }}>
                            <table align={"center"}>
                                <tbody>
                                    {dataTop}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
                        <b style={{ fontSize: "20px" }}>Side View</b>
                        <div id={"divTableSideView"} style={{ height: (window.innerHeight - 200) / 2 }}>
                            <table align={"center"}>
                                <tbody>
                                    {dataSide}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                </Grid>




            </Grid>
        </Aux>
    )
}

export default AmLocationSummary
