import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Divider from '@material-ui/core/Divider';
// import InputAdornment from '@material-ui/core/InputAdornment';
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
// import SearchIcon from '@material-ui/icons/Search';
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from 'react-i18next'
import { withStyles } from "@material-ui/core/styles";
import Table from "./table/AmTable";

import AmAux from "./AmAux";
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import Pagination from "./table/AmPagination";
const Axios = new apicall();


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
// input {
//     margin: 5px 0 0 0;
//   }
const LabelH = styled.label`
font-weight: bold;
  width: 100px;
`;

const InputDiv = styled.div`
    margin: 5px;
    @media (max-width: 800px) {
        margin: 0;
    }
`;
const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(1)
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        padding: "3px"
    }
}))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="Close"
                    size="small"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});
const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: "0 5px 0 5px",
    }
}))(MuiDialogContent);
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0
    }
}))(MuiDialogActions);
const BtnAddPallet = (props) => {
    const {
        classes,
        dataDocument,
        dataDocItems,
        apiCreate,
        // columnsDocItems,
        inputHead,
        dataCheck,

    } = props;

    const [open, setOpen] = useState(false);
    const [palletCode, setPalletCode] = useState();
    const [listDocItems, setListDocItems] = useState([]);
    const [dataSelect, setDataSelect] = useState([]);
    const [valueInput, setValueInput] = useState({});

    useEffect(() => {
        console.log(dataDocItems)
        setListDocItems(dataDocItems)
    }, [dataDocItems]);

    const columnsDocItems = [
        { width: 200, accessor: "SKUMaster_Name", Header: "Item Code" },
        { width: 130, accessor: "Lot", Header: "Lot" },
        { width: 120, accessor: "Quantity", Header: "Qty" },
        { width: 70, accessor: "UnitType_Name", Header: "Unit" },
        {
            width: 110, Header: "จำนวนรับเข้า", Cell: e =>
                genInputQty(e.original)
        },

    ];


    const genInputQty = (datarow) => {
        let field = "item-" + datarow.ID;
        let docItemID = datarow.ID;
        return <AmInput id={field} style={{ width: "100px" }} type="input"
            onChange={(value, obj, element, event) => onHandleChangeInput(value, element, event, docItemID)}
        />
    }
    const onHandleChangeInput = (value, element, event, docItemID) => {

        setValueInput({
            ...valueInput, [element.id]: {
                value: value,
                docItemID: docItemID
            }
        });

    };
    const onSubmit = (data) => {
        console.log(data)
        console.log(valueInput)
        let docItems = []
         
        for (let [key, value] of Object.entries(valueInput)) {
            console.log(key)
            console.log(value)

        }
        const tempDataReq = {
            docID: dataDocument.ID,
            palletCode: palletCode,
            docItems: docItems
        }
        console.log(tempDataReq)

    }

    return (

        <AmAux>

            <AmButton className="float-right" styleType="confirm" onClick={() => setOpen(true)} >{"Add Pallet"}</AmButton>
            <Dialog
                aria-labelledby="addpallet-dialog-title"
                onClose={() => setOpen(false)}
                open={open}
                maxWidth="xl"
            >
                <DialogTitle
                    id="addpallet-dialog-title"
                    onClose={() => setOpen(false)}>
                    {"Add Pallet and Mapping Storage Object"}
                </DialogTitle>
                <DialogContent>
                    <FormInline>
                        <LabelH>Pallet Code:</LabelH>
                        <InputDiv>
                            <AmInput
                                id="palletCode"
                                name="palletCode"
                                placeholder="Pallet Code"
                                type="input"
                                styleType="primary"
                                onChangeV2={(value, obj, element, event) =>
                                    setPalletCode(value)} />
                        </InputDiv>
                    </FormInline>
                    <Divider />
                    <Table
                        columns={columnsDocItems}
                        pageSize={100}
                        data={listDocItems}
                        sortable={false}
                        selectionType="checkbox"
                        selection={true}
                        primaryKey="ID"
                        getSelection={data => setDataSelect(data)}
                    />
                </DialogContent>
                <DialogActions>
                    <AmButton
                        styleType="add"
                        onClick={() => {
                            onSubmit(dataSelect);
                            setOpen(false);
                        }}
                    >Add</AmButton>
                </DialogActions>
            </Dialog>
        </AmAux>
    );
}
BtnAddPallet.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    apiCreate: "/v2/ScanMapStoFromDocAPI",
};
export default BtnAddPallet;