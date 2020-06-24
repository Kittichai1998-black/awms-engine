import React, { useState, useEffect, useContext } from "react";

import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import AmDocumentSearch from "../../../pageComponent/AmDocumentSearch";
import AmIconStatus from "../../../../components/AmIconStatus";
import DocView from "../../../pageComponent/DocumentView";
import AmDocumentStatus from "../../../../components/AmDocumentStatus";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import IconButton from "@material-ui/core/IconButton";
import ErrorIcon from "@material-ui/icons/Error";
import queryString from "query-string";
import AmPopup from "../../../../components/AmPopup";
const Axios = new apicall();

//======================================================================
const DocumentSearchSTGT = props => {
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
    t: "DocumentProcessType",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "Name AS value,Name AS label",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const AreaLocationMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaLocationMaster",
    q:
      '[{ "f": "Status", "c":"<", "v": 2},{ "f": "AreaMaster_ID", "c":"=", "v": 16}]',
    f: "*",
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
  const AreaMasterQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 16}]',
    f: "*",
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
        {qryStrOptions._error !== undefined ||
          qryStrOptions._info !== undefined ||
          qryStrOptions._warning !== undefined ? (
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
    { Header: "", accessor: "EventStatus", width: 70, fixed: "left", Cell: dataRow => getStatusCode(dataRow.value, dataRow.original) },
    { Header: "Doc No.", accessor: "Code", width: 150, sortable: false, Cell: dataRow => getRedirect(dataRow.original) },
    { Header: "Doc.ProcessType", accessor: "DocumentProcessTypeName", width: 200 },
    { Header: "Wh Order", accessor: "Ref1", width: 120 },
    { Header: "Project", accessor: "Ref2", width: 100 },
    { Header: "Customer", accessor: "ForCustomer", width: 150 },
    { Header: "Sou. Warehouse", accessor: "SouWarehouseName", width: 150 },
    { Header: "Des. Warehouse", accessor: "DesWarehouseName", width: 150 },
    // {   Header: "Sou.Customer",   accessor: "SouCustomerName",   width: 150 },
    //{ Header: "Remark", accessor: "Remark", width: 150 },
    { Header: "Doc. Date", accessor: "DocumentDate", width: 150, type: "datetime", dateFormat: "DD/MM/YYYY" },
    { Header: "Action Time", accessor: "ActionTime", width: 150, type: "datetime", dateFormat: "DD/MM/YYYY HH:mm" }, { Header: "Create", accessor: "Created", width: 200 },
    { Header: "Modify Time", accessor: "LastUpdate", width: 200 }
  ];

  const search = [
    { label: "Sou. Warehouse", field: "SouWarehouseName", searchType: "dropdown", dropdownData: dataWarehouse, fieldDataKey: "Name", fieldLabel: "Name" },
    { label: "Des. Warehouse", field: "DesWarehouseName", searchType: "dropdown", dropdownData: dataWarehouse, fieldDataKey: "Name", fieldLabel: "Name" },
    { label: "Wh Order", field: "Ref1", width: 120, searchType: "input" },
    // {   label: "Sou.Customer",   field: "SouCustomerName",   searchType: "dropdown",   dropdownData: dataCustomer,   fieldDataKey: "Name",   fieldLabel: "Name" },
    //{ label: "Lot", field: "Lot", searchType: "input" },
    //{ label: "Remark", field: "Remark", searchType: "input" },
    { label: "Doc. Date From", field: "DocumentDate", searchType: "datepicker", typedate: "date", dateSearchType: "dateFrom" },
    { label: "Doc. Date To", field: "DocumentDate", searchType: "datepicker", typedate: "date", dateSearchType: "dateTo" }
  ];

  const primarySearch = [
    { label: "Event Status", field: "EventStatus", searchType: "dropdown", dropdownData: DocumentEventStatusSearch, fieldDataKey: "Name", fieldLabel: "Name" },
    { label: "Doc No.", field: "Code", searchType: "input" },
    { label: "Doc. ProcessType", field: "DocumentProcessTypeName", searchType: "dropdown", dropdownData: dataMovementType, fieldDataKey: "Name", fieldLabel: "Name" }
  ];
  const dataReject = [// {//   field: "souAreaCode",//   type: "dropdow",//   typeDropdow: "search",//   name: "Sou. Area",//   dataDropDow: AreaMasterQuery,//   placeholder: "Sou. Area",//   fieldLabel: ["Code", "Name"]//   //required: true//   //disabled: true// },
    { field: "desAreaCode", type: "dropdow", typeDropdow: "search", name: "Dest. Area", dataDropDow: AreaMasterQuery, placeholder: "Dest. Area", fieldLabel: ["Code", "Name"] },
    { field: "desAreaLocationCode", type: "dropdow", typeDropdow: "search", name: "Dest. AreaLocation", dataDropDow: AreaLocationMasterQuery, placeholder: "Des AreaLocation", fieldLabel: ["Code", "Name"] }
  ];
  const getRedirect = data => {
    return (
      <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
        {data.Code}
        <AmRediRectInfo
          api={"/receive/detail?docID=" + data.ID}
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
      <AmPopup
        content={textError}
        typePopup={"error"}
        open={previewError}
        closeState={e => setPreviewError(e)}
      />
      <AmPopup
        content={textError}
        typePopup={"info"}
        open={previewInfo}
        closeState={e => setPreviewInfo(e)}
      />
      <AmPopup
        content={textWarning}
        typePopup={"warning"}
        open={previewWarning}
        closeState={e => setPreviewWarning(e)}
      />
      <AmDocumentSearch
        columns={iniCols}
        primarySearch={primarySearch}
        expensionSearch={search}
        docTypeCode="1001"
        buttonClose={true}
        buttonReject={false}
        dataReject={dataReject}
        apiReject={"/v2/RejectGRDocAPI"}
        //apiWorking={""}
        apiClose={"/v2/ClosingDocumentAPI"}
      />
    </div>
  );
};

export default DocumentSearchSTGT;
