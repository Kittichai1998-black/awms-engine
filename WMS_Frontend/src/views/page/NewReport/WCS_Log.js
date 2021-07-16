import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
// import AmDate from '../../../components/AmDate';
import AmDatePicker from '../../../components/AmDatePicker';
import AmDropdown from '../../../components/AmDropdown';
import moment from 'moment';
import { useTranslation } from 'react-i18next'
const Axios = new apicall();
const styles = theme => ({
    root: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
});

const FormInline = styled.div`

display: inline-flex;
flex-flow: row wrap;
align-items: center;
margin-right: 20px;

label {
  margin: 5px 0 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;

const LabelH = styled.label`
    // font-weight: bold;
    width: 100px; 
`;



const WCS_Log = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 1000;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    useEffect(() => {
        onGetDocument()
    }, [page])
     
    const onGetALL = () => {
        return window.apipath + "/v2/WCS_QueueLog_Front?"
        + "&ActualTime_From=" + (valueText.ActualTime_From === undefined || valueText.ActualTime_From === null ? '' : encodeURIComponent(valueText.ActualTime_From))
        + "&ActualTime_To=" + (valueText.ActualTime_To === undefined || valueText.ActualTime_To === null ? '' : encodeURIComponent(valueText.ActualTime_To))
    }

    const onGetDocument = () => {
        let pathGetAPI = onGetALL() +
            "&page=" + (page === undefined || null ? 0 : page)
            + "&limit=" + (pageSize === undefined || null ? 1000 : pageSize);

        Axios.get(pathGetAPI).then((rowselect1) => {
            if (rowselect1) {
                if (rowselect1.data._result.status !== 0) {
                    setdatavalue(rowselect1.data.datas)
                    setTotalSize(rowselect1.data.counts,rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
                }
            }
        })
    }

    const getValue = (value, inputID) => {
        if (value && value.toString().includes("*")) {
            value = value.replace(/\*/g, "%");
        }
        valueText[inputID] = value;
    }
    const onHandleChangeInput = (value, dataObject, inputID, fieldDataKey, event) => {
        getValue(value, inputID);
    };
    const onHandleEnterInput = (value, dataObject, inputID, fieldDataKey, event) => {
        getValue(value, inputID);
        if (event && event.key == 'Enter') {
            onGetDocument();
        }
    };
    const onHandleChangeSelect = (value, dataObject, inputID, fieldDataKey, event) => {
        getValue(value, inputID);
        onGetDocument();
    };
    const GetBodyReports = () => {
        return <div style={{ display: "inline-block" }}>
            {/* <FormInline><LabelH>{t("Doc No.")} : </LabelH>
                <AmInput
                    id={"docCode"}
                    type="input"
                    style={{ width: "300px" }}
                    onChange={(value, obj, element, event) => onHandleChangeInput(value, null, "docCode", null, event)}
                    onKeyPress={(value, obj, element, event) => onHandleEnterInput(value, null, "docCode", null, event)}
                />
            </FormInline>
            <FormInline><LabelH>{t("Doc.Process")} : </LabelH>
                <AmDropdown
                    id={'documentProcessType'}
                    fieldDataKey={"ID"}
                    fieldLabel={["Code", "Name"]}
                    labelPattern=" : "
                    width={300}
                    placeholder="Select Doc.Process Type"
                    ddlMinWidth={300}
                    zIndex={1000}
                    returnDefaultValue={true}
                    queryApi={MVTQuery}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onHandleChangeSelect(value, dataObject, 'documentProcessType', fieldDataKey, null)}
                    ddlType={'search'}
                />
            </FormInline> */}
            <FormInline><LabelH>{t("Date From")} : </LabelH>
                <AmDatePicker
                    id={"ActualTime_From"}
                    TypeDate={"datetime-local"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "ActualTime_From", null, null)}
                    FieldID={"ActualTime_From"} >    
                </AmDatePicker>
            </FormInline>
            <FormInline><LabelH>{t("Date To")} : </LabelH>
                <AmDatePicker
                    id={"ActualTime_To"}
                    TypeDate={"datetime-local"}
                    style={{ width: "300px" }}
                    defaultValue={true}
                    // value={valueInput[field] ? valueInput[field].value : ""}
                    onChange={(value) => onHandleChangeSelect(value ? value.fieldDataKey : '', value, "ActualTime_To", null, null)}
                    FieldID={"ActualTime_To"} >
                </AmDatePicker>
            </FormInline>
        </div>

    }
    // const customBtnSelect = () => {
    //     return <AmButton styleType="confirm" onClick={onGetDocument} style={{ marginRight: "5px" }}>{t('Select')}</AmButton>
    // }
    const columns = [
        { Header: 'Time', accessor: 'ActualTime',width: 160,  sortable: false,Cell:e=>(e.original.ActualTime).split("T").join("\n").split(".")[0]},
        { Header: 'Werehouse', accessor: 'Warehouse_name', width: 150, sortable: false },
        { Header: 'Station', accessor: 'Station_name', width: 120, sortable: false ,filterable: true},
        { Header: 'Bay', accessor: 'BAY', width: 80, sortable: false ,filterable: true},
        { Header: 'FLOORs', accessor: 'FLOORs', width: 80, sortable: false ,filterable: true},
        { Header: 'Shuttle', accessor: 'Code_shu', width: 100, sortable: false ,filterable: true},
        { Header: 'SRM', accessor: 'Code_srm', width: 100, sortable: false ,filterable: true},
        { Header: 'Type', accessor: 'TypeNameWork', width: 260, sortable: false },
        { Header: 'QueueStation', accessor: 'QueueStatusname', width: 240, sortable: false },
        { Header: 'Pallet', accessor: 'BC_PALLET', width: 400, sortable: false },
];
    // const comma = (value) => {
    //     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // }
    return (
        <div className={classes.root}>
            <AmReport
                bodyHeadReport={GetBodyReports()}
                columnTable={columns}
                dataTable={datavalue}
                pageSize={1000}
                pages={(x) => setPage(x)}
                totalSize={totalSize}
                // renderCustomButton={customBtnSelect()}
                exportApi={onGetALL()}
                excelFooter={false}
                fileNameTable={"CURINV"}
                page={false}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(WCS_Log);