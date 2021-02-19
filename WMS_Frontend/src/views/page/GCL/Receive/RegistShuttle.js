import React, { useState, useEffect, useRef, useMemo } from "react";
import { withStyles, Tooltip } from "@material-ui/core";
import styled from 'styled-components'
import AmTable from "../../../../components/AmTable/AmTableComponent"
import AmDialogs from "../../../../components/AmDialogs";
import AmButton from "../../../../components/AmButton"
import AmDropdown from "../../../../components/AmDropdown";
import AmInput from "../../../../components/AmInput";
import AmEditorTable from "../../../../components/table/AmEditorTable"
import { apicall } from "../../../../components/function/CoreFunction";
import LabelT from '../../../../components/AmLabelMultiLanguage'
import Checkcircle from "@material-ui/icons/CheckCircleSharp";
import CheckcircleRemove from "@material-ui/icons/RemoveCircle";
import { useTranslation } from "react-i18next";

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

const LabelTStyle = {
    "font-weight": "bold",
    width: "200px"
}

const InputDiv = styled.div`
margin: 5px;
@media(max - width: 300px) {
    margin: 0;
}
`;

const styles = theme => ({

    labelHead2: {
        fontWeight: "inherit",
    },
    labelText: {
        // fontWeight: "inherit",
        // fontSize: 12,
        flexGrow: 1
    },
    labelTextRoot: {
        fontWeight: "bold",
        fontSize: 16,
        flexGrow: 1,
        display: 'inline-flex'
    },
    labelHead: {
        fontWeight: 'bold',
        display: 'inline-block',
        padding: 3
    }

});

const AreaMasterLocationQuerys = () => {
    return {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "AreaMasterType_ID", "c":"=", "v": 20},{ "f": "ObjectSize_ID", "c":"=", "v": 4}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
}


