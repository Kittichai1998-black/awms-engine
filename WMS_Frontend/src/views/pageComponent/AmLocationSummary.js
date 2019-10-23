// import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react'

import { apicall, createQueryString } from "../../components/function/CoreFunction2"
import Aux from '../../components/AmAux'

import "../../assets/css/AmLocationSummary.css";

const Axios = new apicall()

const AmLocationSummary = props => {
    const [dataTop, setDataTop] = useState()
    const [dataSide, setDataSide] = useState()
    const [dataDetail, setDataDetail] = useState([])
    const [dataAll, setDataAll] = useState()
    const [titleBank, setTitleBank] = useState()
    const [btnClear, setBtnClear] = useState()
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
        topTr,
        sideTd = [],
        mergeDatas = []

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
                }
                if (!chkBay) {
                    bay.push(x)
                }
                if (!chkLevel)
                    level.push(x)
            })

            let bayPercen_10 = (bay.length - 1) * 0.1,
                padding = "5px",
                dataT = bank.map((x, xi) => {
                    return (
                        <tr className="HoverTable" onClick={(e) => clickRow(x.Bank, e)} key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code })
                                if (xi === 0 && yi && yi % bayPercen_10 === 0 && bayPercen_10 % 1 === 0) { // header แกน x
                                    return <td colSpan={bayPercen_10} key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (xi === 0 && yi && yi % bayPercen_10 !== 0 && bayPercen_10 % 1 !== 0) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (yi === 0 && xi) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{xi}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Bank\Bay</td>
                                } else if (yi && xi) {
                                    let color = dataFil.length ? dataFil.length : 0,
                                        cssBg = `rgba(210, 105, 30, ${color})`
                                    return (
                                        <td key={yi} style={{
                                            padding: padding,
                                            backgroundColor: bgColor(color),
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
            sideTd.forEach(x => {
                x.style.border = "1px solid black"
            })
            sideTd.length = 0

            setDataDetail([])
            mergeDatas.length = 0
            // document.getElementById('divTableSideView').style

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
                                    let color = dataFil.length ? dataFil.length : 0,
                                        cssBg = `rgba(210, 105, 30, ${color})`
                                    return (
                                        <td
                                            className="HoverTable"
                                            key={yi}
                                            onClick={(e) => clickData(rowBank, y.Bay, x.Level, e)}
                                            style={{
                                                padding: padding,
                                                backgroundColor: bgColor(color),
                                                border: "1px solid black"
                                            }}></td>
                                    )
                                }
                            })
                        }</tr>
                    )
                })
            setTitleBank("Bank " + parseInt(rowBank))
            setDataSide(dataS)
        }
    }

    const clickData = (selBank, selBay, selLevel, e) => {
        let chk

        if (e.currentTarget.style.border.search("black") !== -1 && e.currentTarget.style.backgroundColor) {
            e.currentTarget.style.border = "2px solid red"
            sideTd.push(e.currentTarget)
            chk = true
        }
        else {
            e.currentTarget.style.border = "1px solid black"
            chk = false
        }

        let dataFil = dataAll.filter(z => { return z.Level === selLevel && z.Bay === selBay && z.Bank === selBank && z.bsto_Code })

        if (chk) {
            mergeDatas = [...mergeDatas, dataFil]
        } else {
            if (dataFil.length > 0) {
                let index = mergeDatas.findIndex((x, xi) => x.find(y => y.ID === dataFil[0].ID))
                mergeDatas.splice(index, 1);
            }
        }
        let dataD = mergeDatas.map((x, xi) => {
            if (x.length)
                return (
                    // <Grid  xs={12} sm={12} md={12} lg={12} xl={12} item >
                    <Card key={xi} style={{ margin: "5px" }}>
                        <CardContent style={{ padding: "5px" }}>
                            <div style={{ textAlign: "center" }}>
                                <b style={{ color: "red" }}>Location : {x[0].Code}</b>
                            </div>
                            {
                                x.map((y, yi) => {
                                    return (
                                        <Aux key={yi}>
                                            {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
                                            <p style={{ margin: "0px" }}><b>Pallet :</b> {y.bsto_Code}</p>
                                            <p style={{ margin: "0px" }}><b>Pack Code :</b> {y.psto_Code}</p>
                                            <p style={{ margin: "0px" }}><b>Pack Name :</b> {y.psto_Name}</p>
                                            <p style={{ margin: "0px" }}><b>Quantity :</b> {y.Quantity} {y.ut_Code}</p>
                                            {/* <p style={{ margin: "0px" }}>Unit : {y.ut_Code}</p> */}

                                        </Aux>
                                    )
                                })
                            }
                        </CardContent>
                    </Card>
                    // </Grid>
                )
        })

        if (dataD.length) {
            setBtnClear(<button className="btn btn-danger" style={{ padding: "1px", marginLeft: "3px" }} onClick={clickClear}>Clear</button>)
        } else {
            setBtnClear()
        }
        setDataDetail(dataD)
    }

    const bgColor = (num) => {
        switch (num) {
            case 0:
                return;
            case 1:
                return "rgb(255, 195, 120)"
            case 2:
                return "rgb(250, 185, 110)"
            case 3:
                return "rgb(245, 175, 100)"
            case 4:
                return "rgb(240, 165, 90)"
            case 5:
                return "rgb(235, 155, 80)"
            case 6:
                return "rgb(230, 145, 70)"
            case 7:
                return "rgb(225, 135, 60)"
            case 8:
                return "rgb(220, 125, 50)"
            case 9:
                return "rgb(215, 115, 40)"
            default:
                return "rgb(210, 105, 30)"
        }
    }

    const clickClear = () => {
        sideTd.forEach(x => {
            x.style.border = "1px solid black"
        })
        sideTd.length = 0
        setDataDetail([])
        mergeDatas.length = 0
        setBtnClear()
    }

    return (
        <Aux>
            <Grid
                container
                spacing={1}
                direction="row"
                justify="center"
                alignItems="flex-start">
                <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <div style={{ textAlign: "center" }}>
                        <b style={{ fontSize: "20px" }}>Detail</b>
                    </div>
                    <div style={{ height: (window.innerHeight - 200), overflow: "auto" }}>
                        {dataDetail}
                    </div>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9} xl={9}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <b style={{ fontSize: "20px" }}>Top View</b>
                        <div id={"divTableTopView"} style={{ height: (window.innerHeight - 200) / 2 }}>
                            <table>
                                <tbody>
                                    {dataTop}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <b style={{ fontSize: "20px" }}>{titleBank} Side View</b>
                        {btnClear}
                        <div id={"divTableSideView"} style={{ height: (window.innerHeight - 200) / 2 }}>
                            <table>
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
