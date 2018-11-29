import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, Button, CardBody, Input} from 'reactstrap';
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import Popup from 'reactjs-popup'
import {createQueryString} from '../../ComponentCore'
import ReactTable from 'react-table'


function isInt(value) {
    return !isNaN(value) && 
           parseInt(Number(value)) == value && 
           !isNaN(parseInt(value, 10));
  }

class ObjectSize extends Component{
    constructor(props) {
        super(props);

        this.state = {
            colsMap:[
                {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
                {accessor: 'Code', Header: 'Code', editable:false, filterable:false},
                {accessor: 'Name', Header: 'Name', editable:false, filterable:false},
                {accessor: 'Description', Header: 'Description', editable:false, filterable:false},
                {accessor: 'MinQuantity', Header: 'Minimun Quantity', editable:true,Filter:"text",datatype:"int"},
                {accessor: 'MaxQuantity', Header: 'Maximun Quantity', editable:true,Filter:"text",datatype:"int"},
            ],
            data : [],
            autocomplete:[],
            statuslist:[{
                'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
                'header' : 'Status',
                'field' : 'Status',
                'mode' : 'check',
            }],
            
            acceptstatus : false,
            select:{queryString:window.apipath + "/api/viw",
                t:"ObjectSizeMaster",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,Code,Name,Description,ObjectType,MinWeigthKG,MaxWeigthKG,Status,Created,Modified",
                g:"",
                s:"[{'f':'Code','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            },
            selectMapChild:{queryString:window.apipath + "/api/mst",
                t:"ObjectSizeMap",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,OuterObjectSize_ID,InnerObjectSize_ID,MinQuantity,MaxQuantity,Status",
                g:"",
                s:"[{'f':'ID','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            },
            sortstatus:0,
            Root_ID:0,
            open: false,
            selectdata:[],
            selectMapData:[],
            dataUpdate:[],
            rowselect:[],
            enumfield:["ObjectType"]
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.uneditcolumn = ["Created","Modified"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.getData = this.getData.bind(this)
        this.setObjectSizeMap = this.setObjectSizeMap.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.createMapBtn = this.createMapBtn.bind(this)
        this.inputTextEditor = this.inputTextEditor.bind(this)
    }

    componentWillUnmount(){
        Axios.isCancel(true);
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }

     componentWillMount(){
         this.filterList()
    }

    filterList(){
        const objTypeSelect = {queryString:window.apipath + "/api/enum/StorageObjectType"}
        const objType = []
        Axios.all([Axios.get(createQueryString(objTypeSelect))]).then(
            (Axios.spread((result) => 
        {
            result.data.forEach(row => {
                objType.push({ID:row.value,Code:row.name})
            })

            let ddl = [...this.state.autocomplete]
            let objTypeList = {}
            objTypeList["data"] = objType
            objTypeList["field"] = "ObjectType"
            objTypeList["pair"] = "ObjectType"
            objTypeList["mode"] = "Dropdown"
            ddl = ddl.concat(objTypeList)
            this.setState({autocomplete:ddl})
        })))
        
    } 

    getData(Root_ID){
        const selectdata = []
        const selectMapdata = []
        Axios.get(createQueryString(this.state.select)).then((response) => {
            response.data.datas.forEach(row => {
                selectdata.push({
                    ID:row.ID
                    ,Code:row.Code
                    ,Name:row.Name
                    ,Description:row.Description
                    ,Check:false
                    ,ObjSize_ID:null
                    ,ObjSizeMap_ID:0})
            })
            this.setState({selectdata})
            Axios.get(createQueryString(this.state.selectMapChild)).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectMapdata.push({
                        ID:row.ID
                        ,OuterObjectSize_ID:row.OuterObjectSize_ID
                        ,InnerObjectSize_ID:row.InnerObjectSize_ID
                        ,MinQuantity:row.MinQuantity
                        ,MaxQuantity:row.MaxQuantity
                        ,Status:row.Status})
                })
                this.setState({selectMapdata},() => this.setObjectSizeMap(Root_ID))
            })
        })
    }
       
    setObjectSizeMap(data){
        if(!this.state.open){
            let selectdata = []
            let selectMapdata = []

            selectdata = this.state.selectdata
            selectMapdata = this.state.selectMapdata
            if(selectMapdata !== undefined){
                var index = selectMapdata.length-1
                while ( index>= 0) {
                    if (selectMapdata[index].OuterObjectSize_ID !== data) {
                        selectMapdata.splice(index, 1);
                    }              
                    index -= 1;
                }
                selectdata.forEach(rowRoot =>{
                    selectMapdata.forEach(rowChild => {
                        if(rowRoot.ID===rowChild.InnerObjectSize_ID){
                            rowRoot.ObjSize_ID = rowChild.InnerObjectSize_ID
                            rowRoot.ObjSizeMap_ID = rowChild.ID
                            if(rowChild.Status === 1){
                                rowRoot.Check = true
                            }
                        }
                    })
                })
                this.setState({Root_ID:data})
                this.setState({selectdata})
                this.setState({selectMapdata})
            }
            this.openModal()
        }
    }

    openModal(){
        this.setState({ open: true })
      }

    closeModal() {
        this.setState({ open: false })
        this.setState({dataUpdate:[]})
    }

    getSelectionData(data){
        let obj = []
        data.forEach((datarow,index) => {
            obj.push({"ID":datarow.ID});
        })
        const ObjStr = JSON.stringify(obj)
        this.setState({barcodeObj:ObjStr})
    }

    createMapBtn(rowdata){
        return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
          onClick={() => this.getData(rowdata.ID)}>Map Size</Button>
        }
    
    updateObjSizeMap(){
        const dataUpdate = this.state.dataUpdate
        if(dataUpdate.length > 0){
            dataUpdate.forEach((row) => {
                row["ID"] = row["ID"] <= 0 ? null : row["ID"]
            })
            let updjson = {
                "_token": sessionStorage.getItem("Token"),
                "_apikey": null,
                "t": "ams_ObjectSizeMap",
                "pk": "ID",
                "datas": dataUpdate,
                "nr": false
            }
            Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
            })
            this.setState({dataUpdate:[]})
            this.closeModal()
        }
    }

    createSelection(rowdata,type){
        return <input
        className="selection"
        type={type}
        name="selection"
        defaultChecked = {rowdata.original.Check}
        onChange={(e)=> this.onHandleSelection(rowdata, e.target.checked, type)}/>
    }

    onHandleSelection(rowdata, value, type){
        if(type === "checkbox"){
            const dataUpdate = this.state.dataUpdate
            if(dataUpdate.length > 0){
                dataUpdate.forEach((row,index) => {
                    if(row.InnerObjectSize_ID === rowdata.original.ID){
                        dataUpdate.splice(index,1)
                    }
                })
            }
            if(value){
                if(rowdata.original.ObjSize_ID === null){
                    dataUpdate.push({
                        ID:0
                        ,OuterObjectSize_ID:this.state.Root_ID
                        ,InnerObjectSize_ID:rowdata.original.ID
                        ,Status:1})
                }else{
                    dataUpdate.push({
                        ID:rowdata.original.ObjSizeMap_ID
                        ,OuterObjectSize_ID:this.state.Root_ID
                        ,InnerObjectSize_ID:rowdata.original.ID
                        ,Status:1})
                }
            }
            else{
                if(rowdata.original.ObjSize_ID === null){
                    dataUpdate.push({
                        ID:0
                        ,OuterObjectSize_ID:this.state.Root_ID
                        ,InnerObjectSize_ID:rowdata.original.ID
                        ,Status:0})
                }else{
                    dataUpdate.push({
                        ID:rowdata.original.ObjSizeMap_ID
                        ,OuterObjectSize_ID:this.state.Root_ID
                        ,InnerObjectSize_ID:rowdata.original.ID
                        ,Status:0})
                }
            }
            this.setState({dataUpdate})
        }
    }

    onEditorValueChange(rowdata, value, field) {
        const data = [...this.state.selectdata];
        if(rowdata.column.datatype === "int"){
          let conv = value === '' ? 0 : value
          const type = isInt(conv)
          if(type){
            data[rowdata.index][field] = (conv === 0 ? null : conv);
          }
          else{
            alert("เฉพาะตัวเลขเท่านั้น")
          }
        }
        else{
          data[rowdata.index][field] = value;
        }
        this.setState({ data });
        const dataUpdate = [...this.state.dataUpdate];
        dataUpdate.forEach((datarow,index) => {
          if(datarow.InnerObjectSize_ID === data[rowdata.index]["ID"]){
            dataUpdate[index][field] = value
          }
        })
        this.setState({dataUpdate});
    }

    inputTextEditor(rowdata) {
        return <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
        onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />;
      }

    render(){
        const cols = [
          {accessor: 'Code', Header: 'Code', editable:true, Filter:"text", fixed: "left"},
          {accessor: 'Name', Header: 'Name', editable:true, Filter:"text", fixed: "left"},
          //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
          {accessor: 'ObjectType', Header: 'Object Type',updateable:false,Filter:"text", Type:"autocomplete"},
          {accessor: 'MinWeigthKG', Header: 'Minimun Weigth(Kg.)', editable:true,Filter:"text",datatype:"int"},
          {accessor: 'MaxWeigthKG', Header: 'Maximun Weigth(Kg.)', editable:true,Filter:"text",datatype:"int"},
          {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
          {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
          {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Map", btntext:"Map"},
          {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
        ]; 

        const btnfunc = [{
            btntype:"Map",
            func:this.createMapBtn
          }]

        const col = this.state.colsMap
        col.forEach((row) => {
            if(row.Type === "selection"){
                row.Cell = (e) => this.createSelection(e,"checkbox")
                row.className="text-center"
            }
            if(row.editable && row.insertable){
                row.Cell = (e) => {
                    if(e.original.ID<1)
                    return this.inputTextEditor(e)
                    else
                    return <span>{e.value}</span>
                }
            }
            else if(row.editable && (row.body === undefined || !row.body)){
            row.Cell = (e) => (this.inputTextEditor(e))
            }
        })
    
        return(
          <div>
          <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                  btn={btnfunc} filterable={true} autocomplete={this.state.autocomplete} accept={true} uneditcolumn={this.uneditcolumn}
            table="ams_ObjectSize" enumfield={this.state.enumfield}/>

            <Popup open={this.state.open} onClose={this.closeModal}>
                <div>
                    <ReactTable columns={this.state.colsMap} minRows={3} data={this.state.selectdata} sortable={false} style={{background:'white','max-height': '400px'}} 
                    getselection={this.getSelectionData} showPagination={false}/>
                    <Card>
                        <CardBody>
                            <Button onClick={() => this.updateObjSizeMap()} color="danger" style={{ background: "#26c6da", borderColor: "#26c6da ", width: '130px' }} className="float-left">Save</Button>
                        </CardBody>
                    </Card>
                </div>
            </Popup>
          </div>
        )
    }
}
export default ObjectSize;
