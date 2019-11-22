import React, { useState, useEffect, useContext } from "react";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import AmDocumentSearch from "../../../pageComponent/AmDocumentSearch";
import AmIconStatus from "../../../../components/AmIconStatus";
import DocView from "../../../pageComponent/DocumentView";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmDocumentStatus from "../../../../components/AmDocumentStatus";
import ErrorIcon from "@material-ui/icons/Error";
import IconButton from "@material-ui/core/IconButton";
import queryString from "query-string";
import AmPopup from "../../../../components/AmPopup";
const Axios = new apicall();

//======================================================================
const DocumentSearchPISTA = props => {
  useEffect(() => {
    getData();
  }, []);

  const [dataMovementType, setDataMovementType] = useState();
  const [dataCustomer, setDataCustomer] = useState();
  const [dataWarehouse, setDataWarehouse] = useState();
  const [previewError, setPreviewError] = useState(false);
  const [previewWarning, setPreviewWarning] = useState(false);
  const [previewInfo, setPreviewInfo] = useState(false);
  const [textError, setTextError] = useState("");
  const [textWarning, setTextWarning] = useState("");
  const [typePopup, setTypePopup] = useState("");
  const MovementTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "MovementType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "Name AS value,Name AS label",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const CustomerQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Customer",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "Name AS value,concat(Code, ' : ' ,Name) AS label",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "Name AS value,concat(Code, ' : ' ,Name) AS label",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const getData = () => {
    Axios.get(createQueryString(MovementTypeQuery)).then(res => {
      setDataMovementType(res.data.datas);
    });
    Axios.get(createQueryString(CustomerQuery)).then(row => {
      setDataCustomer(row.data.datas);
    });
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      setDataWarehouse(row.data.datas);
    });
  };

  const getStatusCode = (statusCode, dataRow) => {
    var qryStrOptions = queryString.parse(dataRow.Options);
    //console.log(qryStrOptions);
    //console.log(qryStrOptions._error);

    const DocumentEventStatus = [
      { status: "NEW", code: 10 },
      { status: "WORKING", code: 11 },
      { status: "WORKED", code: 12 },
      { status: "REMOVING", code: 21 },
      { status: "REMOVED", code: 22 },
      { status: "REJECTING", code: 23 },
      { status: "REJECTED", code: 24 },
      { status: "CLOSING", code: 31 },
      { status: "CLOSED", code: 32 },
      { status: "WAIT_FOR_WORKED", code: 812 }
    ];
    let status = DocumentEventStatus.find(x => x.code === statusCode).code;

    var Statusdisplay = (
      <div style={{ textAlign: "center" }}>
        <AmDocumentStatus key={status} statusCode={status} />{" "}
        {(qryStrOptions._error !== undefined && qryStrOptions._error !== "") ||
        (qryStrOptions._info !== undefined && qryStrOptions._info !== "") ||
        (qryStrOptions._warning !== undefined &&
          qryStrOptions._warning !== "") ? (
          <IconButton
            aria-label="error"
            size="small"
            aria-label="info"
            style={{ marginLeft: "3px" }}
          >
            <ErrorIcon
              fontSize="small"
              style={{ color: "#E53935" }}
              onClick={() =>
                handleClickOpenDialog(
                  qryStrOptions._error,
                  qryStrOptions._info,
                  qryStrOptions._warning,
                  typePopup
                )
              }
            />
          </IconButton>
        ) : null}
      </div>
    );
    return Statusdisplay;
  };
  const handleClickOpenDialog = (
    datatextError,
    datatextinfo,
    datatextwarning,
    datatypePopup
  ) => {
    if (datatextinfo !== "") {
      setTextError(datatextinfo);
      setTypePopup("info");
      setPreviewInfo(true);
    } else if (datatextwarning !== "") {
      setTextWarning(datatextwarning);
      setTypePopup("warning");
      setPreviewWarning(true);
    } else if (datatextError !== "") {
      setTextError(datatextError);
      setTypePopup("error");
      setPreviewError(true);
    }

    //setPreview(true);
  };
  const DocumentEventStatusSearch = [
    { label: "NEW", value: 10 },
    { label: "WORKING", value: 11 },
    { label: "WORKED", value: 12 },
    { label: "REJECTED", value: 24 },
    { label: "CLOSING", value: 31 },
    { label: "CLOSED", value: 32 },
    { label: "WAIT_FOR_WORKED", value: 812 }
  ];

  const iniCols = [
    {
      Header: "",
      accessor: "EventStatus",
      width: 70,
      fixed: "left",
      Cell: dataRow => getStatusCode(dataRow.value, dataRow.original)
    },
    {
      Header: "Doc No.",
      accessor: "Code",
      width: 150,
      sortable: false,
      Cell: dataRow => getRedirect(dataRow.original)
    },
    {
      Header: "Movement",
      accessor: "MovementName",
      width: 220
    },
    {
      Header: "Sou.Warehouse",
      accessor: "SouWarehouseName",
      width: 150
    },
    {
      Header: "Des.Warehouse",
      accessor: "DesWarehouseName",
      width: 150
    },

    {
      Header: "Remark",
      accessor: "Remark",
      width: 150
    },
    {
      Header: "Doc.Date",
      accessor: "DocumentDate",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY"
    },
    {
      Header: "ActionTime",
      accessor: "ActionTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY hh:mm"
    },
    {
      Header: "Create",
      accessor: "Created",
      width: 200
    },
    {
      Header: "LastUpdate",
      accessor: "LastUpdate",
      width: 200
    }
  ];

  const search = [
    {
      label: "Sou.Warehouse",
      field: "SouWarehouseName",
      searchType: "dropdown",
      dropdownData: dataWarehouse,
      fieldDataKey: "Name",
      fieldLabel: "Name"
    },
    {
      label: "Des.Warehouse",
      field: "DesWarehouseName",
      searchType: "dropdown",
      dropdownData: dataWarehouse,
      fieldDataKey: "Name",
      fieldLabel: "Name"
    },

    { label: "Remark", field: "Remark", searchType: "input" },
    {
      label: "Doc.Date From",
      field: "DocumentDate",
      searchType: "datepicker",
      typedate: "date",
      dateSearchType: "dateFrom"
    },
    {
      label: "Doc.Date To",
      field: "DocumentDate",
      searchType: "datepicker",
      typedate: "date",
      dateSearchType: "dateTo"
    }
  ];

  const primarySearch = [
    {
      label: "Status",
      field: "EventStatus",
      searchType: "dropdown",
      dropdownData: DocumentEventStatusSearch,
      fieldDataKey: "Name",
      fieldLabel: "Name"
    },
    { label: "Doc No.", field: "Code", searchType: "input" },
    {
      label: "Movement",
      field: "MovementName",
      searchType: "dropdown",
      dropdownData: dataMovementType,
      fieldDataKey: "Name",
      fieldLabel: "Name"
    }
  ];

  const getRedirect = data => {
    //console.log(data.ID)
    return (
      <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
        {data.Code}
        <AmRediRectInfo
          api={"/counting/detail?docID=" + data.ID}
          history={props.history}
          docID={""}
        >
          {" "}
        </AmRediRectInfo>
      </div>
    );
  };

  return (
    <div>
      <AmDocumentSearch
        columns={iniCols}
        primarySearch={primarySearch}
        expensionSearch={search}
        docTypeCode="2004"
        buttonClose={true}
        buttonReject={true}
      />
    </div>
  );
};

export default DocumentSearchPISTA;
