import React, {useState, useEffect, useRef} from "react";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmMaster from "../../pageComponent/AmMasterData/AmMaster";
import {EntityEventStatus} from "../../../components/Models/EntityStatus";

import IconButton from "@material-ui/core/IconButton";
import AmEditorTable from '../../../components/table/AmEditorTable';
import AmTable from "../../../components/AmTable/AmTable";
import { apicall } from '../../../components/function/CoreFunction2';
import GroupIcon from '@material-ui/icons/Group';
import AmDialogs from "../../../components/AmDialogs";

const Axios = new apicall()

//======================================================================
const Permission = props => {
  const [roleID, setRoleID] = useState();
  const [rolePermissionData, setRolePermissionData] = useState([]);
  const [relationComponent, setRelationComponent] = useState([]);
  const updateRolePermission = useRef([]);
  const [open, setOpen] = useState(false);
  const [dialogState, setDialogState] = useState({});

  const iniCols = [
    {
      Header: "Status",
      accessor: "Status",
      fixed: "left",
      fixWidth: 162,
      sortable: false,
      filterType:"dropdown",
      colStyle:{textAlign:"center"},
      filterConfig:{
        filterType:"dropdown",
        dataDropDown:EntityEventStatus,
        typeDropDown:"normal"
      },
      Cell: e => getStatus(e.original)
    },
    { Header: "Code", accessor: "Code", width: 200 },
    { Header: "Name", accessor: "Name", width: 150 },
    { Header: "Description", accessor: "Description", width: 150 },
    {
      Header: "Update Time",
      accessor: "Created",
      filterable:false,
      width: 150,
    },
    {
      Header: "",
      width: 15,
      filterable:false,
      Cell: e => <IconButton
        size="small"
        aria-label="info"
        onClick={()=>{setRoleID(e.original.ID)}}
        style={{ marginLeft: "3px" }}>
        <GroupIcon fontSize="small" style={{ color: "#3E5FFA" }}/>
      </IconButton>}
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
      placeholder: "Description",
      required: true
    }
  ];

  const columnsEdit = [
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
      placeholder: "Description",
      required: true
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
    {
      field: "Description",
      type: "input",
      name: "Description",
      placeholder: "Description"
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

  useEffect(()=> {
    if(roleID !== undefined){
      Axios.get(
        window.apipath + "/v2/GetRolePermissionAPI?ID=" + roleID
      ).then(res => {
        setRolePermissionData(res.data.datas)})
    }
  }, [roleID]);

  useEffect(() => {
    const getPermissionColumns = (dataSou) => {
      const permissionCols = [
        { Header: "Code", accessor: "Code", width: 250 },
        { Header: "Name", accessor: "Name", width: 250 }
      ];

      if(dataSou !== undefined && dataSou.length > 0){
        setOpen(true)
      }

      const defaultValue = () => {
        return dataSou.filter(x=> x.RolePermissionID !== null && (x.Status !== 0 && x.Status !== 2 && x.Status !== null))
      }
      return [
        {
          field: "ID",
          component: (data, cols, key) => {
            return (
              <div key={key}>
                <AmTable
                  columns={permissionCols}
                  dataKey={"ID"}
                  dataSource={dataSou}
                  selection={"checkbox"}
                  selectionData={sel => {
                    var select = [...sel];
                    var objUpdate = [];
                    var newPermission = select.filter(x => x.RolePermissionID === null);
                    var oldPermission = dataSou.filter(x => x.RolePermissionID !== null);
                    oldPermission.forEach(e => {
                      var oldObj = select.find(x => x.RolePermissionID === e.RolePermissionID);
                      if(oldObj === undefined){
                        objUpdate.push({"ID":e.RolePermissionID, "Status":0})
                      }else{
                        if(e.Status !== 1)
                          objUpdate.push({"ID":e.RolePermissionID, "Status":1})
                      }
                    });
                    newPermission.forEach(x=> {
                      objUpdate.push({"ID":null, "Status":1, "Role_ID":roleID, "Permission_ID":x.ID, "Revision":1 })
                    });

                    updateRolePermission.current = objUpdate;
                  }}
                  selectionDefault={defaultValue()}
                  height={400}
                />{" "}
              </div>
            );
          }
        }
      ]
    }
    
    setRelationComponent(getPermissionColumns(rolePermissionData))
  }, [rolePermissionData])
  
  const PopupPermission = React.memo(({relationComponent, open}) => {
    return <AmEditorTable 
    open={open} 
    onAccept={(status, rowdata)=> {
      if(!status){
        setOpen(false)
        setRoleID(null)
      }
      else{
        setRoleID(null)
        UpdatePermissionMap();
        setOpen(false)
      }
    }}
    titleText={"Role Permission"}
    data={{}}
    columns={relationComponent}
  />});

  const UpdatePermissionMap = () => {
    let updjson = {
      t: "ams_Role_Permission",
      pk: "ID",
      datas: updateRolePermission.current,
      nr: false,
      _token: localStorage.getItem("Token")
    };

    Axios.put(window.apipath + "/v2/InsUpdDataAPI", updjson).then(res => {
      if(res.data._result.status === 1){
        setDialogState({type:"success", content:"Success", state:true})
      }
      else{
        setDialogState({type:"error", content:res.data._result.message, state:true})
      }
    });
  }

  return (
    <div>
      {/* <AmSetUserPer
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"Role"}
        table={"ams_Role"}
        dataAdd={columns}
        iniCols={iniCols}
        dataEdit={columnsEdit}
        // customUser={true}
        customPer={true}
        dataUser={dataUser}
        columnsEditAPIKey={columnsEditAPIKey}
        history={props.history}
      /> */}
      <PopupPermission relationComponent={relationComponent} open={open}/>
      
      <AmDialogs
            typePopup={dialogState.type}
            onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
            open={dialogState.state}
            content={dialogState.content} />
      <AmMaster
        columnsFilterPrimary={primarySearch}
        columnsFilter={columnsFilter}
        tableQuery={"Role"}
        table={"ams_Role"}
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

export default Permission;