const RegistShuttle = (props) => {
    const { t } = useTranslation();
    const { classes } = props;
    const [openAlert, setOpenAlert] = useState(false);
    const [settingAlert, setSettingAlert] = useState(null);
    const [areaMasterLoc, setareaMasterLoc] = useState();
    const [areaMasterLocquery, setareaMasterLocquery] = useState(AreaMasterLocationQuerys);
    const [warehouseID, setwarehouseID] = useState(0);
    const [warehouseCode, setwarehouseCode] = useState();
    const [shutID, setshutID] = useState(0);
    const [shutCode, setshutCode] = useState();
    const [dialog, setdialog] = useState(false);
    const [dataSource, setdataSource] = useState([
        {
            "status": 1,
            "shuttleCode": 'SHTTT11',
            "warehousecode": 'WH8'
        },
        {
            "status": 2,
            "shuttleCode": 'SHTTT22',
            "warehousecode": 'WH8'
        },
    ]);

    useEffect(() => {
        if (warehouseID != 0) {
            getareaLocQuery(warehouseID)
        }
    }, [warehouseID])

    const getareaLocQuery = (IDwarehouse) => {
        if (areaMasterLocquery) {
            let queryAr = areaMasterLocquery;
            let objQuery = areaMasterLocquery;
            if (objQuery !== null) {
                let areaLocqry = JSON.parse(objQuery.q)
                areaLocqry.push({ 'f': 'warehouse_ID', 'c': '=', 'v': IDwarehouse })
                objQuery.q = JSON.stringify(areaLocqry);
            }
            setareaMasterLocquery(queryAr);
            setareaMasterLoc(objQuery)
        }

    }
    const WarehouseMasterQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "*",
        g: "",
        s: "[{ 'f': 'ID', 'od': 'desc' }]",
        sk: 0,
        l: 100,
        all: ""
    };


    function AlertDialog(open, setting, onAccept) {
        if (open && setting) {
            return <AmDialogs typePopup={setting.type} content={setting.message}
                onAccept={(e) => onAccept(e)} open={open}></AmDialogs>
        } else {
            return null;
        }
    }

    const onAccept = (data) => {
        setOpenAlert(data)
        if (data === false) {
            setSettingAlert(null)
        }
    }


    const OpenaddShuttel = () => {
        setdialog(true)
    }

    const editorListcolunmGate = () => {
        return [{
            "field": "warehouse",
            "component": () => {
                return <div>
                    <FormInline>
                        <LabelT style={LabelTStyle}> Area :</LabelT>
                        <InputDiv>
                            <AmDropdown
                                //required={required}
                                id={'WarehouseID'}
                                placeholder={"Select"}
                                fieldDataKey={'ID'}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["Code"]}
                                labelPattern=" : "
                                width={200}
                                ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={WarehouseMasterQuery}
                                // data={dataUnit}
                                returnDefaultValue={true}
                                defaultValue={1}
                                onChange={(value, dataObject, fieldDataKey) => onChangeEditor(value, dataObject, fieldDataKey)}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </InputDiv>
                    </FormInline>
                    <FormInline>
                        <LabelT style={LabelTStyle}>Gate :</LabelT>
                        <InputDiv>
                            <AmDropdown
                                //required={required}
                                id={'shutID'}
                                placeholder={"Select"}
                                fieldDataKey={'Code'}//ฟิล์ดดColumn ที่ตรงกับtable ในdb 
                                fieldLabel={["Code"]}
                                labelPattern=" : "
                                width={200}
                                ddlMinWidth={200} //กำหนดความกว้างของกล่อง dropdown
                                // valueData={valueText[idddl]} //ค่า value ที่เลือก
                                queryApi={areaMasterLoc}
                                // data={dataUnit}
                                //returnDefaultValue={true}
                                //defaultValue={editData[accessor] ? editData[accessor] : defaultValue ? defaultValue : ""}
                                onChange={(value, dataObject, fieldDataKey) => onChangeEditor(value, dataObject, fieldDataKey)}
                                ddlType={"search"} //รูปแบบ Dropdown 
                            />
                        </InputDiv>
                    </FormInline>
                </div>
            }
        }]
    }


    const onChangeEditor = (value, dataObject, fieldDataKey) => {
        if (value) {
            if (fieldDataKey === 'WarehouseID') {
                setwarehouseCode(dataObject.Code);
                setwarehouseID(dataObject.ID);
            } else if (fieldDataKey === 'shutID') {
                setshutCode(dataObject.Code);
                setshutID(dataObject.ID);
            }
        }
    }

    const onHandleEditConfirm = (status, rowdata, inputError) => {
        if (status) {
            let datas = {}
            datas = {
                "status": 1,
                "shuttleCode": shutCode,
                "warehousecode": warehouseCode
            }
            dataSource.push(datas)
            setdataSource([...dataSource])
            setdialog(false)
        } else {
            setdialog(false)

        }

    }




    const columns = [
        { Header: "Status", accessor: "status", Cell: e => getStatus(e.original), colStyle: { textAlign: "center" }, width: 200 },
        { Header: "Shuttle", accessor: "shuttleCode" },
        { Header: "Warehouse", accessor: "warehousecode" },
    ];

    const getStatus = (data) => {
        console.log(data.status)
        if (data.status == 1) {
            return <Tooltip title="Online" aria-label="add"><Checkcircle fontSize="small"
                style={{ color: "#4dbd74", position: 'relative' }}></Checkcircle></Tooltip>
        } else if (data.status == 2) {
            return <Tooltip title="offline" aria-label="add"><CheckcircleRemove fontSize="small"
                style={{ color: "#ffc107", position: 'relative' }}></CheckcircleRemove></Tooltip>
        }
    }

    const DialogAlert = useMemo(() => AlertDialog(openAlert, settingAlert, onAccept), [openAlert, settingAlert])

    return (
        <>
            <div>
                {DialogAlert}
                <AmEditorTable
                    style={{ width: "300px", height: "300px" }}
                    titleText={'ADD SHUTTLE'}
                    open={dialog}
                    onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError)}
                    //data={editData}
                    //objColumnsAndFieldCheck={{ objColumn: props.columnEdit, fieldCheck: "accessor" }}
                    columns={editorListcolunmGate()}
                />
                <AmButton className="float-right" styleType="add"
                    style={{ width: "150px" }}
                    onClick={() => { OpenaddShuttel() }}> ADD </AmButton>
                <div style={{ paddingTop:"10px" }}>
                    <AmTable
                dataKey="ID"
                columns={ columns}
                pageSize={1000}
                //pagination={true}
                //onPageSizeChange={(pg) => { setPageSize(pg) }}
                //tableConfig={true}
                dataSource={dataSource}
                height={200}
                    rowNumber={true}
                /></div>
        </div>

        </>
    );
}



RegistShuttle.propTypes = {

}
export default withStyles(styles)(RegistShuttle);