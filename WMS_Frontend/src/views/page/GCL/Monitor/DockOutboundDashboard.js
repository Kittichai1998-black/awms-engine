import React, { useState, useEffect, useRef, useMemo } from "react";
import Axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import {Paper,Card ,CardHeader ,CardContent ,Snackbar,CircularProgress,Grid } from '@material-ui/core';
import {Button,TextField, Dialog, DialogActions,DialogContent,DialogContentText,DialogTitle,InputAdornment,Select,MenuItem,InputLabel } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import GCLService from '../../../../components/function/GCLService'
import {AddCircleOutpne,CloseSharp,BrightnessHigh,Extension,Save} from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    paper: {
      height: 130,
      width: 180,
    },
}));

const warehousepst=["W01","W02","W03","W04","W05","W06","W07","W08"]

let intervalGetSPReportAPI=null
const DockOutboundDashboard=(props)=>{
  const classes = useStyles();
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingdataTable, setIsLoadingdataTable] = useState(true);
  const [toast,setToast] = useState({msg:null,open:false,type:null});
  const [warehouse,setWarehouse]=useState("W01")

  useEffect(() => {
    setIsLoadingdataTable(true)
    clearInterval(intervalGetSPReportAPI);
    GCLService.get('/v2/GetSPReportAPI',{spname:'Dock_Outbound_Dashboard',warehouse:warehouse}).then(res=>{
        setIsLoadingdataTable(false)
        if(GCLService.isMockData)return setDataTable(GCLService.mockDataGCL.DockOutboundDashboard)
        if(!res.data._result.status) {
            setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
            return ;
        }
        setDataTable(res.data.datas)
        //auto load data
        intervalGetSPReportAPI=setInterval(()=>{
            GCLService.get('/v2/GetSPReportAPI',{spname:'Dock_Outbound_Dashboard'}).then(res=>{
                if(!res.data._result.status) {
                    setToast({msg:"Load data fail : "+res.data._result.message ,open:true,type:'error'})
                    return ;
                }
                setDataTable(res.data.datas)
            })
        },5000)
    })
    //on component unmount
    return () => {
        clearInterval(intervalGetSPReportAPI);
    }
  }, [warehouse])

  return (
    <Paper elevation={0} style={{width: '100%',height:'100%', padding:10}}>
        {/* <InputLabel id="demo-simple-select-label">Warehouse</InputLabel> */}
        <center>
        <Select
          labepd="demo-simple-select-label"
          id="demo-simple-select"
          value={warehouse}
          onChange={(event)=>{setWarehouse(event.target.value)}}
          style={{minWidth:150}}
        >
            <MenuItem value="" disabled>- Warehouse -</MenuItem>
            {warehousepst.map((value,key)=><MenuItem key={key} value={value}>{ value }</MenuItem>)}
        </Select>
        </center>
        <Grid style={{marginTop:20}}>
            <Grid container justify="center" spacing={2}>
                {!isLoadingdataTable&& dataTable.map((dataItem,key) => (
                    <Grid key={key} item>
                        {/* <Paper elevation={3} className={classes.paper}/> */}
                        <Card elevation={3} className={classes.paper}>
                            <CardHeader subheader={`DOCK ${dataItem.dock}`} style={{borderBottom:'1px dashed #CCC'}}/>
                            <CardContent style={{padding:8}}>
                                {/* <ul style={{padding:0}}> */}
                                    <p><b>SKU</b> : {dataItem.sku}</p>
                                    <p><b>LOT</b> : {dataItem.lot}</p>
                                    <p><b>GRADE</b> : {dataItem.grade}</p>
                                    <p><b>PALLET</b> : {dataItem.pallet}</p>
                                {/* </ul> */}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                
                {(!isLoadingdataTable && dataTable.length<=0) && <Grid xs={8} item><Alert severity='info'>Empty Data</Alert></Grid>}
                {isLoadingdataTable && <Grid xs={8} item style={{backgroundColor:'rgb(232, 244, 253)'}}><center><CircularProgress color='inherit' size={30}/></center></Grid>}
            </Grid>
        </Grid>
    
        {toast.open &&
        <Snackbar anchorOrigin={{ vertical:'top', horizontal:'center' }} open={toast.open} autoHideDuration={5000} onClose={()=>setToast({msg:"",open:false,type:""})}>
            <Alert elevation={6} variant="filled" onClose={()=>setToast({msg:"",open:false,type:""})} severity={toast.type}>
            {toast.msg}
            </Alert>
        </Snackbar>
        }
    </Paper>
  )
}

export default DockOutboundDashboard