import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,Snackbar,CircularProgress,Grid } from '@material-ui/core';
import {Button,IconButton, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment } from '@material-ui/core';
import {Alert, TreeView, TreeItem} from '@material-ui/lab';
import GCLService from '../../../../components/function/GCLService'
import {Sort,CloseSharp,BrightnessHigh,CheckCircleOutlineRounded,Save,ExpandMore, ChevronRight, Style} from '@material-ui/icons'
import CancelIcon from '@material-ui/icons/Cancel';
import ScanLocationCounting from './ScanLocationCounting';
import ScanLocationSorting from './ScanLocationSorting';
import "../../../../assets/css/TableCustom.css";

const TreeData = [
  {id: 'W01',name: 'W01',children: [ {id: 'W01-1', name: 'LV01'},{id: 'W01-2', name: 'LV02'},{id: 'W01-3', name: 'LV03'}]},
  {id: 'W02',name: 'W02',children: [ {id: 'W02-1', name: 'LV01'},{id: 'W02-2', name: 'LV02'},{id: 'W02-3', name: 'LV03'}]},
  {id: 'W03',name: 'W03',children: [ {id: 'W03-1', name: 'LV01'},{id: 'W03-2', name: 'LV02'},{id: 'W03-3', name: 'LV03'}]},
  {id: 'W04',name: 'W04',children: [ {id: 'W04-1', name: 'LV01'},{id: 'W04-2', name: 'LV02'},{id: 'W04-3', name: 'LV03'}]},
  {id: 'W05',name: 'W05',children: [ {id: 'W05-1', name: 'LV01'},{id: 'W05-2', name: 'LV02'},{id: 'W05-3', name: 'LV03'}]},
  {id: 'W06',name: 'W06',children: [ {id: 'W06-1', name: 'LV01'},{id: 'W06-2', name: 'LV02'},{id: 'W06-3', name: 'LV03'}]},
  {id: 'W07',name: 'W07',children: [ {id: 'W07-1', name: 'LV01'},{id: 'W07-2', name: 'LV02'},{id: 'W07-3', name: 'LV03'}]},
  {id: 'W08',name: 'W08',children: [ {id: 'W08-1', name: 'LV01'},{id: 'W08-2', name: 'LV02'},{id: 'W08-3', name: 'LV03'}]},
];

