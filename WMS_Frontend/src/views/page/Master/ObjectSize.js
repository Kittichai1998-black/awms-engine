import React, {useState, useEffect} from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";
import AmButton from "../../../components/AmButton";
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmTable from "../../../components/AmTable/AmTable";
import { apicall, createQueryString } from '../../../components/function/CoreFunction';

const Axios = new apicall()
//======================================================================
const ObjectSize = props => {
  const [editObjectSize, setEditObjectSize] = useState();
  const [open, setOpen] = useState(false);

  useEffect(()=> {
    console.log(editObjectSize)
  }, [editObjectSize]);

  const EntityObjectType = [
    { label: "Location", value: 0 },
    { label: "Base", value: 1 },
    { label: "Pack", value: 2 }
  ];

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      width: 35,
      sortable: false,
      filterType:"dropdown",
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", fixed: "left", width: 120 },
    { Header: "Name", accessor: "Name", width: 250 },
    //{ Header: 'ObjectType',accessor: 'ObjectType', width:100,type:'number'},
    {
      Header: "ObjectType Name",
      accessor: "ObjectName",
      width: 120,
      type: "number"
    },
    {
      Header: "WeightAccept",
      accessor: "PercentWeightAccept",
      width: 120,
      type: "number"
    },
    { Header: "Update By", accessor: "LastUpdateBy", width: 100 },
    {
      Header: "Update Time",
      accessor: "LastUpdateTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm"
    },
    {
      Header: "Object Size Map",
      width: 150,
      Cell: e => <AmButton onClick={()=>{setEditObjectSize(e.original)}}>Object Size</AmButton>
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
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "normal",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    }
  ];

  const columnsEdit = [
    {
      field: "Code",
      type: "input",
      name: "Code",
      placeholder: "Code",
      validate: /^.+$/,
      required: true
    },
    {
      field: "Name",
      type: "input",
      name: "Name",
      placeholder: "Name",
      validate: /^.+$/,
      required: true
    },
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType","validate":/^[0-9\.]+$/},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
      placeholder: "Status"
    }
  ];
  const primarySearch = [
    { field: "Code", type: "input", name: "Code", placeholder: "Code" },
    { field: "Name", type: "input", name: "Name", placeholder: "Name" }
  ];
  const columnsFilter = [
    //{"field": "ObjectType","type":"input","name":"Object Type","placeholder":"ObjectType"},
    {
      field: "ObjectType",
      type: "dropdown",
      typeDropDown: "search",
      name: "ObjectType",
      dataDropDown: EntityObjectType,
      placeholder: "ObjectType"
    },
    {
      field: "PercentWeightAccept",
      type: "input",
      name: "Weight Accept",
      placeholder: "PercentWeightAccept"
    },
    {
      field: "Status",
      type: "dropdown",
      typeDropDown: "normal",
      name: "Status",
      dataDropDown: EntityEventStatus,
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

  var useEditColumns = (editID) => {
    return [
      {
        field: "ID",
        component: (data, cols, key) => {
          return (
            <div key={key}>
              <AmTable
                columns={columns}
                dataKey={"ID"}
                dataSource={[]}
                selection={"checkbox"}
                height={400}
              />{" "}
            </div>
          );
        }
      }
    ]
  }

  return (
    <div>
      {/* <AmDialogConfirm open={open}
        titleDialog={props.titleText}
        bodyDialog={generateColumns()}
        dataDialog={props.data}
        maxWidth={props.maxWidth}
        customAcceptBtn={<AmButton id={props.titleText} onClick={() => onHandleClick(true)} styleType="confirm_clear">{checkStr()}</AmButton>}
        customCancelBtn={<AmButton id="Editor_Cancel" onClick={() => onHandleClick(false)} styleType="delete_clear">Cancel</AmButton>}
        styleDialog={props.style} /> */}
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"ObjectSize"}
        table={"ams_ObjectSize"}
        dataAdd={columns}
        history={props.history}
        columns={iniCols}
        dataEdit={columnsEdit}
        pageSize={25}
        tableType="view"
        updateURL={window.apipath + "/v2/InsUpdDataAPI"}
      />
    </div>
  );
};

export default ObjectSize;
