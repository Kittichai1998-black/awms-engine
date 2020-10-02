// import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

// import ListSubheader from '@material-ui/core/ListSubheader';
import Card from '@material-ui/core/Card';
import Collapse from '@material-ui/core/Collapse';
// import DraftsIcon from '@material-ui/icons/Drafts';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import { log } from 'util';
import React, { useEffect, useState } from 'react'
// import SendIcon from '@material-ui/icons/Send';
// import StarBorder from '@material-ui/icons/StarBorder';

import { apicall, createQueryString } from "../../components/function/CoreFunction"
import Aux from '../../components/AmAux'
import { getUnique, groupBy } from '../../components/function/ObjectFunction'
import AmAuditStatus from '../../components/AmAuditStatus'
import "../../assets/css/AmLocationSummary.css";
import moment from "moment";
const Axios = new apicall()

const AmLocationSummary = props => {
    const [dataTop, setDataTop] = useState()
    const [dataSide, setDataSide] = useState()
    const [dataDetail, setDataDetail] = useState([])
    const [dataFull, setDataFull] = useState()
    const [dataBank, setDataBank] = useState()
    const [dataAll, setDataAll] = useState()
    const [titleBank, setTitleBank] = useState()
    const [btnClear, setBtnClear] = useState()
    const [open, setOpen] = useState({
        full: true,
        bank: false,
        cell: false
    });
    // const refDetail = useRef();
    const locationSummary = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "LocationSummary",
        q: '',
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'ASC'}]",
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
            if (row.data._result.status && row.data.datas.length) {
                setDataAll(row.data.datas)

                let pack = row.data.datas.filter(x => x.bsto_Code),
                    palletLen = getUnique(pack, "bsto_Code").length,
                    palletAll = getUnique(row.data.datas, "Code").length,
                    palletPer = (palletLen / palletAll * 100).toFixed(3),
                    groupSKUP = groupBy(pack.sort((a, b) => (a.skut_Code > b.skut_Code) ? 1 : ((b.skut_Code > a.skut_Code) ? -1 : 0)), "skut_Code"),
                    groupBankP = groupBy(row.data.datas.sort((a, b) => (a.Bank > b.Bank) ? 1 : ((b.Bank > a.Bank) ? -1 : 0)), "Bank"),
                    // groupBayP = groupBy(pack.sort((a, b) => (a.Bay > b.Bay) ? 1 : ((b.Bay > a.Bay) ? -1 : 0)), "Bay"),
                    // groupLevelP = groupBy(pack.sort((a, b) => (a.Level > b.Level) ? 1 : ((b.Level > a.Level) ? -1 : 0)), "Level"),
                    setFull = (
                        <Card style={{ margin: "5px" }}>
                            <CardContent style={{ padding: "5px" }}>
                                {/* <div style={{ textAlign: "center" }}>
                                    <b style={{ color: "red" }}>Location : {x[0].Code}</b>
                                </div> */}
                                <p style={{ margin: "0px" }}><b>Used Location</b></p>
                                <p style={{ margin: "0px" }}>Pallet : {palletLen}/{palletAll} {`(${palletPer}%)`}</p>
                                <p style={{ margin: "0px" }}>Pack : {pack.length}</p>

                                {groupSKUP.length ? (
                                    <Aux>
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>SKU Type</b></p>
                                        {groupSKUP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{x[0].skut_Code} : {getUnique(x, "bsto_Code").length} Pallet {"(" + x.length + " Pack)"}</p>)}
                                    </Aux>
                                ) : null}

                                {pack.length ? (
                                    <Aux>
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Bank</b></p>
                                        {groupBankP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bank)} : {getUnique(x.filter(y => y.bsto_Code), "bsto_Code").length} Pallet  {x.filter(y => y.bsto_Code).length ? "(" + x.filter(y => y.bsto_Code).length + " Pack)" : null}</p>)}

                                        {/* <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Bay</b></p>
                                        {groupBayP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bay)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}
    
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Level</b></p>
                                        {groupLevelP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Level)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)} */}
                                    </Aux>
                                ) : null}
                            </CardContent>
                        </Card>
                    )
                setDataFull(setFull)
            }

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
                if (!chkLevel) {
                    level.push(x)
                }
            })
            console.log(bank);
            let bayPercen_10 = (bay.length - 1) * 0.1,
                padding = "5px",
                palletLen = (bank.length - 1) * (bay.length - 1),

                dataT = bank.sort((a, b) => (a.Bank < b.Bank) ? -1 : ((b.Bank < a.Bank) ? 1 : 0)).map((x, xi) => {
                    let countPalletBank = 0
                    return (
                        <tr className="HoverTable" onClick={(e) => clickRow(x.Bank, e)} key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = groupBy(dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code }), "bsto_Code")
                                let dataFin = dataAll.find(z => { return z.Bank === x.Bank && z.Bay === y.Bay })

                                if (xi === 0 && yi && yi % bayPercen_10 === 0 && bayPercen_10 % 1 === 0) { // header แกน x
                                    return <td colSpan={bayPercen_10} key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (xi === 0 && yi && yi % bayPercen_10 !== 0 && bayPercen_10 % 1 !== 0) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{yi}</td>
                                } else if (yi === 0 && xi) { // header แกน y
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{parseInt(x.Bank)}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Bank\Bay</td>
                                } else if (yi && xi) {
                                    let percen = groupBy(dataFil, "Code").length / (level.length - 1) * 100,
                                        row
                                    // cssBg = `rgba(210, 105, 30, ${color})`
                                    countPalletBank += dataFil.length
                                    // console.log(dataFin);

                                    // console.log(bgColor(percen));
                                    // if (xi >= 1 && xi <= 4) {

                                    // } else {

                                    // }
                                    switch (xi) {
                                        case 1:
                                            row = 25; break
                                        case 2:

                                            row = 50; break
                                        case 3:

                                            row = 75; break
                                        case 4:

                                            row = 100; break
                                        default:

                                            row = 0; break
                                    }
                                    console.log(row)
                                    return (
                                        <Aux key={yi}>
                                            <td style={{
                                                padding: padding,
                                                backgroundColor: dataFin ? bgColor(percen) : "black",
                                                border: "1px solid black"
                                            }}></td>
                                            {yi === bay.length - 1 ? <td>{countPalletBank ? (countPalletBank / palletLen * 100).toFixed(3) + "%" : null}</td> : null}
                                            {yi === bay.length - 1 ? <td
                                                style={{
                                                    backgroundColor: bgColor(row),
                                                    // border: row?"1px solid black":null
                                                }}
                                            >{row ? row + clickDesCription(row) : null}</td> : null}

                                        </Aux>
                                    )
                                }
                            })
                        }</tr>
                    )
                })
            setDataTop(dataT)
        }
    }, [dataAll])

    const clickDesCription = (row) => {
        if (row == 25) {
            return " (Low Density)"
        } else if (row == 50) {
            return " (Medium Density)"
        } else if (row == 75) {
            return " (High Density)"
        } else if (row == 100) {
            return " (Full)"
        } else {
            return null
        }
    }
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
                dataS = level.sort((a, b) => (a.Level > b.Level) ? -1 : ((b.Level > a.Level) ? 1 : 0)).map((x, xi) => {
                    return (
                        <tr key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Level === x.Level && z.Bay === y.Bay && z.Bank === rowBank && z.bsto_Code })
                                let dataFin = dataAll.find(z => { return z.Level === x.Level && z.Bay === y.Bay && z.Bank === rowBank })
                                // wid = 100 / (bay.length + 1) + "%"

                                if (xi === 0 && yi) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{yi}</td>
                                } else if (yi === 0 && xi) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{x.Level}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Level\Bay</td>
                                } else {
                                    let color = dataFil.length ? "#993300" : null,
                                        cssBg = `rgba(210, 105, 30, ${color})`
                                    return (
                                        <td
                                            className="HoverTable"
                                            key={yi}
                                            onClick={(e) => clickData(rowBank, y.Bay, x.Level, e)}
                                            style={{
                                                padding: padding,
                                                backgroundColor: dataFin ? color : "black",
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
            setBtnClear()

            let pack = dataAll.filter(x => x.bsto_Code && x.Bank === rowBank),
                groupSKUP = groupBy(pack.sort((a, b) => (a.skut_Code > b.skut_Code) ? 1 : ((b.skut_Code > a.skut_Code) ? -1 : 0)), "skut_Code"),
                groupBay = groupBy(pack.sort((a, b) => (a.Bay > b.Bay) ? 1 : ((b.Bay > a.Bay) ? -1 : 0)), "Bay"),
                groupLevel = groupBy(pack.sort((a, b) => (a.Level > b.Level) ? 1 : ((b.Level > a.Level) ? -1 : 0)), "Level"),
                setBank = pack.length ? (
                    <Card style={{ margin: "5px" }}>
                        <CardContent style={{ padding: "5px" }}>
                            <p style={{ margin: "0px" }}><b>Bank {parseInt(rowBank)}</b></p>

                            <hr style={{ margin: "5px 0" }} />
                            <p style={{ margin: "0px" }}><b>SKU Type</b></p>
                            {groupSKUP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{x[0].skut_Code} : {getUnique(x, "bsto_Code").length} Pallet {"(" + x.length + " Pack)"}</p>)}

                            <hr style={{ margin: "5px 0" }} />
                            <p style={{ margin: "0px" }}><b>Bay</b></p>
                            {groupBay.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bay)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}

                            <hr style={{ margin: "5px 0" }} />
                            <p style={{ margin: "0px" }}><b>Level</b></p>
                            {groupLevel.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Level)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}
                        </CardContent>
                    </Card>
                ) : null

            setDataBank(setBank)
            setOpen({ full: false, bank: true, cell: false })
        }
    }

    const clickData = (selBank, selBay, selLevel, e) => {
        let chk

        if (e.currentTarget.style.border.search("black") !== -1 && e.currentTarget.style.backgroundColor) {
            e.currentTarget.style.border = "2px solid Aqua"
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
                console.log(x)
            return (
                // <Grid  xs={12} sm={12} md={12} lg={12} xl={12} item >
                <Card key={xi} style={{ margin: "5px" }}>
                    <CardContent style={{ padding: "5px" }}>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ margin: "0px" }}><b style={{ color: "red" }}>Location : {x[0].Code} </b></p>
                            <p style={{ margin: "0px" }}><b style={{ color: "red" }}>Pallet : {x[0].bsto_Code}</b></p>
                        </div>
                        {
                            x.map((y, yi) => {
                                if (y.skut_Code === "ESP") {
                                    return (
                                        <Aux key={yi}>
                                            {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
                                            {/* <p style={{ margin: "0px" }}><b>Pallet :</b> {y.bsto_Code}</p> */}
                                            <p style={{ margin: "0px" }}><b>Pack Code :</b> {y.psto_Code}</p>
                                            <p style={{ margin: "0px" }}><b>Pack Name :</b> {y.psto_Name}</p>
                                            <p style={{ margin: "0px" }}><b>Quantity :</b> {y.Quantity} {y.ut_Code}</p>
                                            <p style={{ margin: "0px" }}><b>SKU Type :</b> {y.skut_Code}</p>
                                        </Aux>
                                    )
                                } else {
                                    let lot = y.Lot ? <p style={{ margin: "0px" }}><b>Lot :</b> {y.Lot}</p> :
                                        y.Ref1 ? <p style={{ margin: "0px" }}><b>Vendor Lot :</b> {y.Ref1}</p> : null;

                                    return (

                                        <Aux key={yi}>
                                            {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
                                            {/* <p style={{ margin: "0px" }}><b>Pallet :</b> {y.bsto_Code}</p> */}
                                            <p style={{ margin: "0px" }}><b>Pack Code :</b> {y.psto_Code}</p>
                                            <p style={{ margin: "0px" }}><b>Pack Name :</b> {y.psto_Name}</p>
                                            <p style={{ margin: "0px" }}><b>Quantity :</b> {y.Quantity} {y.ut_Code}</p>
                                            <p style={{ margin: "0px" }}><b>SKU Type :</b> {y.skut_Code}</p>
                                            <p style={{ margin: "0px" }}><b>Weight (kg) :</b> {y.pstoWeigthKG}</p>
                                            <p style={{ margin: "0px" }}><b>MFG.Date :</b> {y.ProductDate ? moment(y.ProductDate).format("DD/MM/YYYY") : ""}</p>
                                            <p style={{ margin: "0px" }}><b>Expire Date :</b> {y.ExpiryDate ? moment(y.ExpiryDate).format("DD/MM/YYYY") : ""}</p>
                                            {lot}
                                            {/* <p style={{ margin: "0px" }}><b>Lot :</b> {y.Lot}</p>
                                            <p style={{ margin: "0px" }}><b>Vendor Lot :</b> {y.Ref1}</p> */}
                                            <p style={{ margin: "0px" }}><b>Quality Status :</b> <AmAuditStatus statusCode={y.AuditStatus} /> </p>
                                        </Aux>
                                    )
                                }

                            })
                        }
                    </CardContent>
                </Card>
                // </Grid>
            )
        })

        if (dataD.length) {
            setBtnClear(<button className="btn btn-danger" style={{ padding: "1px", marginLeft: "10px" }} onClick={clickClear}>Clear</button>)
            setOpen({ bank: false, full: false, cell: true })
        } else {
            setBtnClear()
            setOpen({ bank: true, full: false, cell: false })
        }

        setDataDetail(dataD)
    }

    const bgColor = (num) => {
        switch (true) {
            case (num >= 1 && num <= 25):
                return "#00ff00";
            case (num >= 26 && num <= 50):
                return "yellow"
            case (num >= 51 && num <= 75):
                return "orange"
            case (num >= 76 && num <= 100):
                return "red"
            default:
                return null
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
        setOpen({ bank: true, full: false, cell: false })
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
                    {/* <div style={{ textAlign: "center" }}>
                        <b style={{ fontSize: "20px" }}>Detail</b>
                    </div> */}

                    {/* {dataDetail} */}
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        //                     subheader={
                        //                         <ListSubheader component="div" id="nested-list-subheader">
                        //                             Nested List Items
                        // </ListSubheader>
                        //                     }
                        className="list"
                    >
                        <ListItem className="listitem" button onClick={() => setOpen({ bank: false, full: !open.full, cell: false })} >
                            <ListItemText className="listitemtext" primary="Full" />
                            {open.full ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.full} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 215), overflow: "auto" }}>
                                {dataFull}
                            </div>
                        </Collapse>

                        <ListItem className="listitem" button onClick={() => setOpen({ full: false, bank: !open.bank, cell: false })}>
                            <ListItemText className="listitemtext" primary="Bank" />
                            {open.bank ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.bank} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 215), overflow: "auto" }}>
                                {dataBank}
                            </div>
                        </Collapse>

                        <ListItem className="listitem" button onClick={() => setOpen({ bank: false, full: false, cell: !open.cell })}>
                            {/* <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>*/}
                            <ListItemText className="listitemtext" primary="Cell" />
                            {open.cell ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.cell} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 215), overflow: "auto" }}>
                                {dataDetail}
                            </div>
                        </Collapse>
                    </List>
                </Grid>
                <Grid item xs={9} sm={9} md={9} lg={9} xl={9}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <b style={{ fontSize: "20px" }}>Top View</b>
                        <div id={"divTableTopView"} style={{ height: '50%' }}>
                            {/* (window.innerHeight - 200) / 2 */}
                            <table>
                                <tbody>
                                    {dataTop}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: '5px' }}>
                        <b style={{ fontSize: "20px" }}>Side View {titleBank}</b>
                        {btnClear}
                        <div id={"divTableSideView"} style={{ height: '50%' }}>
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
