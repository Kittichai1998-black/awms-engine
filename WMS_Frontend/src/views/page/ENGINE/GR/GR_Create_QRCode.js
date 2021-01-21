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
// import useSwitch from '../../../../components/Hook/useSwitch'

const axios = new apicall()

// const FormInline = styled.div`
// display: flex;
// flex-flow: row wrap;
// align-items: center;
// label {
//     margin: 5px 5px 5px 0;
// }
// input {
//     vertical-align: middle;
// }
// // @media (max-width: 800px) {
// //     flex-direction: column;
// //     align-items: stretch;

// //   }
// `;

export default () => {
    const [qrcode, setqrcode] = useState()
    const [toggleModal, setToggleModal] = useState(false)
    const [editData, setEditData] = useState({});
    const [inputError, setInputError] = useState([])
    const [dialogError, setDialogError] = useState({ isOpen: false, text: "" })
    // const [menuIsOpen, openMenu, closeMenu] = useSwitch()
    const [anchorEl, setAnchorEl] = useState()
    const [card, setCard] = useState([])
    const [GRCode, setGRCode] = useState()
    const inputScan = useRef()

    useEffect(() => {
        inputScan.current.focus()
    }, [])

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
            // fieldDataKey: "warehouse_id",
            fieldLabel: ["Code", "Name"],
            idddl: "warehouse_id",
            queryApi: table_Warehouse,
            // defaultValue: 1,
            columsddl: columsFindPopupArea_Warehouse
        },
        { Header: "SKU", accessor: "sku", type: "input", width: '300px' },
        { Header: "Lot", accessor: "lot", type: "input", width: '300px' },
        { Header: "Grade", accessor: "grade", type: "input", width: '300px' },
        { Header: "Pallet No", accessor: "palletNo", type: "input", width: '300px' },
        { Header: "Qty per pallet", accessor: "qtyPerPallet", type: "input", width: '300px' },
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

    const onScan = () => {
        if (qrcode && qrcode.split("|").length === 11) {
            // console.log(qrcode.split("|").length);
            const _editData = {
                doc_wms: qrcode.split("|")[0].trim(),
                customer: qrcode.split("|")[1].trim(),
                grade: qrcode.split("|")[2].trim(),
                sku: qrcode.split("|")[3].trim(),
                lot: qrcode.split("|")[4].trim(),
                start_pallet: +qrcode.split("|")[5].substr(0, 4).trim(),
                end_pallet: +qrcode.split("|")[5].substr(4, 4).trim(),
                warehouse: qrcode.split("|")[6].trim(),
                qty: qrcode.split("|")[7].trim(),
                unit: qrcode.split("|")[8].trim(),
                qty_per_pallet: qrcode.split("|")[9].trim(),
                status: qrcode.split("|")[10].trim(),
                api_ref: generateRandom(10)
            }
            // const doc = {
            //     desWarehouseCode: _editData.Warehouse,
            //     forCustomerCode: _editData.Customer_Code,
            //     lot: _editData.Lot,
            //     receivedOrderItem: null,
            // }
            // doc.options = `bagging_order=${_editData.Bagging_Order}`
            // doc.options += `&grade=${_editData.Grade}`
            // doc.options += `&mat_code=${_editData.MAT_CODE}`
            // doc.options += `&start_pallet=${_editData.Start_Pallet}`
            // doc.options += `&end_pallet=${_editData.End_Pallet}`
            // doc.options += `&qty=${_editData.QTY}`
            // doc.options += `&uom=${_editData.UOM}`
            // doc.options += `&qty_per_pallet=${_editData.QTY_PER_Pallet}`
            // doc.options += `&storage_status=${_editData.Storage_Status}`
            // console.log(doc);
            // axios.post(window.apipath + "/v2/revieve_order/", _editData).then(res => {
            //     console.log(res);
            // })

            // console.log(_editData);

            const res = {
                doc_wcs: "GR00000001",
                doc_wms: editData.doc_wms
            }

            const newDatas = Object.assign(_editData, res);
            

            generateCard(newDatas)
            setEditData(newDatas)
            setCard([...card, generateCard(newDatas)])

        } else {
            setDialogError({ isOpen: true, text: "รูปแบบข้อมูลไม่ถูกต้อง" })
        }
    }

    const onChangeEditor = (field, data, required, row) => {
        if (typeof data === "object" && data) {
            editData[field] = data[field] ? data[field] : data.value
        } else if (data) {
            editData[field] = data
        } else {
            delete editData[field]
        }

        if (required) {
            // console.log(required);
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

    const onHandleEditConfirm = (status, rowdata, inputErr) => {
        if (status) {
            if (!inputErr.length) {

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
            <Card style={{ width: "97%" }}>
                <CardHeader
                    title={datas.doc_wcs}
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon onClick={(e) => {
                                setAnchorEl(e.currentTarget)
                                setGRCode(datas.doc_wcs)
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
                                    // const _editData = { ...editData }
                                    console.log(editData);
                                    // editData.pallet = value
                                    // setEditData(_editData)
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
                                    // const _editData = { ...editData }
                                    console.log(editData);
                                    // editData.lastPallet = value
                                    // setEditData(_editData)
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
                <MenuItem onClick={() => {
                    console.log(GRCode);
                    console.log(editData);
                    const req = {
                        pallet: editData.pallet,
                        lastPallet: editData.lastPallet
                    }
                    axios.post(window.apipath + "/v2/UpdateOptionsDocumentByCodeAPI/", req).then(res => {
                        console.log(res);
                    })

                    setAnchorEl()
                }}>Update</MenuItem>
                <MenuItem onClick={() => setAnchorEl()}>Close</MenuItem>
                <MenuItem onClick={() => setAnchorEl()}>Delete</MenuItem>
            </Menu>
            <AmDialogs typePopup={"eror"} content={dialogError.text} onAccept={(e) => { setDialogError({ ...dialogError, isOpen: e }) }} open={dialogError.isOpen}></AmDialogs >
            <ModalForm
                style={{ width: "600px", height: "500px" }}
                titleText="Add Manual"
                textConfirm="Add"
                open={toggleModal}
                onAccept={(status, rowdata, inputErr) => onHandleEditConfirm(status, rowdata, inputErr)}
                data={editData}
                objColumnsAndFieldCheck={{ objColumn: columnEdit, fieldCheck: "accessor" }}
                columns={editorListcolunm(columnEdit, ref, inputError, editData, onChangeEditor)}
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
                        onClick={onScan} >
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
            <br />
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
