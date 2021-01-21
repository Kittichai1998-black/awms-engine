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
import AmDialogs from '../../components/AmDialogs'
import PageviewRoundedIcon from '@material-ui/icons/PageviewRounded';
import IconButton from "@material-ui/core/IconButton";
import Chip from '@material-ui/core/Chip';
import Dns from '@material-ui/icons/Dns';
import Dashboard from '@material-ui/icons/Dashboard';
import ShoppingCart from '@material-ui/icons/ShoppingCart';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import LayersClear from '@material-ui/icons/LayersClear';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper'
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
const FormInline1 = styled.div`

&::-webkit-scrollbar {
    width: 0.5em;
    height: 0.5em;
   }
 
   &::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,.1);
    border-radius: 3px;
 
    &:hover {
     background: rgba(255,255,255,.2);
    }
   }
`;

const AmLocationSummary = props => {
    const [dialogError, setDialogError] = useState({ isOpen: false, text: "" })
    const [dataTop, setDataTop] = useState()
    const [dataBottom, setDataBottom] = useState()
    const [dataDetail, setDataDetail] = useState([])
    const [dataFull, setDataFull] = useState()
    const [dataBank, setDataBank] = useState()
    const [dataAll, setDataAll] = useState()
    const [titleBottom2, setTitleBottom2] = useState("")
    const [btnClear, setBtnClear] = useState()
    const [titleBottom, setTitleBottom] = useState("Side view")
    const [open, setOpen] = useState({
        full: true,
        bank: false,
        cell: false
    });
    const [editData, setEditData] = useState({ view: "top", warehouse_id: 1, area_id: 1 });
    const [toggleModal, setToggleModal] = useState(false)

    const [inputError, setInputError] = useState([])
    const [textSearch, setTextSearch] = useState()
    const [dataDraw1, setdataDraw1] = useState()
    const [dataDraw2, setdataDraw2] = useState()
    const [refresh, setRefresh] = useState()
    const view_AreaMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2},{"f" : "AreaMasterType_ID", "c" : "=", "v" : 10}]',
        f: "ID as area_id,Name,Code",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    };
    const [areaMaster, setAreaMaster] = useState(view_AreaMaster)
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

    let topTr,
        sideTd = [],
        mergeDatas = [],
        pos_X_1 = [{}],
        pos_Y_1 = [],
        pos_X_2 = [{}],
        pos_Y_2 = []

    const dataDD = [
        { label: "Top view", value: "top" },
        { label: "Front view", value: "front" },
        { label: "Side view", value: "side" }
    ]

    const table_Warehouse = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as warehouse_id,Name,Code",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    }

    const columsFindPopupArea_Warehouse = [
        { Header: "Code", accessor: "Code", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];
    const columnEdit = [
        {
            Header: "Warehouse",
            accessor: "warehouse_id",
            type: "findPopUp",
            required: true,
            fieldLabel: ["Code", "Name"],
            idddl: "warehouse_id",
            queryApi: table_Warehouse,
            columsddl: columsFindPopupArea_Warehouse
        },
        {
            idddl: "area",
            Header: "Area",
            accessor: "area_id",
            type: "findPopUp",
            queryApi: areaMaster,
            fieldLabel: ["Code", "Name"],
            columsddl: columsFindPopupArea_Warehouse,
            required: true
        },
        { Header: "Level", accessor: "select", type: "inputNum", width: '300px' },
        { Header: "Pallet Code", accessor: "code", type: "input", width: '300px' },
        { Header: "Lot", accessor: "lot", type: "input", width: '300px' },
        { Header: "Batch", accessor: "batch", type: "input", width: '300px' },
        { Header: "Order No", accessor: "orderNo", type: "input", width: '300px' },
        { Header: "Expire date from", accessor: "fromExpireDate", type: "date", width: '300px' },
        { Header: "to", accessor: "toExpireDate", type: "date", width: '300px' },
        { Header: "Product date from", accessor: "fromProductDate", type: "date", width: '300px' },
        { Header: "to", accessor: "toProductDate", type: "date", width: '300px' },
        { Header: "Incubation day from", accessor: "fromIncubationDay", type: "inputNum", width: '300px' },
        { Header: "to", accessor: "toIncubationDay", type: "inputNum", width: '300px' },
    ]
    const ref = useRef(columnEdit.map(() => createRef()))

    useEffect(() => {
        Axios.get(createQueryString(locationSummary)).then((res) => {
            if (res.data._result.status && res.data.datas.length)
                setDataAll(res.data.datas)
        })
    }, [refresh])

    useEffect(() => {
        Axios.get(getUrlDrawGraph(editData)).then((res) => {
            if (res.data._result.status && res.data.datas.length)
                setdataDraw1(res.data.datas)
        })
    }, [])

    useEffect(() => {
        if (dataAll) {
            let pack = dataAll.filter(x => x.bsto_Code),
                palletLen = getUnique(pack, "bsto_Code").length,
                palletAll = getUnique(dataAll, "Code").length,
                palletPer = (palletLen / palletAll * 100).toFixed(3),
                groupSKUP = groupBy(pack.sort((a, b) => (a.skut_Code > b.skut_Code) ? 1 : ((b.skut_Code > a.skut_Code) ? -1 : 0)), "skut_Code"),
                groupBankP = groupBy(dataAll.sort((a, b) => (a.Bank > b.Bank) ? 1 : ((b.Bank > a.Bank) ? -1 : 0)), "Bank"),
                setFull = (
                    <Card style={{ margin: "5px" }}>
                        <CardContent style={{ padding: "5px", backgroundColor: "#cfd3ce" }}>
                            <Chip
                                icon={<Dns />}
                                label="Used Location"
                                style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                            />
                            <br />

                            <p style={{ margin: "0px" }}>Pallet : {palletLen}/{palletAll} {`(${palletPer}%)`}</p>
                            <p style={{ margin: "0px" }}>Pack : {pack.length}</p>
                            {groupSKUP.length ? (
                                <>
                                    <hr style={{ margin: "5px 0" }} />
                                    <Chip
                                        icon={<ShoppingCart />}
                                        label="SKU Type"
                                        style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                                    />
                                    {groupSKUP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{x[0].skut_Code} : {getUnique(x, "bsto_Code").length} Pallet {"(" + x.length + " Pack)"}</p>)}
                                </>
                            ) : null}

                            {pack.length ? (
                                <>
                                    <hr style={{ margin: "5px 0" }} />
                                    <Chip
                                        icon={<Dashboard />}
                                        label="Bank"
                                        style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                                    />
                                    {groupBankP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bank)} : {getUnique(x.filter(y => y.bsto_Code), "bsto_Code").length} Pallet  {x.filter(y => y.bsto_Code).length ? "(" + x.filter(y => y.bsto_Code).length + " Pack)" : null}</p>)}

                                </>
                            ) : null}
                        </CardContent>
                    </Card>
                )
            setDataFull(setFull)
        }
    }, [dataAll])

    useEffect(() => {
        if (dataDraw1) {
            let title, sort_Y
            switch (editData.view) {
                case 'top': setTitleBottom("Side view"); title = "Bank / Bay"; sort_Y = 'asc'; break;
                case 'front': setTitleBottom("Top view"); title = "Lv / Bank"; sort_Y = 'desc'; break;
                case 'side': setTitleBottom("Top view"); title = "Lv / Bay"; sort_Y = 'desc'; break;
            }

            dataDraw1.map(x => {
                let chk_X = pos_X_1.find(y => y.Pos_X === x.Pos_X),
                    chk_Y = pos_Y_1.find(y => y.Pos_Y === x.Pos_Y)
                !chk_X && pos_X_1.push(x)
                !chk_Y && pos_Y_1.push(x)
            })
            pos_Y_1.sort((a, b) => sort_Y === "asc" ? ((a.Pos_Y > b.Pos_Y) ? 1 : -1) : ((a.Pos_Y < b.Pos_Y) ? 1 : -1)).unshift({})

            let percenXHeader = (pos_X_1.length - 1) * 0.1,
                padding = "5px",
                dataT = pos_Y_1.map((y, yi) => {
                    let percenLast = 0
                    return (
                        <tr className="HoverTable" onClick={(e) => clickRow(y.Pos_Y, e)} key={yi}>{
                            pos_X_1.map((x, xi) => {
                                // let dataFil = groupBy(dataAll.filter(z => { return z.Bank === x.Bank && z.Bay === y.Bay && z.bsto_Code }), "bsto_Code")
                                let dataFin = dataDraw1.find(z => { return z.Pos_X === x.Pos_X && z.Pos_Y === y.Pos_Y })

                                if (yi === 0 && xi === 0) {
                                    return <td key={yi} style={{ fontSize: "8px", textAlign: "center" }}>{title}</td>
                                } else if (yi === 0 && xi && xi % percenXHeader === 0 && percenXHeader % 1 === 0) { // header แกน x แบ่ง 10 เปอเซ็นลงตัว
                                    return <td colSpan={percenXHeader} key={xi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{xi}</td>
                                } else if (yi === 0 && xi && xi % percenXHeader !== 0 && percenXHeader % 1 !== 0) { // header แกน x แบ่ง 10 เปอเซ็นไม่ลงตัว
                                    return <td key={xi} style={{ fontSize: "8px", textAlign: "center", borderLeft: "1px solid black", borderRight: "1px solid black" }}>{xi}</td>
                                } else if (xi === 0 && yi) { // header แกน y
                                    return <td key={xi} style={{ fontSize: "8px", textAlign: "center" }}>{y.Pos_Y}</td>
                                }
                                else if (yi && xi) {
                                    dataFin && (percenLast += dataFin.Density_AVG)
                                    let row
                                    switch (yi) {
                                        case 1:
                                            row = 25; break
                                        case 2:
                                            row = 50; break
                                        case 3:
                                            row = 75; break
                                        case 4:
                                            row = 100; break
                                    }
                                    return (
                                        <>
                                            <td style={{
                                                padding: padding,
                                                backgroundColor: dataFin ? bgColor(dataFin.Density_AVG) : "black",
                                                border: "1px solid black"
                                            }}></td>
                                            {xi === pos_X_1.length - 1 ? <td>{percenLast ? (percenLast / pos_X_1.length - 1).toFixed(3) + "%" : null}</td> : null}
                                            {/* {xi === pos_X_1.length - 1 ? <td
                                                style={{
                                                    backgroundColor: bgColor(row),
                                                    textAlign: 'left !important'
                                                }}
                                            // >{row && clickDesCription(row)}</td> : null}
                                            >{row && clickDesCription(row)}</td> : null} */}
                                        </>
                                    )
                                }
                            })
                        }</tr>
                    )
                })
            setDataTop(dataT)
        }
    }, [dataDraw1])

    useEffect(() => {
        if (dataDraw2) {
            let title, sort_Y, selectText
            switch (editData.view) {
                case 'top': setTitleBottom("Side view"); title = "Lv / Bay"; sort_Y = 'desc'; selectText = "Bank"; break;
                case 'front': setTitleBottom("Top view"); title = "Bank / Bay"; sort_Y = 'asc'; selectText = "Lv"; break;
                case 'side': setTitleBottom("Top view"); title = "Bank / Bay"; sort_Y = 'asc'; selectText = "Lv"; break;
            }

            dataDraw2[0].map(x => {
                let chk_X = pos_X_2.find(y => y.Pos_X === x.Pos_X),
                    chk_Y = pos_Y_2.find(y => y.Pos_Y === x.Pos_Y)
                !chk_X && pos_X_2.push(x)
                !chk_Y && pos_Y_2.push(x)
            })

            pos_Y_2.sort((a, b) => sort_Y === "asc" ? ((a.Pos_Y > b.Pos_Y) ? 1 : -1) : ((a.Pos_Y < b.Pos_Y) ? 1 : -1)).unshift({})

            let padding = "5px",
                dataB = pos_Y_2.map((y, yi) => {
                    return (
                        <tr key={yi}>{
                            pos_X_2.map((x, xi) => {
                                let dataFin = dataDraw2[0].find(z => { return z.Pos_X === x.Pos_X && z.Pos_Y === y.Pos_Y && z.Density_AVG })
                                if (yi === 0 && xi) {
                                    return <td key={xi} style={{ fontSize: "8px", textAlign: "center" }}>{xi}</td>
                                } else if (xi === 0 && yi) {
                                    return <td key={xi} style={{ fontSize: "8px", textAlign: "center" }}>{y.Pos_Y}</td>
                                } else if (xi === 0 && yi === 0) {
                                    return <td key={xi} style={{ fontSize: "8px", textAlign: "center" }}>{title}</td>
                                } else {
                                    return (
                                        <td
                                            className="HoverTable"
                                            key={yi}
                                            onClick={(e) => clickData(x.Pos_X, y.Pos_Y, dataDraw2[1], selectText, e)}
                                            style={{
                                                padding: padding,
                                                backgroundColor: dataFin ? "#993300" : null,
                                                border: "1px solid black"
                                            }}></td>
                                    )
                                }
                            })
                        }</tr>
                    )
                })
            setTitleBottom2(selectText + " " + parseInt(dataDraw2[1]))
            setDataBottom(dataB)
            setBtnClear()

            let pack = dataAll.filter(x => x.bsto_Code && x.Bank === dataDraw2[1]),
                groupSKUP = groupBy(pack.sort((a, b) => (a.skut_Code > b.skut_Code) ? 1 : ((b.skut_Code > a.skut_Code) ? -1 : 0)), "skut_Code"),
                groupBay = groupBy(pack.sort((a, b) => (a.Bay > b.Bay) ? 1 : ((b.Bay > a.Bay) ? -1 : 0)), "Bay"),
                groupLv = groupBy(pack.sort((a, b) => (a.Lv > b.Lv) ? 1 : ((b.Lv > a.Lv) ? -1 : 0)), "Lv"),
                setBank = pack.length ? (
                    <Card style={{ margin: "5px" }}>
                        <CardContent style={{ padding: "5px", backgroundColor: "#cfd3ce" }}>
                            <Chip
                                label={"Bank " + parseInt(dataDraw2[1])}
                                style={{ width: "100%", backgroundColor: "#c6b497" }}
                            />

                            <hr style={{ margin: "5px 0" }} />
                            <Chip
                                icon={<ShoppingCart />}
                                label="SKU Type"
                                style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                            />
                            {groupSKUP.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{x[0].skut_Code} : {getUnique(x, "bsto_Code").length} Pallet {"(" + x.length + " Pack)"}</p>)}

                            <hr style={{ margin: "5px 0" }} />
                            <Chip
                                icon={<Dashboard />}
                                label="Bay"
                                style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                            />
                            {groupBay.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Bay)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}

                            <hr style={{ margin: "5px 0" }} />
                            <Chip
                                icon={<Dashboard />}
                                label="Level"
                                style={{ backgroundColor: "#839b97", marginBottom: "10px" }}
                            />
                            {groupLv.map((x, xi) => <p key={xi} style={{ margin: "0px" }}>{parseInt(x[0].Lv)} : {getUnique(x, "bsto_Code").length} Pallet  {"(" + x.length + " Pack)"}</p>)}
                        </CardContent>
                    </Card >
                ) : null

            setDataBank(setBank)
            setOpen({ full: false, bank: true, cell: false })
        }
    }, [dataDraw2])

    const clickDesCription = (row) => {
        if (row == 25) {
            return "<= 25"
        } else if (row == 50) {
            return "<= 50"
        } else if (row == 75) {
            return "<= 75"
        } else if (row == 100) {
            return "> 75"
        } else {
            return null
        }
    }
    const clickRow = (bank_lv, e) => {
        if (bank_lv) {
            let viewB
            const _editData = { ...editData }
            switch (editData.view) {
                case 'top': viewB = 'side'; _editData.bank = bank_lv; delete _editData.select; break;
                case 'front': viewB = 'top'; _editData.select = bank_lv; delete _editData.bank; break;
                case 'side': viewB = 'top'; _editData.select = bank_lv; delete _editData.bank; break;
            }
            _editData.view = viewB

            if (topTr) {
                topTr.classList.remove("active");
            }
            sideTd.forEach(x => {
                x.style.border = "1px solid black"
            })
            sideTd.length = 0

            setDataDetail([])
            mergeDatas.length = 0
            e.currentTarget.classList.add("active");
            topTr = e.currentTarget

            Axios.get(getUrlDrawGraph(_editData)).then((res) => {
                if (res.data._result.status && res.data.datas.length) {
                    setdataDraw2([res.data.datas, bank_lv])
                }

            })
        }
    }

    const clickData = (po_x, po_y, bank_lv, textSelectRow, e) => {
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

        let bank, bay, lv
        switch (textSelectRow) {
            case "Bank": bank = bank_lv; bay = po_x; lv = po_y; break;
            case "Lv": bank = po_y; bay = po_x; lv = bank_lv; break;
        }
        let dataFil = dataAll.filter(z => { return z.Lv === lv && z.Bay === bay && z.Bank === bank && z.bsto_Code })

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
                    <Card key={xi} style={{ margin: "5px" }}>
                        <CardContent style={{ padding: "5px", backgroundColor: "#cfd3ce" }}>
                            <div style={{ textAlign: "center" }}>
                                <Chip
                                    label={"Location : " + x[0].Code}
                                    style={{ width: "100%", backgroundColor: "#c6b497", marginBottom: "2px" }}
                                />
                                <Chip
                                    label={"Pallet : " + x[0].bsto_Code}
                                    style={{ width: "100%", backgroundColor: "#c6b497", marginBottom: "5px" }}
                                />
                            </div>
                            {
                                x.map((y, yi) => {
                                    if (y.skut_Code === "ESP") {
                                        return (
                                            <>
                                                {yi > 0 ? <hr style={{ margin: "5px 0" }} /> : null}
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
                )
        })

        if (dataD.length) {
            //setBtnClear(<button className="btn btn-danger" style={{ padding: "1px", marginLeft: "10px" }} onClick={clickClear}>Clear</button>)
            setBtnClear(<Tooltip title="Clear">
                <IconButton
                    size="large"
                    aria-label="info"
                    style={{
                        padding: "1px",
                        marginRight: "2px",
                        float: "right"

                    }}
                ><LayersClear
                        fontSize="large"
                        onClick={clickClear} />
                </IconButton>
            </Tooltip>
            )


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

    const onChangeEditor = (field, data, required, row) => {
        if (typeof data === "object" && data) {

            editData[field] = data[field] ? data[field] : data.value
            editData[field + "_show"] = `${data.Code} : ${data.Name}`
            editData[field + "_header"] = row.Header
        } else if (data) {
            editData[field] = data
            editData[field + "_header"] = row.Header
        } else {
            delete editData[field]
            delete editData[field + "_show"]
            delete editData[field + "_header"]
        }

        if (field === "warehouse_id" && data) {
            let q_view_AreaMaster = JSON.parse(view_AreaMaster.q)
            q_view_AreaMaster.push({ "f": "Warehouse_ID", "c": "=", "v": data.warehouse_id })
            view_AreaMaster.q = JSON.stringify(q_view_AreaMaster)
            setAreaMaster(view_AreaMaster)
        }

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

    }

    const getUrlDrawGraph = (datas) => {
        let url = window.apipath + "/v2/GetSPSearchAPI?" +
            "&warehouse_id=" + datas.warehouse_id +
            "&area_id=" + datas.area_id +
            "&spname=STOLOC_PLOTGRAPH"
        datas.view && (url += "&view=" + datas.view)
        datas.bank && (url += "&bank=" + datas.bank)
        datas.select && (url += "&select=" + datas.select)
        datas.code && (url += "&code=" + datas.code)
        datas.lot && (url += "&lot=" + datas.lot)
        datas.batch && (url += "&batch=" + datas.batch)
        datas.fromExpireDate && (url += "&fromExpireDate=" + datas.fromExpireDate)
        datas.toExpireDate && (url += "&toExpireDate=" + datas.toExpireDate)
        datas.fromProductDate && (url += "&fromProductDate=" + datas.fromProductDate)
        datas.toProductDate && (url += "&toProductDate=" + datas.toProductDate)
        datas.fromIncubationDay && (url += "&fromIncubationDay=" + datas.fromIncubationDay)
        datas.toIncubationDay && (url += "&toIncubationDay=" + datas.toIncubationDay)
        return url
    }

    const onHandleEditConfirm = (status, rowdata, inputErr) => {
        if (status) {
            if (!inputErr.length) {
                Axios.get(getUrlDrawGraph(rowdata)).then((res) => {
                    if (res.data._result.status) {
                        if (!res.data.datas.length) {
                            setDialogError({ isOpen: true, text: "ไม่พบข้อมูล" })
                            return
                        }
                        setRefresh({})
                        setOpen({ bank: false, full: true, cell: false })
                        setBtnClear()
                        setTitleBottom2("")
                        setToggleModal(false)

                        setdataDraw1(res.data.datas)

                        let ele = (
                            <div style={{ marginTop: "8px" }}>
                                {rowdata.warehouse_id && <label><b>{rowdata.warehouse_id_header} :</b> {rowdata.warehouse_id_show} </label>}
                                {rowdata.area_id && <label><b>{rowdata.area_id_header} :</b> {rowdata.area_id_show} </label>}
                                {rowdata.select && <label><b>{rowdata.select_header} :</b> {rowdata.select} </label>}
                                {rowdata.code && <label><b>{rowdata.code_header} :</b> {rowdata.code} </label>}
                                {rowdata.lot && <label><b>{rowdata.lot_header} :</b> {rowdata.lot} </label>}
                                {rowdata.batch && <label><b>{rowdata.batch_header} :</b> {rowdata.batch} </label>}
                                {rowdata.fromExpireDate && <label><b>{rowdata.fromExpireDate_header} :</b> {rowdata.fromExpireDate} </label>}
                                {rowdata.toExpireDate && <label><b>{rowdata.toExpireDate_header} :</b> {rowdata.toExpireDate} </label>}
                                {rowdata.fromProductDate && <label><b>{rowdata.fromProductDate_header} :</b> {rowdata.fromProductDate} </label>}
                                {rowdata.toProductDate && <label><b>{rowdata.toProductDate_header} :</b> {rowdata.toProductDate} </label>}
                                {rowdata.fromIncubationDay && <label><b>{rowdata.fromIncubationDay_header} :</b> {rowdata.fromIncubationDay} </label>}
                                {rowdata.toIncubationDay && <label><b>{rowdata.toIncubationDay_header} :</b> {rowdata.toIncubationDay} </label>}
                            </div>
                        )
                        setTextSearch(ele)
                    } else {
                        setDialogError({ isOpen: true, text: res.data._result.message })
                    }
                })
            } else {
                setInputError(inputErr.map(x => x.accessor))
            }
        } else {
            setToggleModal(false)
        }
    }

    return (
        <>
            <AmDialogs typePopup={"eror"} content={dialogError.text} onAccept={(e) => { setDialogError({ ...dialogError, isOpen: e }) }} open={dialogError.isOpen}></AmDialogs >
            <ModalForm
                style={{ width: "600px", height: "500px" }}
                titleText="Search"
                textConfirm="Search"
                open={toggleModal}
                onAccept={(status, rowdata, inputErr) => onHandleEditConfirm(status, rowdata, inputErr)}
                data={editData}
                objColumnsAndFieldCheck={{ objColumn: columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunm(columnEdit, ref, inputError, editData, onChangeEditor)}
            />
            <Grid container >
                <Grid item xs={8} >
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Grid container >
                            <Grid item xs={1} style={{ textAlign: "center" }}>
                                <Tooltip title="search">
                                    <IconButton
                                        size="large"
                                        aria-label="info"
                                        style={{
                                            padding: "1px",
                                            marginRight: "2px",
                                        }}
                                    ><PageviewRoundedIcon
                                            fontSize="large"
                                            onClick={() => setToggleModal(true)} />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                            <Grid item xs={11}>
                                <div className="scrollbar" id="style-1" style={{ marginBottom: "5px" }}>
                                    <Paper style={{
                                        textAlign: "center",
                                        overflow: "auto",
                                        whiteSpace: "nowrap",
                                        width: "100%", height: "40px",
                                        textAlign: "center",
                                        backgroundColor: "#c6b497"
                                    }}>
                                        {textSearch}
                                    </Paper>
                                </div>
                            </Grid>
                        </Grid>
                        <Tooltip title="<=25">
                            <FiberManualRecord style={{ color: "#00ff00" }} />
                        </Tooltip>
                        <Tooltip title="<=50">
                            <FiberManualRecord style={{ color: "yellow" }} />
                        </Tooltip>
                        <Tooltip title="<= 75">
                            <FiberManualRecord style={{ color: "orange" }} />
                        </Tooltip>
                        <Tooltip title="> 75">
                            <FiberManualRecord style={{ color: "red" }} />
                        </Tooltip>
                        <FormInline style={{ float: "right" }}>
                            <Label>{"Select mode : "}</Label>
                            <AmDropdown
                                id={"view"}
                                placeholder="Select"
                                data={dataDD}
                                width={120}
                                ddlMinWidth={120}
                                defaultValue="top"
                                // returnDefaultValue={true}
                                // valueData={valueText}
                                onChange={(value, dataObject, inputID, fieldDataKey) => {
                                    let active = document.getElementsByClassName('HoverTable active')
                                    active.length && active[0].classList.remove("active")
                                    if (dataObject)
                                        editData.view = dataObject.value
                                    Axios.get(getUrlDrawGraph(editData)).then((res) => {
                                        if (res.data._result.status && res.data.datas.length) {
                                            setRefresh({})
                                            setDataBottom()
                                            setOpen({ bank: false, full: true, cell: false })
                                            setBtnClear()
                                            setTitleBottom2("")
                                            setdataDraw1(res.data.datas)
                                        }
                                    })
                                }}
                            />
                        </FormInline>
                        <div id={"divTableTopView"} style={{ height: '50%', marginTop: "10px" }}>
                            <table style={{
                                marginLeft: "auto",
                                marginRight: "auto"
                            }}>
                                <tbody >
                                    {dataTop}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} style={{ marginTop: '5px' }}>

                        {/* <b style={{ fontSize: "20px" }}>{titleBottom + " " + titleBottom2}</b> */}
                        <Chip
                            label={titleBottom + " " + titleBottom2}
                            style={{ fontSize: "16px", width: "100%", backgroundColor: "#c6b497" }}
                        />
                        {btnClear}
                        <div id={"divTableSideView"} style={{ height: '50%', textAlign: "center" }}>
                            <table style={{
                                marginLeft: "auto",
                                marginRight: "auto"
                            }} >
                                < tbody >
                                    {dataBottom}
                                </tbody>
                            </table>
                        </div>
                    </Grid>
                </Grid>
                <Grid item xs={4} style={{ backgroundColor: "#839b97" }}>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        className="list"

                    >
                        <ListItem style={{ backgroundColor: "#cfd3ce", fontWeight: "bold" }} className="listitem" button onClick={() => setOpen({ bank: false, full: !open.full, cell: false })} >
                            <ListItemText className="listitemtext" primary="Full" />
                            {open.full ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.full} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 196), overflow: "auto" }}>
                                {dataFull}
                            </div>
                        </Collapse>

                        <ListItem style={{ backgroundColor: "#cfd3ce" }} className="listitem" button onClick={() => setOpen({ full: false, bank: !open.bank, cell: false })}>
                            <ListItemText className="listitemtext" primary="Bank" />
                            {open.bank ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.bank} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 196), overflow: "auto" }}>
                                {dataBank}
                            </div>
                        </Collapse>

                        <ListItem style={{ backgroundColor: "#cfd3ce" }} className="listitem" button onClick={() => setOpen({ bank: false, full: false, cell: !open.cell })}>
                            {/* <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon>*/}
                            <ListItemText className="listitemtext" primary="Cell" />
                            {open.cell ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open.cell} timeout="auto" unmountOnExit>
                            <div style={{ height: (window.innerHeight - 196), overflow: "auto" }}>
                                {dataDetail}
                            </div>
                        </Collapse>
                    </List>
                </Grid>
            </Grid>


        </>
    )
}

export default AmLocationSummary