let intervalGetSPReportAPI=null
const ViewStorageUsed=(props)=>{
  const [dataTable, setDataTable] = useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [isLoadingdataTable,setIsLoadingdataTable]=useState(false);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [expanded, setExpanded] = React.useState(["W01","W02"]);
  const [selected, setSelected] = React.useState("W01-1");
  const [isOpenCountingModal,setIsOpenCountingModal]=useState(false);
  const [isOpenSortingModal,setIsOpenSortingModal]=useState(false);
  const [inputLocation,setInputLocation]=useState("");
  const [showDatail,setShowDetail]=useState(null)

  const [tableHaderColumns,setTableHaderColumns] = React.useState([
    {id: 'location', label: 'loc/bank', minWidth: 120, align: 'center'},
    {id: 'action',label: 'Result', minWidth: 170},
  ]);

  useEffect(() => {
    const selectInput=selected.split('-');
    loadDataTable(selectInput[0],Number(selectInput[1]));
    
    //on component unmount
    return () => {
      // clearInterval(intervalGetSPReportAPI);
    }
  }, [selected]);

  const loadDataTable=async(wh,lv)=>{
    setIsLoadingdataTable(true)
    // clearInterval(intervalGetSPReportAPI);
    GCLService.post('/v2/View_Storage_Used_Front',{wh,lv,spname:"View_Warehouse_Used"}).then(res=>{
        setIsLoadingdataTable(false)
        if(GCLService.isMockData) return initTable(GCLService.mockDataGCL.ViewStorageUsed);
        if(!res.data._result.status) {
            setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
            return ;
        }
        initTable(res.data.datas)
        // intervalGetSPReportAPI=setInterval(()=>{
        //     GCLService.post('/v2/Shuttle_ActionResult_Front',{wh,lv,spname:"View_Warehouse_Used"}).then(res=>{
        //         if(!res.data._result.status) {
        //         setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
        //         return ;
        //         }
        //         initTable(res.data.datas)
        //     })
        // },5000)
    })
  };

  const initTable=(data=[])=>{
    let tHeader=[{id: 'location', label: 'loc/bank', minWidth: 120, align: 'center'}]
    let banklength= 0;
    for(let vData of data){
      if(vData.bank_max > banklength) banklength=vData.bank_max
    }
    for(let i=1;i<=banklength;i++){
      tHeader.push({id: i, label: i, minWidth: 20, align: 'center'})
    }
    tHeader.push({id: 'action',label: ' 🛠 ', minWidth: 170, align: 'center'})

    let row=data.map((vData,key)=>{
      let resultItem={}
      const pallets=vData.pallets.split(",")
      tHeader.forEach(hv=>{
        if(hv.id=='location'){resultItem[hv.id]=vData[hv.id];}
        else{
          resultItem[hv.id]=pallets[Number(hv.id)-1]
        }
      })
      return resultItem;
    })
    setTableHaderColumns(tHeader)
    setDataTable(row)
  };

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    const selectInput=nodeIds.split('-');
    if(selectInput[0]!=null && selectInput[1]!=null) setSelected(nodeIds);
    
  };

  const renderTree = (nodes) => (
    Array.isArray(nodes) ? nodes.map((node)=>(
      <TreeItem key={node.id} nodeId={node.id} label={node.name}>
        {Array.isArray(node.children) ? node.children.map((n) => renderTree(n)) : null}
      </TreeItem>
    )) : (
      <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
        {Array.isArray(nodes.children) ? nodes.children.map((n) => renderTree(n)) : null}
      </TreeItem>
    )
  );

  return (
    <Grid container spacing={2} style={{marginTop:10}}>
      <Grid item xs={2}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10}}>
          <TreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
          >
            {renderTree(TreeData)}
          </TreeView>
        </Paper>
      </Grid>
    
      <Grid item xs={10}>
        <Paper elevation={3} style={{width: '100%',height:'100%', padding:10}}>
          {(dataTable.length<=0 && !isLoadingdataTable) ?
            <Alert severity='info'>Empty Data</Alert> :
            (isLoadingdataTable ? 
              <center><CircularProgress color='primary' size={50}/></center> :
              <table className='tableViewStorageUsed' cellSpacing='1' width='100%'>
                <tr style={{fontWeight:'bold'}}>
                  {tableHaderColumns.map((column) => (
                      <td
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth, backgroundColor:'#DDD',padding:10 }}
                      >
                      {column.label}
                      </td>
                  ))}
                </tr>
                {dataTable.map((row,index) => {
                return (
                    <tr key={index}>
                    {tableHaderColumns.map((column) => {
                        const value = row[column.id];
                        if(column.id=='location'){
                          return (
                            <td key={column.id} align={column.align} style={{overflowWrap: 'anywhere', backgroundColor: '#eaff8b', cursor:'pointer' }} onClick={()=>setShowDetail(row)}>
                                {value}
                            </td>
                          );
                        }
                        if(column.id=='action'){
                          return (
                            <td key={column.id} align={column.align} style={{overflowWrap: 'anywhere',backgroundColor:'#DDD'}}>
                                <Button variant="contained" color="primary" size="small" onClick={()=>{setIsOpenCountingModal(true);setInputLocation(row.location);}} style={{marginRight:5}}><Style /> count</Button>
                                <Button variant="contained" color="secondary" size="small" onClick={()=>{setIsOpenSortingModal(true);setInputLocation(row.location);}}><Sort/> sort</Button>
                            </td>
                          )
                        }
                        return (
                          <td key={column.id} align={column.align} style={{padding:5, overflowWrap: 'anywhere', backgroundColor: (value=="-"||value==""||column.id=='location'||column.id=='action')? '#FFF' : '#5454ff' }}>
                              {/* {value} */}
                          </td>
                        );
                    })}
                    </tr>
                );
                })}
              </table>
            )
          }
        </Paper>

        {/* countingModal modal */}
        <Dialog maxWidth='lg' onClose={()=>{setIsOpenCountingModal(false);setInputLocation(null);}} aria-labelledby="simple-dialog-title" open={isOpenCountingModal}>
          <IconButton style={{position:"absolute",top:-5, right:0}} size='medium' variant="contained" onClick={()=>{setIsOpenCountingModal(false);setInputLocation(null);}} component="span" color="secondary">
              <CancelIcon/>
          </IconButton>
          <DialogTitle>Scan Location Counting</DialogTitle>
          <DialogContent>
              <ScanLocationCounting gateCode={inputLocation} />
          </DialogContent>
        </Dialog>

        {/* sortingmodal */}
        <Dialog maxWidth='lg' onClose={()=>{setIsOpenSortingModal(false);setInputLocation(null);}} aria-labelledby="simple-dialog-title" open={isOpenSortingModal}>
          <IconButton style={{position:"absolute",top:-5, right:0}} size='medium' variant="contained" onClick={()=>{setIsOpenSortingModal(false);setInputLocation(null);}} component="span" color="secondary">
              <CancelIcon/>
          </IconButton>
          <DialogTitle>Scan Location Sorting</DialogTitle>
          <DialogContent>
              <ScanLocationSorting gateCode={inputLocation} />
          </DialogContent>
        </Dialog>

        {/* show detail */}
        <Dialog maxWidth='lg' onClose={()=>{setShowDetail(null)}} aria-labelledby="simple-dialog-title" open={!!showDatail}>
          {/* <IconButton style={{position:"absolute",top:-5, right:0}} size='medium' variant="contained" onClick={()=>{setShowDetail(null)}} component="span" color="secondary">
              <CloseSharp/>
          </IconButton> */}
          <DialogTitle style={{borderBottom:'1px solid #AAA'}}><center><b>{showDatail&& showDatail['location']}</b></center></DialogTitle>
          <DialogContent>
              <table className='' cellSpacing={1} width='100%'>
                {tableHaderColumns.filter(v=>v.id!='location'&&v.id!='action').map((column) => 
                  <tr style={{borderBottom:'0.1px solid #CCC'}}>
                    <td align='right' style={{padding:'2px 10px'}}>{column.id}</td>
                    {/* <td align='center'> <b>{'\u00a0\u00a0\u00a0|\u00a0\u00a0\u00a0'}</b> </td> */}
                    <td align='left' style={{padding:'2px 10px',backgroundColor:(showDatail&& showDatail[column.id]=="-"||showDatail&& showDatail[column.id]=="")? '#FFF' : '#7E7EFF' }}>{showDatail&& showDatail[column.id]}</td>
                  </tr>
                )}
              </table>
          </DialogContent>
        </Dialog>

        {toast.open &&
        <Snackbar anchorOrigin={{ vertical:'top', horizontal:'center' }} open={toast.open} autoHideDuration={5000} onClose={()=>setToast({msg:"",open:false,type:""})}>
          <Alert elevation={6} variant="filled" onClose={()=>setToast({msg:"",open:false,type:""})} severity={toast.type}>
            {toast.msg}
          </Alert>
        </Snackbar>
        }
      </Grid>
    </Grid>
  )
}

export default ViewStorageUsed