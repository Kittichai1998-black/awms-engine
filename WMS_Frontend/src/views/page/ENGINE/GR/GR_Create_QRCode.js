// import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import React, { useState, createRef, useRef, useMemo, useEffect } from 'react'

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
// import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
// import CardActions from '@material-ui/core/CardActions';
// import Collapse from '@material-ui/core/Collapse';
// import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
// import Typography from '@material-ui/core/Typography';
// import { red } from '@material-ui/core/colors';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import ShareIcon from '@material-ui/icons/Share';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import AmButton from '../../../../components/AmButton'
import AmDialogs from '../../../../components/AmDialogs'
import AmInput from '../../../../components/AmInput'
import { apicall } from '../../../../components/function/CoreFunction'
import { editorListcolunm } from '../../../../components/table/AmGennarateFormForEditorTable'
import ModalForm from '../../../../components/table/AmEditorTable'
import styled from 'styled-components'
import AmDialogConfirm from '../../../../components/AmDialogConfirm'
// import useSwitch from '../../../../components/Hook/useSwitch'

const axios = new apicall()

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
// @media (max-width: 800px) {
//     flex-direction: column;
//     align-items: stretch;

//   }
`;

export default () => {
    const [qrcode, setqrcode] = useState()
    const [toggleModal, setToggleModal] = useState(false)
    const [editData, setEditData] = useState([]);
    const [inputError, setInputError] = useState([])
    const [dialogError, setDialogError] = useState({ isOpen: false, text: "" })
    const [dialogSuccess, setDialogSuccess] = useState({ isOpen: false, text: "" })
    const [dialogConfirmClose, setDialogConfirmClose] = useState(false)
    // const [menuIsOpen, openMenu, closeMenu] = useSwitch()
    const [anchorEl, setAnchorEl] = useState()
    const [card, setCard] = useState([])
    const inputScan = useRef()
    const [dataModal, setDataModal] = useState({})
    const [GR, setGR] = useState()

    useEffect(() => {
        inputScan.current.focus()
    }, [])

    const table_Warehouse = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as warehouse_id,Name,Code as warehouse",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    }
    const table_Customer = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as customer_id,Name,Code as customer",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'asc' }]",
        sk: 0,
        l: 100,
        all: ""
    }
    const view_SKUMaster = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "ID as sku_id,Name,Code as sku,UnitTypeCode as unit",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const columsFindPopup_Customer = [
        { Header: "Code", accessor: "customer", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];
    const columsFindPopup_Warehouse = [
        { Header: "Code", accessor: "warehouse", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
    ];
    const columsFindPopup_SKU = [
        { Header: "Code", accessor: "sku", fixed: "left", width: 110, sortable: true },
        { Header: "Name", accessor: "Name", width: 250, sortable: true },
        { Header: "Unit Type", accessor: "unit", width: 250, sortable: true },
    ];

    const columnEdit = [

        { Header: "Bagging Order", accessor: "doc_wms", type: "input", width: '300px', required: true },
        {
            Header: "Customer",
            accessor: "customer_id",
            type: "findPopUp",
            required: true,
            // fieldDataKey: "warehouse",
            fieldLabel: ["customer", "Name"],
            idddl: "customer",
            queryApi: table_Customer,
            // defaultValue: 1,
            columsddl: columsFindPopup_Customer,
            related: ["customer"],
            removeRelated: ["customer"]
        },
        {
            Header: "SKU",
            accessor: "sku_id",
            type: "findPopUp",
            required: true,
            // fieldDataKey: "warehouse",
            fieldLabel: ["sku", "Name"],
            idddl: "sku",
            queryApi: view_SKUMaster,
            // defaultValue: 1,
            columsddl: columsFindPopup_SKU,
            related: ["unit", "sku"],
            removeRelated: ["unit", "sku"]
        },
        { Header: "Unit Type", accessor: "unit", type: "text", width: '300px' },
        { Header: "Grade", accessor: "grade", type: "input", width: '300px', required: true },
        { Header: "Lot", accessor: "lot", type: "input", width: '300px', required: true },
        { Header: "Start Pallet", accessor: "start_pallet", type: "inputNum", width: '300px', required: true },
        { Header: "End Pallet", accessor: "end_pallet", type: "inputNum", width: '300px', required: true },
        {
            Header: "Warehouse",
            accessor: "warehouse_id",
            type: "findPopUp",
            required: true,
            // fieldDataKey: "warehouse",
            fieldLabel: ["warehouse", "Name"],
            idddl: "warehouse",
            queryApi: table_Warehouse,
            defaultValue: 1,
            columsddl: columsFindPopup_Warehouse,
            related: ["warehouse"],
            removeRelated: ["warehouse"]
        },
        { Header: "Qty", accessor: "qty", type: "inputNum", width: '300px', required: true },
        { Header: "Qty Per Pallet", accessor: "qty_per_pallet", type: "inputNum", width: '300px', required: true },
        { Header: "Storage Status", accessor: "status", type: "input", width: '300px', required: true },

    ]

    const ref = useRef(columnEdit.map(() => createRef()))

    const generateRandom = (length) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const onScan = (datas) => {
        if (datas && datas.split("|").length === 11) {
            const _editData = {
                doc_wms: datas.split("|")[0].trim(),
                customer: datas.split("|")[1].trim(),
                grade: datas.split("|")[2].trim(),
                sku: datas.split("|")[3].trim(),
                lot: datas.split("|")[4].trim(),
                start_pallet: +datas.split("|")[5].substr(0, 4).trim(),
                end_pallet: +datas.split("|")[5].substr(4, 4).trim(),
                warehouse: datas.split("|")[6].trim(),
                qty: datas.split("|")[7].trim(),
                unit: datas.split("|")[8].trim(),
                qty_per_pallet: datas.split("|")[9].trim(),
                status: datas.split("|")[10].trim(),
                api_ref: generateRandom(10)
            }

            // axios.post(window.apipath + "/v2/revieve_order/", _editData).then(res => {
            //     console.log(res);
            // })


            _editData.doc_wcs = "GR" + Math.floor(Math.random() * 100)
            editData.push(_editData)
            console.log(editData);

            // const newDatas = Object.assign(_editData, res);


            // generateCard(_editData)
            // setEditData(newDatas)
            setCard([...card, generateCard(_editData)])

        } else {
            setDialogError({ isOpen: true, text: "รูปแบบข้อมูลไม่ถูกต้อง" })
        }
    }

    const onUpdate = () => {
        let req = editData.find(x => x.doc_wcs === GR)
        req.doc_wcs = "GR2101000008"
        axios.post(window.apipath + "/v2/UpdateOptionsDocumentByCodeAPI/", req).then(res => {
            if (res.data._result.status) {
                setDialogSuccess({ isOpen: true, text: "แก้ไขข้อมูลเรียบร้อย" })
            } else {
                setDialogError({ isOpen: true, text: res.data._result.message })
            }
        })
    }

    const onConfirmClose = () => {
        let req = editData.find(x => x.doc_wcs === GR)
        req.doc_wcs = "GR2101000008"
        axios.post(window.apipath + "/v2/CloseGRAPI/", req).then(res => {
            if (res.data._result.status) {
                setDialogSuccess({ isOpen: true, text: "แก้ไขข้อมูลเรียบร้อย" })
            } else {
                setDialogError({ isOpen: true, text: res.data._result.message })
            }
        })
    }



    const onChangeEditor = (field, data, required, row) => {
        if (typeof data === "object" && data) {
            dataModal[field] = data[field] ? data[field] : data.value
        } else if (data) {
            dataModal[field] = data
        } else {
            delete dataModal[field]
        }

        if (row && row.related && row.related.length) {
            let indexField = row.related.reduce((obj, x) => {
                obj[x] = columnEdit.findIndex(y => y.accessor === x)
                return obj
            }, {})
            for (let [key, index] of Object.entries(indexField)) {
                if (data) {
                    // if (key === "packID") {
                    //     editData.packID_map_skuID = data.packID + "-" + data.skuID
                    // }
                    dataModal[key] = data[key]
                } else {
                    delete dataModal[key]
                }

                if (index !== -1) {
                    if (data) {
                        if (ref.current[index].current.value)
                            ref.current[index].current.value = data[key]
                    } else {
                        //ref.current[index].current.value = ""
                    }
                }
            }
        }
        if (row && row.removeRelated && row.removeRelated.length && dataModal.packID_map_skuID && (+dataModal.packID_map_skuID.split('-')[0] !== +dataModal.packID || +dataModal.packID_map_skuID.split('-')[1] !== +dataModal.skuID)) {
            row.removeRelated.forEach(x => delete dataModal[x])
        }

        if (required) {
            // console.log(required);
            if (!dataModal[field]) {
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

    const onHandleEditConfirm = (status, rowdata, inputErr) => {
        if (status) {
            if (!inputErr.length) {
                const arr = []
                arr.push(rowdata.doc_wms)
                arr.push(rowdata.customer)
                arr.push(rowdata.grade)
                arr.push(rowdata.sku)
                arr.push(rowdata.lot)
                arr.push(("000" + rowdata.start_pallet).slice(-4) + ("000" + rowdata.end_pallet).slice(-4))
                arr.push(rowdata.warehouse)
                arr.push(rowdata.qty)
                arr.push(rowdata.unit)
                arr.push(rowdata.qty_per_pallet)
                arr.push(rowdata.status)
                onScan(arr.join("|"))
                setToggleModal(false)
            } else {
                setInputError(inputErr.map(x => x.accessor))
            }
        } else {
            setToggleModal(false)
        }
    }

    const generateCard = (datas) => {
        let _card = (
            // <Box
            //     boxShadow={2}
            //     p={2}
            //     style={{ borderRadius: "5px", margin: "0 5px 0 5px", backgroundColor: "#F5F5F5", width: "97%" }}
            // >
            //     <Grid
            //         container
            //         direction="row"
            //         justify="center"
            //         alignItems="flex-start"
            //         spacing={2}
            //     >
            //         <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            //             <label style={{ fontWeight: "bold", }}>{datas.doc_wcs}</label>
            //         </Grid>
            //         <Grid item xs={6} sm={8} md={8} lg={8} xl={10}>

            //         </Grid>

            //     </Grid>
            // </Box>
            <Card style={{ width: "97%", marginTop: "10px" }}>
                <CardHeader
                    title={datas.doc_wcs}
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon onClick={(e) => {
                                setAnchorEl(e.currentTarget)
                                setGR(datas.doc_wcs)
                            }
                            } />
                        </IconButton>
                    }

                />
                <CardContent>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                    // spacing={2}
                    >
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>SKU : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{datas.sku}</label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Lot : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{datas.lot}</label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Grade : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{datas.grade}</label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Pallet No. : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{datas.start_pallet + " - " + datas.end_pallet}</label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Putaway : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{"50/100"}</label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", paddingRight: "5px" }}>Qty/pallet : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label>{`${datas.qty_per_pallet} ${datas.unit}`}</label>
                        </Grid>
                        {/* <Grid item xs={6} sm={8} md={8} lg={8} xl={10}>

                        </Grid> */}
                    </Grid>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                    // spacing={2}
                    >
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", padding: "5px 5px 5px 0" }}>Pallet : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <AmInput
                                style={{ width: "100%", verticalAlign: "middle" }}
                                type="number"
                                // required={required}
                                // error={rowError}
                                // helperText={inputError.length ? "required field" : false}
                                // inputRef={ref.current[index]}
                                // defaultValue={editData[accessor] ? editData[accessor] : ""}
                                // validate={true}
                                // msgError="Error"
                                // regExp={validate ? validate : ""}
                                onChange={(value) => {
                                    let _editData = editData.find(x => x.doc_wcs === datas.doc_wcs)
                                    _editData.pallet = value
                                }}
                            // onKeyPress={(value) => setqrcode(value)}
                            />
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <label style={{ fontWeight: "bold", float: "right", padding: "5px 5px 5px 0" }}>Last : </label>
                        </Grid>
                        <Grid item xs={3} sm={2} md={2} lg={1} xl={1}>
                            <AmInput
                                style={{ width: "100%", verticalAlign: "middle" }}
                                type="number"
                                // required={required}
                                // error={rowError}
                                // helperText={inputError.length ? "required field" : false}
                                // inputRef={ref.current[index]}
                                // defaultValue={editData[accessor] ? editData[accessor] : ""}
                                // validate={true}
                                // msgError="Error"
                                // regExp={validate ? validate : ""}
                                onChange={(value) => {
                                    let _editData = editData.find(x => x.doc_wcs === datas.doc_wcs)
                                    _editData.lastPallet = value
                                }}
                            // onKeyPress={(value) => setqrcode(value)}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>
        )
        return _card
    }

    return (
        <>
            <Menu
                // id="simple-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl()}
            >
                <MenuItem onClick={() => { onUpdate(); setAnchorEl(); }}>Update</MenuItem>
                <MenuItem onClick={() => { setDialogConfirmClose(true); setAnchorEl() }}>Close</MenuItem>
                <MenuItem onClick={() => setAnchorEl()}>Delete</MenuItem>
            </Menu>
            <AmDialogConfirm
                titleDialog={"Confirm Close"}
                open={dialogConfirmClose}
                close={e => setDialogConfirmClose(e)}
                bodyDialog={<>
                    {/* <label>Change  DesCustomer</label>
                    <FormInline><label>Confirm Clare SKUItem</label></FormInline> */}
                </>}
                //styleDialog={{ width: "1500px", height: "500px" }}
                customAcceptBtn={<AmButton styleType="confirm_clear" onClick={() => { onConfirmClose() }}>OK</AmButton>}
                customCancelBtn={<AmButton styleType="delete_clear" onClick={() => setDialogConfirmClose(false)}>Cancel</AmButton>}
            />
            <AmDialogs typePopup={"success"} content={dialogSuccess.text} onAccept={(e) => { setDialogError({ ...dialogSuccess, isOpen: e }) }} open={dialogSuccess.isOpen}></AmDialogs >
            <AmDialogs typePopup={"eror"} content={dialogError.text} onAccept={(e) => { setDialogError({ ...dialogError, isOpen: e }) }} open={dialogError.isOpen}></AmDialogs >
            <ModalForm
                style={{ width: "600px", height: "500px" }}
                titleText="Add Manual"
                textConfirm="Add"
                open={toggleModal}
                onAccept={(status, rowdata, inputErr) => onHandleEditConfirm(status, rowdata, inputErr)}
                data={dataModal}
                objColumnsAndFieldCheck={{ objColumn: columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunm(columnEdit, ref, inputError, dataModal, onChangeEditor)}
            />
            {/* <Box
                boxShadow={2}
                p={2}
                style={{ borderRadius: "5px", margin: "0 5px 0 5px" ,backgroundColor:"#F5F5F5"}}
            > */}
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="flex-start"
                spacing={2}
            >
                <Grid item xs={6} sm={8} md={8} lg={8} xl={10}>
                    <AmInput
                        style={{ width: "100%" }}
                        // required={required}
                        // error={rowError}
                        // helperText={inputError.length ? "required field" : false}
                        inputRef={inputScan}
                        // defaultValue={editData[accessor] ? editData[accessor] : ""}
                        // validate={true}
                        // msgError="Error"
                        // regExp={validate ? validate : ""}
                        onChange={(value) => setqrcode(value)}
                        onKeyPress={(value) => setqrcode(value)}
                    />
                </Grid>
                <Grid item xs={3} sm={2} md={2} lg={2} xl={1}>
                    <AmButton
                        // className="float-right"
                        styleType="add"
                        style={{ width: "100%" }}
                        onClick={() => onScan(qrcode)} >
                        Scan
                    </AmButton>
                </Grid>
                <Grid item xs={3} sm={2} md={2} lg={2} xl={1}>
                    <AmButton
                        // className="float-right"
                        styleType="confirm"
                        style={{ width: "100%" }}
                        onClick={() => setToggleModal(true)} >
                        Add Manual
                    </AmButton>
                </Grid>
            </Grid>
            {/* </Box> */}
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="flex-start"
                spacing={2}
            >
                {card}
            </Grid>
        </>
    )
}
