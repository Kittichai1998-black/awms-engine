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
import React, { useEffect, useState, useRef, createRef } from 'react'
// import SendIcon from '@material-ui/icons/Send';
// import StarBorder from '@material-ui/icons/StarBorder';

import { apicall, createQueryString } from "../../components/function/CoreFunction"
// import Aux from '../../components/AmAux'
import ModalForm from '../../components/table/AmEditorTable'
import { getUnique, groupBy } from '../../components/function/ObjectFunction'
import AmAuditStatus from '../../components/AmAuditStatus'
import "../../assets/css/AmLocationSummary.css";
import moment from "moment";
import AmDropdown from '../../components/AmDropdown'
import styled from 'styled-components'
import Label from '../../components/AmLabelMultiLanguage'
import { editorListcolunm } from '../../components/table/AmGennarateFormForEditorTable'
// import Aux from 'react-aux'

const Axios = new apicall()

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;

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
    const [editData, setEditData] = useState({});
    const [toggleModal, setToggleModal] = useState(false)

    const [inputError, setInputError] = useState([])
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

    const dataDD = [
        { label: "Top view", value: "top" },
        { label: "Bottom view", value: "bottom" },
        { label: "Side view", value: "side" }
    ]

    const view_AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{"f" : "AreaMasterType_ID", "c" : "=", "v" : 10}]',
        f: "*",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    };
    const columsFindPopupArea = [
        { Header: "Code", accessor: "Code", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];
    const columnEdit = [
        {
            idddl: "area",
            Header: "Area",
            accessor: "ID",
            type: "findPopUp",
            // search: "Code",
            queryApi: view_AreaMaster,
            fieldLabel: ["Code", "Name"],
            columsddl: columsFindPopupArea,
            // related: ["Name"],
            // fieldDataKey: "Code", // ref กับ accessor
            defaultValue: 1,
            required: true
        },
        { Header: "Level", accessor: "select", type: "input", width: '300px' },
        { Header: "Pallet Code", accessor: "code", type: "input", width: '300px' },
        { Header: "Lot", accessor: "lot", type: "input", width: '300px' },
        { Header: "Batch", accessor: "batch", type: "input", width: '300px' },
        { Header: "Order No", accessor: "orderNo", type: "input", width: '300px' },
        { Header: "Expire date from", accessor: "fromExpireDate", type: "date", width: '300px' },
        { Header: "to", accessor: "toExpireDate", type: "date", width: '300px' },
        { Header: "Product date from", accessor: "fromProductDate", type: "date", width: '300px' },
        { Header: "to", accessor: "toProductDate", type: "date", width: '300px' },
        { Header: "Incubation day from", accessor: "fromIncubationDay", type: "input", width: '300px' },
        { Header: "to", accessor: "toIncubationDay", type: "input", width: '300px' },
    ]
    const ref = useRef(columnEdit.map(() => createRef()))

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
                    // groupLvP = groupBy(pack.sort((a, b) => (a.Lv > b.Lv) ? 1 : ((b.Lv > a.Lv) ? -1 : 0)), "Lv"),
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
                                    <>
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>SKU Type</b></p>
                                        {groupSKUP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{x[0].skut_Code} : {getUnique(x, "bsto_Code").length} Pallet {"(" + x.length + " Pack)"}</p>)}
                                    </>
                                ) : null}

                                {pack.length ? (
                                    <>
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Bank</b></p>
                                        {groupBankP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bank)} : {getUnique(x.filter(y => y.bsto_Code), "bsto_Code").length} Pallet  {x.filter(y => y.bsto_Code).length ? "(" + x.filter(y => y.bsto_Code).length + " Pack)" : null}</p>)}

                                        {/* <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Bay</b></p>
                                        {groupBayP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bay)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}
    
                                        <hr style={{ margin: "5px 0" }} />
                                        <p style={{ margin: "0px" }}><b>Lv</b></p>
                                        {groupLvP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Lv)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)} */}
                                    </>
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
                    chkLv = level.find(y => y.Lv === x.Lv)
                if (!chkBank) {
                    bank.push(x)
                }
                if (!chkBay) {
                    bay.push(x)
                }
                if (!chkLv) {
                    level.push(x)
                }
            })
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
                                    return (
                                        <>
                                            <td style={{
                                                padding: padding,
                                                backgroundColor: dataFin ? bgColor(percen) : "black",
                                                border: "1px solid black"
                                            }}></td>
                                            {yi === bay.length - 1 ? <td>{countPalletBank ? (countPalletBank / palletLen * 100).toFixed(3) + "%" : null}</td> : null}
                                            {yi === bay.length - 1 ? <td
                                                style={{
                                                    backgroundColor: bgColor(row),
                                                    textAlign: 'left !important'
                                                    // border: row?"1px solid black":null
                                                }}
                                            >{row && row + clickDesCription(row)}</td> : null}

                                        </>
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
                dataS = level.sort((a, b) => (a.Lv > b.Lv) ? -1 : ((b.Lv > a.Lv) ? 1 : 0)).map((x, xi) => {
                    return (
                        <tr key={xi}>{
                            bay.map((y, yi) => {
                                let dataFil = dataAll.filter(z => { return z.Lv === x.Lv && z.Bay === y.Bay && z.Bank === rowBank && z.bsto_Code })
                                let dataFin = dataAll.find(z => { return z.Lv === x.Lv && z.Bay === y.Bay && z.Bank === rowBank })
                                // wid = 100 / (bay.length + 1) + "%"

                                if (xi === 0 && yi) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{yi}</td>
                                } else if (yi === 0 && xi) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{x.Lv}</td>
                                } else if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>Lv\Bay</td>
                                } else {
                                    let color = dataFil.length ? "#993300" : null,
                                        cssBg = `rgba(210, 105, 30, ${color})`
                                    return (
                                        <td
                                            className="HoverTable"
                                            key={yi}
                                            onClick={(e) => clickData(rowBank, y.Bay, x.Lv, e)}
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
                groupLv = groupBy(pack.sort((a, b) => (a.Lv > b.Lv) ? 1 : ((b.Lv > a.Lv) ? -1 : 0)), "Lv"),
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
                            <p style={{ margin: "0px" }}><b>Lv</b></p>
                            {groupLv.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Lv)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}
                        </CardContent>
                    </Card>
                ) : null

            setDataBank(setBank)
            setOpen({ full: false, bank: true, cell: false })
        }
    }

    const clickData = (selBank, selBay, selLv, e) => {
        let chk
        if (e.currentTarget.style.border.search("black") !== -1 && e.currentTarget.style.backgroundColor && e.currentTarget.style.backgroundColor !== "black") {
            e.currentTarget.style.border = "2px solid Aqua"
            sideTd.push(e.currentTarget)
            chk = true
        }
        else {
            e.currentTarget.style.border = "1px solid black"
            chk = false
        }

        let dataFil = dataAll.filter(z => { return z.Lv === selLv && z.Bay === selBay && z.Bank === selBank && z.bsto_Code })

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
                                <p style={{ margin: "0px" }}><b style={{ color: "red" }}>Location : {x[0].Code} </b></p>
                                <p style={{ margin: "0px" }}><b style={{ color: "red" }}>Pallet : {x[0].bsto_Code}</b></p>
                            </div>
                            {
                                x.map((y, yi) => {
                                    if (y.skut_Code === "ESP") {
                                        return (
                                            <>
                                                {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
                                                {/* <p style={{ margin: "0px" }}><b>Pallet :</b> {y.bsto_Code}</p> */}
                                                <p style={{ margin: "0px" }}><b>Pack Code :</b> {y.psto_Code}</p>
                                                <p style={{ margin: "0px" }}><b>Pack Name :</b> {y.psto_Name}</p>
                                                <p style={{ margin: "0px" }}><b>SKU Type :</b> {y.skut_Code}</p>
                                                <p style={{ margin: "0px" }}><b>Quantity :</b> {y.Quantity} {y.ut_Code}</p>
                                            </>
                                        )
                                    } else {
                                        let lot = y.Lot ? <p style={{ margin: "0px" }}><b>Lot :</b> {y.Lot}</p> :
                                            y.Ref1 ? <p style={{ margin: "0px" }}><b>Vendor Lot :</b> {y.Ref1}</p> : null;
                                        let ControlNo = y.OrderNo ? <p style={{ margin: "0px" }}><b>Control No. :</b> {y.OrderNo}</p> : null;
                                        return (

                                            <>
                                                {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
                                                {/* <p style={{ margin: "0px" }}><b>Pallet :</b> {y.bsto_Code}</p> */}
                                                <p style={{ margin: "0px" }}><b>Pack Code :</b> {y.psto_Code}</p>
                                                <p style={{ margin: "0px" }}><b>Pack Name :</b> {y.psto_Name}</p>
                                                <p style={{ margin: "0px" }}><b>SKU Type :</b> {y.skut_Code}</p>
                                                <p style={{ margin: "0px" }}><b>Weight (kg) :</b> {y.pstoWeigthKG}</p>
                                                {ControlNo}
                                                {lot}
                                                <p style={{ margin: "0px" }}><b>Quantity :</b> {y.Quantity} {y.ut_Code}</p>
                                                <p style={{ margin: "0px" }}><b>MFG.Date :</b> {y.ProductDate ? moment(y.ProductDate).format("DD/MM/YYYY") : ""}</p>
                                                <p style={{ margin: "0px" }}><b>Expire Date :</b> {y.ExpiryDate ? moment(y.ExpiryDate).format("DD/MM/YYYY") : ""}</p>
                                                <p style={{ margin: "0px" }}><b>Quality Status :</b> <AmAuditStatus statusCode={y.AuditStatus} /> </p>
                                            </>
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

    // const editorListcolunm = () => {
    //     if (props.columnEdit !== undefined) {
    //         return props.columnEdit.map((row, i) => {
    //             return {
    //                 "field": row.accessor,
    //                 "component": (data = null, cols, key) => {
    //                     // let rowError = inputError.length ? inputError.some(x => {
    //                     //     return x === row.accessor
    //                     // }) : false
    //                     return <div key={key}>

    //                         {getTypeEditor(row.type, row.Header, row.accessor, data, cols, row, row.idddl, row.queryApi, row.columsddl, row.fieldLabel,
    //                             row.style, row.width, row.validate, row.placeholder, row.TextInputnum, row.texts, row.key, row.data, row.defaultValue, row.disabled, i, rowError, row.required)}

    //                     </div>
    //                 }
    //             }
    //         })
    //     }
    // }
    const onChangeEditor = (field, data, required, row) => {
        if (typeof data === "object" && data) {
            editData[field] = data[field] ? data[field] : data.value
        } else {
            editData[field] = data
        }
        console.log(editData);
        // if(data)
        // if (data === "") {
        //     editData[field] = null
        // }

        // if (addData && Object.keys(editData).length === 0) {
        //     editData["ID"] = addDataID
        // }

        // if (field === "Code") {
        //     setskuID(data.ID);
        // }


        // //if (props.itemNo && addData) {
        // //    if (addDataID === -1) {
        // //        let itemNos = props.defualItemNo
        // //        let itemn = itemNos.toString();
        // //        editData["itemNo"] = itemn
        // //    } else {
        // //        let ItemNoInt = parseInt(props.defualItemNo)
        // //        let itemNos = (ItemNoInt + (dataSource.length))
        // //        let itemn;
        // //        if (itemNos < 10) {
        // //            itemn = ("000" + itemNos);
        // //        } else if (itemNos >= 10 || itemNos < 100) {
        // //            itemn = ("00" + itemNos);
        // //        } else if (itemNos >= 100) {
        // //            itemn = ("0" + itemNos);
        // //        }
        // //        editData["itemNo"] = itemn
        // //    }
        // //}


        // if (typeof data === "object" && data) {
        //         editData[field] = data[field] ? data[field] : data.value
        // }
        // else {
        //     if (data === "") {
        //         editData[field] = null
        //     } else {
        //         editData[field] = data
        //     }
        // }


        // if (row && row.related && row.related.length) {
        //     let indexField = row.related.reduce((obj, x) => {
        //         obj[x] = props.columnEdit.findIndex(y => y.accessor === x)
        //         return obj
        //     }, {})
        //     for (let [key, index] of Object.entries(indexField)) {
        //         if (data) {
        //             if (key === "packID") {
        //                 editData.packID_map_skuID = data.packID + "-" + data.skuID
        //             }
        //             editData[key] = data[key]
        //         } else {
        //             delete editData[key]
        //         }

        //         if (index !== -1) {
        //             if (data) {
        //                 if (ref.current[index].current.value)                           
        //                     ref.current[index].current.value = data[key]
        //             } else {
        //                 //ref.current[index].current.value = ""
        //             }
        //         }
        //     }
        // }

        // if (row && row.removeRelated && row.removeRelated.length && editData.packID_map_skuID && (+editData.packID_map_skuID.split('-')[0] !== +editData.packID || +editData.packID_map_skuID.split('-')[1] !== +editData.skuID)) {
        //     row.removeRelated.forEach(x => delete editData[x])
        // }

        // if (props.createDocType === "audit" || props.createDocType === "counting") {
        //     if (field === 'quantity') {
        //         if (data < 101 && data > 0) {
        //             editData['quantitys'] = data
        //             editData['quantity'] = data + '%'
        //             setEditData(editData)
        //         } else {
        //             setStateDialogErr(true)
        //             setMsgDialog("quantity Not Correct")
        //         }
        //     } else {

        //     }

        // } else {

        //     setEditData(editData)
        // }

        if (required) {
            if (!editData[field]) {
                const arrNew = [...new Set([...inputError, field])]
                setInputError(arrNew)
            } else {
                const arrNew = [...inputError]
                const index = arrNew.indexOf(field);
                if (index > -1) {
                    arrNew.splice(index, 1);
                }
                setInputError(arrNew)
            }
        }
        // console.log(_editData);
        // setEditData(_editData)
    }

    const onHandleEditConfirm = (status, rowdata, inputError) => {
        if (status) {
            console.log(rowdata);
            // let xxx= [...dataSource];
            let url = window.apipath + "/v2/GetSPSearchAPI?" +
                "&area_id=" + rowdata.ID +
                "&spname=STOLOC_PLOTGRAPH"

            rowdata.view && (url += "&view=" + rowdata.view)
            rowdata.select && (url += "&select=" + rowdata.select)
            rowdata.code && (url += "&code=" + rowdata.code)
            rowdata.lot && (url += "&lot=" + rowdata.lot)
            rowdata.batch && (url += "&batch=" + rowdata.batch)
            rowdata.fromExpireDate && (url += "&fromExpireDate=" + rowdata.fromExpireDate)
            rowdata.toExpireDate && (url += "&toExpireDate=" + rowdata.toExpireDate)
            rowdata.fromProductDate && (url += "&fromProductDate=" + rowdata.fromProductDate)
            rowdata.toProductDate && (url += "&toProductDate=" + rowdata.toProductDate)
            rowdata.fromIncubationDay && (url += "&fromIncubationDay=" + rowdata.fromIncubationDay)
            rowdata.toIncubationDay && (url += "&toIncubationDay=" + rowdata.toIncubationDay)

            console.log(url);
            if (!inputError.length) {
                Axios.get(url).then((res) => {
                    console.log(res);
                    // ${rowdata.view && "view=" + rowdata.view}
                    // ${rowdata.select && "select=" + rowdata.select}
                    // ${rowdata.code && "code=" + rowdata.code}
                    // ${rowdata.lot && "lot=" + rowdata.lot}
                    // ${rowdata.batch && "batch=" + rowdata.batch}
                    // ${rowdata.fromExpireDate && "fromExpireDate=" + rowdata.fromExpireDate}
                    // ${rowdata.toExpireDate && "toExpireDate=" + rowdata.toExpireDate}
                    // ${rowdata.fromProductDate && "fromProductDate=" + rowdata.fromProductDate}
                    // ${rowdata.toProductDate && "toProductDate=" + rowdata.toProductDate}
                    // ${rowdata.fromIncubationDay && "fromIncubationDay=" + rowdata.fromIncubationDay}
                    // ${rowdata.toIncubationDay && "toIncubationDay=" + rowdata.toIncubationDay}
                })

                //     let chkEdit = dataSource.find(x => x.ID === rowdata.ID) //Edit
                //     let chkPallet = dataSource.find(x => x.packID === rowdata.packID && x.ID !== rowdata.ID && x.Code === rowdata.Code && x.lot === rowdata.lot && rowdata.unitType === x.unitType)
                //     //let chkSkuNotPallet = dataSource.find(x => x.skuCode === rowdata.skuCode && x.batch === rowdata.batch && x.lot === rowdata.lot && !x.palletcode && x.ID !== rowdata.ID)
                //     let chkSku = dataSource.find(x => x.Code === rowdata.Code && x.lot === rowdata.lot && rowdata.unitType === x.unitType)

                //     if (chkSku && chkEdit === undefined) {
                //         setStateDialogErr(true)
                //         setMsgDialog("มีข้อมูล Item Code นี้แล้ว")
                //         return
                //     }


                //     if (chkEdit) {
                //         for (let key of Object.keys(chkEdit))
                //             delete chkEdit[key]
                //         for (let row in rowdata) {

                //             chkEdit[row] = rowdata[row]
                //         }
                //     } else {     

                //         setAddDataID(addDataID -1);
                //         xxx.push(rowdata)                    


                //     }         
                //     setEditData({})
                //     setInputError([])
                //     setDialog(false)
                //     setDialogItem(false)
                //     setDataSource([...xxx])
            } else {

                setInputError(inputError.map(x => x.accessor))
            }
        } else {

            // setInputError([])
            // setEditData({})
            setToggleModal(false)
            // setDialogItem(false)
        }
    }

    return (
        <>
            <ModalForm
                style={{ width: "600px", height: "500px" }}
                titleText="Search"
                textConfirm="Search"
                open={toggleModal}
                onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError)}
                data={editData}
                objColumnsAndFieldCheck={{ objColumn: columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunm(columnEdit, ref, inputError, editData, onChangeEditor)}
            />

            <Grid
                container
                spacing={1}
                direction="row"
                justify="space-between"
                alignItems="flex-start">
                <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <button className="btn btn-primary" style={{ padding: "1px" }} onClick={() => setToggleModal(true)} >Search</button>
                </Grid>
                <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <FormInline>
                        <Label>View :</Label>
                        <AmDropdown
                            id={"ts"}
                            placeholder="Select"
                            data={dataDD}
                            width={200} //��˹��������ҧ�ͧ��ͧ input
                            ddlMinWidth={200} //��˹��������ҧ�ͧ���ͧ dropdown
                            defaultValue="top"
                            // valueData={valueText} //��� value ������͡
                            onChange={(value, dataObject, inputID, fieldDataKey) =>
                                onChangeEditor("view", dataObject, inputID, fieldDataKey)
                            }
                        // ddlType={"search"}
                        // style={{ padding: "1px", float: "right", marginRight: "2px" }}
                        />
                    </FormInline>
                </Grid>
            </Grid>
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
                            <div style={{ height: (window.innerHeight - 179), overflow: "auto" }}>
                                {dataFull}
                            </div>
                        </Collapse>

                        <ListItem className="listitem" button onClick={() => setOpen({ full: false, bank: !open.bank, cell: false })}>
                            <ListItemText className="listitemtext" primary="Bank" />
                            {open.bank ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.bank} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 179), overflow: "auto" }}>
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
                            <div style={{ height: (window.innerHeight - 179), overflow: "auto" }}>
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
        </>
    )
}

export default AmLocationSummary
