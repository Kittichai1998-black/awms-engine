import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../pageComponent/AmReportV2/AmReport'
//import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
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


const CurrentInventory = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});
    const columns = [
        {
          Header: "LogRefID",
          accessor: "LogRefID",
          width: 100
        },
        {
          Header: "Service Name",
          accessor: "APIService_Name",
          width: 170, filterable: false
        },
        {
          Header: "Doc Code",
          accessor: "Code",
          width: 120, filterable: false
        },
        {
          Header: "Doc Type",
          accessor: "DocumentType_ID",
          width: 70, filterable: false
        },
        {
          Header: "Doc Event",
          accessor: "DocEventStatus",
          width: 100, filterable: false
        },
        {
          Header: "Doc Status",
          accessor: "DocStatus",
          width: 80, filterable: false
        },
    
        {
          Header: "SKUCode",
          accessor: "SKUMaster_Code",
          width: 100, filterable: false
        },
        {
          Header: "Docitem Qty",
          accessor: "Quantity",
          width: 100, filterable: false
        },
        {
          Header: "Unit",
          accessor: "UnitType_Code",
          width: 100, filterable: false
        },
        {
          Header: "DocItem Event",
          accessor: "DocItemEventStatus",
          width: 100, filterable: false
        },
        {
          Header: "DocItem Status",
          accessor: "DocItemStatus",
          width: 100, filterable: false
        },
    
        {
          Header: "Sto Code",
          accessor: "StoCode",
          width: 150, filterable: false
        },
        {
          Header: "Disto Qty",
          accessor: "DistoQty",
          width: 100, filterable: false
        },
        {
          Header: "Disto Status",
          accessor: "DistoStatus",
          width: 100, filterable: false
        },
        {
          Header: "Area Code",
          accessor: "AreaMaster_Code",
          width: 100, filterable: false
        },
        {
          Header: "AreaLocation",
          accessor: "AreaLocationMaster_Code",
          width: 100, filterable: false
        },
        {
          Header: "Parent Sto",
          accessor: "ParentSto_Code",
          width: 100, filterable: false
        },
        {
          Header: "Sto Qty",
          accessor: "StoQty",
          width: 100, filterable: false
        },
        {
          Header: "Sto Unit",
          accessor: "StoUnit",
          width: 100, filterable: false
        },
        {
          Header: "Sto Event",
          accessor: "StoEvent",
          width: 100, filterable: false
        },
        {
          Header: "Sto Status",
          accessor: "StoStatus",
          width: 100, filterable: false
        },
        {
          Header: "WQ ID",
          accessor: "WorkQueue_ID",
          width: 100, filterable: false
        },
        {
          Header: "WQ Event",
          accessor: "WQEvent",
          width: 100, filterable: false
        },
        {
          Header: "WQ Status",
          accessor: "WQStatus",
          width: 100, filterable: false
        },
        {
          Header: "Lot",
          accessor: "Lot",
          width: 100, filterable: false
        },
        {
          Header: "Batch",
          accessor: "Batch",
          width: 100, filterable: false
        },
        {
          Header: "Result",
          accessor: "ResultMessage",
          width: 100, filterable: false
        },
        {
          Header: "ActionBy",
          accessor: "ActionBy",
          width: 100, filterable: false
        },
        {
          Header: "Start Time",
          accessor: "StartTime",
          width: 200,
          type: "datetime",
          dateFormat: "DD/MM/YYYY HH:mm:ss", filterable: false
        },
        {
          Header: "End Time",
          accessor: "EndTime",
          width: 200,
          type: "datetime",
          dateFormat: "DD/MM/YYYY HH:mm:ss", filterable: false
        }
      ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <div className={classes.root}>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"LOG_SEARCH"}
                tableKey={"LogRefID"}
            ></AmReport>
        </div>
    )

}

export default withStyles(styles)(CurrentInventory);
