import React, { useState, useEffect, useContext } from "react";
import MasterData from "../../../pageComponent/MasterData";
import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmButton from "../../../../components/AmButton";
import AmEntityStatus from "../../../../components/AmEntityStatus";
import AmDialogs from "../../../../components/AmDialogs"
const Axios = new apicall();

//======================================================================
const Customer = props => {



    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");



  const EntityEventStatus = [
    { label: "INACTIVE", value: 0 },
    { label: "ACTIVE", value: 1 }
  ];

  const iniCols = [
    {
      Header: "",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    { Header: "Description", accessor: "Description" },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 120,
      type: "datetime",
      dateFormat: "DD/MM/YYYY hh:mm"
    }
  ];
  const columns = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      required: true
    },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^.+$/
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      validate: /^.+$/
    },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    },
    {
      field: "Status",
      type: "status",
      typeDropdow: "normal",
      name: "Status",
      dataDropDow: EntityEventStatus,
      placeholder: "Status"
    }
  ];
  const columnsFilter = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" },
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
    },
    {
      field: "Status",
      type: "status",
      typeDropdow: "normal",
      name: "Status",
      dataDropDow: EntityEventStatus,
      placeholder: "Status"
    },
    {
      field: "LastUpdateBy",
      type: "input",
      name: "Update By",
      placeholder: "Update By"
    },
    {
      field: "LastUpdateTime",
      type: "dateFrom",
      name: "Update From",
      placeholder: "Update Time From"
    },
    {
      field: "LastUpdateTime",
      type: "dateTo",
      name: "Update To",
      placeholder: "Update Time To"
    }
  ];

  const getStatus = value => {
    if (value.Status === "0" || value.Status === 0) {
      return <AmEntityStatus key={0} statusCode={0} />;
    } else if (value.Status === "1" || value.Status === 1) {
      return <AmEntityStatus key={1} statusCode={1} />;
    } else if (value.Status === "2" || value.Status === 2) {
      return <AmEntityStatus key={2} statusCode={2} />;
    } else {
      return null;
    }
    };


    const primarySearch = [
        {
            field: "Code",
            type: "input",
            name:"Code",
            placeholder: "Code",
            validate: /^.+$/
        },
        {
            field: "Name",
            type: "input",
            name:  "Name",
            placeholder: "Name",
            validate: /^.+$/
        }
    ];

    const BtnexportCSV = () => {
        return <div>
          
                <AmButton styleType="add"
                    onClick={() => { OnclickLoadData() }}
                >{"Load Data"}</AmButton>

        
        </div>

    }



    const OnclickLoadData = () => {

        Axios.post(window.apipath + "/v2/PutCustomerFromFileServerAPI", {}).then((res) => {

            if (res.data.apiResults.length > 0) {
                setMsgDialogSuc(res.data.apiResults[0].fileRequest + "Success")
                setStateDialogSuc(true)
            } else {
                setStateDialogErr(true)
                setMsgDialogErr("Load Data Fail")

            }

        })


    }

  return (
      <div>
          <AmDialogs
              typePopup={"success"}
              content={msgDialogSuc}
              onAccept={e => {
                  setStateDialogSuc(e);
              }}
              open={stateDialogSuc}
          ></AmDialogs>
          <AmDialogs
              typePopup={"error"}
              content={msgDialogErr}
              onAccept={e => {
                  setStateDialogErr(e);
              }}
              open={stateDialogErr}
          ></AmDialogs>

          <MasterData
              columnsFilterPrimary={primarySearch}
              customButton={BtnexportCSV()}
        columnsFilter={columnsFilter}
        tableQuery={"Customer"}
        table={"ams_Customer"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
      />
    </div>
  );
};

export default Customer;
