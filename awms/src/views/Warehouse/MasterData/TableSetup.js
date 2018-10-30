import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import {Input, Card, Button, CardBody} from 'reactstrap';
import ReactTable from 'react-table'
//import Axios from 'axios';
import ReactAutocomplete from 'react-autocomplete';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import guid from 'guid';
import hash from 'hash.js';
import {EventStatus, DocumentStatus, DocumentEventStatus, Status} from '../Status'
import Select from 'react-select'
import {apicall, createQueryString} from '../ComponentCore'
import _ from 'lodash'
import Downshift from 'downshift'
import '../componentstyle.css'
import withFixedColumns from "react-table-hoc-fixed-columns";

const ReactTableFixedColumns = withFixedColumns(ReactTable);
const Axios = new apicall()

/* const getColumnWidth = (rows, accessor, headerText) => {
  const maxWidth = 500
  const magicSpacing = 10
  let cellLength = 10
  if(rows > 0 && rows !== undefined){
    cellLength = Math.max(
      ...rows.map(row => (`${row[accessor]}` || '').length),
      headerText.length,)
  }
  return Math.min(maxWidth, cellLength * magicSpacing)
} */

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

const createQueryStringStorage = (url,field,order) => {
  let sortfield = new RegExp("([?&]).*?(&|$)", "i");
  let sortorder = new RegExp("([?&]).*?(&|$)", "i");
  const urledit = url.replace(sortfield, "$1s_f=" + field + '$2').replace(sortorder, "$1s_od=" + order + '$2')
  return urledit;
}

const createQueryStringPage = (url, size) => {
  let sortskip = new RegExp("([?&]).*?(&|$)", "i");
  const urledit = url.replace(sortskip, '$1' + "sk" + "=" + size + '$2')
  return urledit;
}

class TableGen extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      dataedit : [],
      dropdownvalue:[],
      dropdownfilter:[],
      status:"*",
      datafilter :[],
      select:{},
      addbtn: this.props.addbtn,
      printbtn: this.props.printbtn,
      loading:true,
      pagination:1,
      update:this.props.accept,
      dataSuggestions:null,
      uneditable:[],
      datetime:moment(),
      autocomplete:[],
      rowselect:[],
      selectAll:false,
      accept:this.props.accept,
      currentPage: 1,
    };

    this.customSorting = this.customSorting.bind(this);
    this.onHandleClickAdd = this.onHandleClickAdd.bind(this);
    this.removedata = this.removedata.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.paginationButton = this.paginationButton.bind(this)
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.datePickerBody = this.datePickerBody.bind(this)
    this.onEditDateChange = this.onEditDateChange.bind(this)
    this.datetimeBody = this.datetimeBody.bind(this)
    this.onHandleSelection = this.onHandleSelection.bind(this)
    this.autoGenLocationCode = this.autoGenLocationCode.bind(this)
    this.autoGenBaseCode = this.autoGenBaseCode.bind(this)
    this.onEditValueAutoCode = this.onEditValueAutoCode.bind(this)
    this.createAutoCompleteDownshift = this.createAutoCompleteDownshift.bind(this)
    
    this.data = []
    this.sortstatus=0
    this.order=0
    this.addkey=0
  }

  componentWillReceiveProps(nextProps){
    if(this.props.areamaster){
      if(!_.isEqual(nextProps.data, this.state.dataselect))
      this.queryInitialData(nextProps.data);
    }
    else{
      this.queryInitialData(nextProps.data);
    }
    this.setState({dropdownfilter:nextProps.ddlfilter, autocomplete:nextProps.autocomplete,})
  }

  componentDidUpdate(){
    console.log(this.state.data)
    if(this.props.updData)
      this.props.updData(this.state.updateData)
    if(this.props.rmvData)
      this.props.rmvData(this.state.removedata)
    if(this.props.chkData)
      this.props.chkData(this.state.data)
  }

  componentWillUpdate(nextProps, nextState){
    if(!_.isEqual(this.state.data, nextState.data)){
      this.setState({rowselect:[]}, () => {
        var arr = Array.from(document.getElementsByClassName('selection'));
        arr.forEach(row => {
          row.checked = false
        })
      })
    }
  }

  queryInitialData(data){
    if(data){
      if(this.props.url === null || this.props.url === undefined){
        const dataselect = data
        this.setState({dataselect:dataselect})
        let queryString = createQueryString(data)
        Axios.get(queryString).then(
        (res) => {
          this.setState({data:res.data.datas,loading:false})
        })        
      }
      else{
        Axios.get(this.props.url).then(
          (res) => {
              this.setState({data:res.data.datas,loading:false})
          })
      }
    }
  }

  componentDidMount(){
    
    if(this.props.data){
      this.queryInitialData(this.props.data);
      this.setState({originalselect:this.props.data.q})
    }
    else{
      this.setState({loading:false})
    }
  }
  
  componentWillUnmount(){
  }

  onHandleClickCancel(event){
    this.setState({dataedit:[]})
    this.queryInitialData(this.state.dataselect);
  }
  
  removedata(rowdata){
    /* const data = [...this.state.data]; */
    const dataedit = [...this.state.dataedit];
    dataedit.forEach((datarow,index) => {
      if(datarow.ID === rowdata.ID){
        dataedit.splice(index,1);
      }
    })
    rowdata.Status = 2
    dataedit.push(rowdata);
    /* data.forEach((datarow,index) => {
      if(datarow.ID === rowdata.ID){
        data.splice(index,1);
      }
    })
    this.setState({ data }); */
    this.setState({dataedit});
  }

  onCheckFliter(filter,dataselect){
    let filterlist = []
    if(this.props.defaultCondition){
      filterlist = this.props.defaultCondition
    }
    else{
      filterlist = [{"f":"Status", "c":"<", "v": 2}]
    }
    
    if(filter.length > 0)
    {
      filter.forEach((data, id) => {
        if(data[1] !== ""){

          if(data["value"].includes("*")){
            filterlist.forEach((row, index) => {
              if(row.f === data["id"]){
                filterlist.splice(index,1)
              }
            })
            
            if(data["id"] === "Status"){
              filterlist.push({"f":data["id"], "c":"<", "v": 2})
            }
            else{
              filterlist.push({"f":data["id"], "c":"like", "v": encodeURIComponent(data["value"])})
            }
          }
          else if(data["value"].includes("%")){
            filterlist.forEach((row, index) => {
              if(row.f === data["id"]){
                filterlist.splice(index,1)
              }
            })

            if(data["id"] === "Status"){
              filterlist.push({"f":data["id"], "c":"<", "v": 2})
            }
            else{
              filterlist.push({"f":data["id"], "c":"like", "v": encodeURIComponent(data["value"])})
            }
          }
          else{
            filterlist.forEach((row, index) => {
              if(row.f === data["id"]){
                filterlist.splice(index,1)
              }
            })
            filterlist.push({"f":data["id"], "c":"=", "v": encodeURIComponent(data["value"])})
          }
        }
      })
      
      let select = dataselect
      select["q"] = JSON.stringify(filterlist)
      let queryString = createQueryString(select)
      Axios.get(queryString).then(
        (res) => {
          this.setState({data:res.data.datas, loading:false});
        }
      )
    }
    else{
      const select = dataselect
      select["q"] = this.state.originalselect
      let queryString = createQueryString(select)
      Axios.get(queryString).then(
          (res) => {
            this.setState({data:res.data.datas, loading:false});
          }
      )
    }
  }

  onHandleClickAdd(event){
    event.preventDefault();
    let adddata = [...this.state.data]
    let cretdata = {}
    const col = this.props.column
    const getcol = this.state.dataselect.f.split(",")
    getcol.forEach(row => {
      cretdata.ID = this.addkey
      if(row === 'Status'){
        cretdata.Status = 1
      }
      else{
        cretdata[row] = ""
      }

    })
    col.forEach(row => {
      if(row.dateformat === 'datetime' || row.dateformat === 'date'){
        let date = new Date();
        cretdata[row.accessor] = date
      }
    })
    adddata.push(cretdata)
    this.addkey += -1
    
    this.setState({data:adddata.sort((a,b) => a.ID - b.ID)});
  }

  updateData(){
      const dataedit = this.state.dataedit
      if(dataedit.length > 0){
        dataedit.forEach((row) => {
          row["ID"] = row["ID"] <= 0 ? null : row["ID"]
          this.props.column.forEach(col => {
            if(col.datatype === "int" && row[col.accessor] === ""){
              if(col.accessor === "Revision"){
                if(row[col.accessor] === ""){
                  row[col.accessor] = 1
                }
              }
              else{
                row[col.accessor] = null
              }
            }
            
            if(col.accessor === "Password"){
              var guidstr = guid.raw().toUpperCase()
              var i = 0, strLength = guidstr.length;
              for(i; i < strLength; i++) {
              
                guidstr = guidstr.replace('-','');
              
              }
              console.log(guidstr)
              //var guidstr = guid.raw().toUpperCase().replace('-','').toUpperCase();
              row[col.accessor] = "@@sql_gen_password,"+row[col.accessor]+","+guidstr
              row["SoftPassword"] = guidstr
            }
          })

          for(let col of this.props.uneditcolumn){
            delete row[col]
          }
        })
        let updjson = {
          "_token": sessionStorage.getItem("Token"),
          "_apikey": null,
          "t": this.props.table,
          "pk": "ID",
          "datas": dataedit,
          "nr": false
        }
        Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
          this.queryInitialData(this.state.dataselect);
        })
  
        this.setState({dataedit:[]})
      }
  }

  customSorting(data){
    const select = this.props.data
    select["s"] = JSON.stringify([{'f':data[0].id,'od':data[0].desc === false ? 'asc' : 'desc'}])
    let queryString = ""
    if(this.props.url === undefined || null){
      queryString = createQueryString(select)
    }
    else{
      queryString = createQueryStringStorage(this.props.url,data[0].id,data[0].desc === false ? 'asc' : 'desc')
    }
    Axios.get(queryString).then(
    (res) => {
        this.setState({data:res.data.datas, loading:false})
    })
  }

  pageOnHandleClick(position){
    if(this.props.url === undefined || this.props.url === null)
    {
      let queryString = "";
      this.setState({loading:true})
      const select = this.state.dataselect
      if(position === 'next'){
        select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) + parseInt(select.l, 10)
        queryString = createQueryString(select)
      }
      else{
        if(select.sk - select.l >= 0){
          select.sk = select.sk - select.l
        }
        queryString = createQueryString(select)
      }
      Axios.get(queryString).then(
        (res) => {
          if(res.data.datas.length > 0){
            if(position === 'next'){
              ++this.state.currentPage
            }
            else{
              if(this.state.currentPage !== 1)
                --this.state.currentPage
            }
            this.setState({data:res.data.datas})
          }
          else{
            select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) - parseInt(select.l, 10)
          }
          this.setState({loading:false})
        }
      )
    }
    else{
      let queryString = "";
      this.setState({loading:true})
      let select = this.state.pageSize
      if(position === 'next'){
        select = parseInt(select === "" ? 0 : select, 10) + parseInt(select, 10)
        queryString = createQueryStringPage(this.props.url, select)
        this.setState({pageSize:select})
      }
      else{
        if(select - 10 >= 0){
          select = select - 10
          this.setState({pageSize:select})
        }
        queryString = createQueryStringPage(this.props.url, select)
      }
      Axios.get(queryString).then(
        (res) => {
          if(res.data.datas.length > 0){
            this.setState({data:res.data.datas})
          }
          this.setState({loading:false})
        }
      )
    }
  }

  paginationButton(){
    return(
      <div style={{ marginBottom: '3px', textAlign: 'center', margin: 'auto', width: '300px' }}>
        <nav>
          <ul className="pagination">
            <div></div>
            <li className="page-item"><a className="page-link" style={{ background: "#cfd8dc", width: '100px' }}
              onClick={() => this.pageOnHandleClick("prev")}>
            Previous</a></li>
            <li className="page-item"><a className="page-link" style={{ background: "#eceff1", width: '100px' }}
              onClick={() => this.pageOnHandleClick("next")}>
              Next</a></li>
          </ul>
          <p className="float-central" style={{ width: "200px" }}>  PAGE : {this.state.currentPage}</p>
        </nav>
      </div>
    )
  }

  createSelectButton(event){
    return <input type="checkbox"/>
  }

  createDropdownFilter(name,func,selectdata){
    let filter = [...this.state.datafilter]
    let item = null
    let list = null
    this.props.dropdownfilter.forEach(row => {
      if(row.field === name){
        item = row.status.map((data, index) => {
          return <option key={index} value={data.value}>{data.label}</option>
        })
        list = <select style={{ background:"#FAFAFA" }} onChange={(e) => {
          filter.forEach((datarow,index) => {
            if(datarow.id === name){
                filter.splice(index,1);
            }
          })
          if(e.target.value !== ""){
              filter.push({id: name, value:e.target.value})
          }
          this.onCheckFliter(filter,this.state.dataselect)
          this.setState({datafilter:filter, loading:true})
        }}>{item}</select>
      }
    })
    return list
  }

  createCustomFilter(name){
    let filter = [...this.state.datafilter]
    return <Input type="text" id={name} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter'){
            filter.forEach((datarow,index) => {
                if(datarow.id === name){
                    filter.splice(index,1);
                }
            })
            if(e.target.value !== ""){
                filter.push({id: name, value:e.target.value})
            }
            this.onCheckFliter(filter,this.state.dataselect)
            this.setState({datafilter:filter, loading:true})
        }}
      } />
  }

  createAutocompleteExtend(){
    const options = [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'strawberry1', label: 'Strawberry1' },
      { value: 'strawberry2', label: 'Strawberry2' },
      { value: 'vanilla', label: 'Vanilla' }
    ]
    return <Select className="menu-outer-top" options={options} onChange={(e) => this.datax = e} value={this.datax}/>
  }

  createCustomButton(type,text,data){
    if (type === "Remove") {
      return <Button type="button" color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '80px' }}
        onClick={() => this.removedata(data)}>Remove</Button>
    }
    else if (type === "Link") {
      return <Button type="button" color="info">{
        <Link style={{ color: '#FFF', textDecorationLine: 'none' }}
          to={data}>{text}</Link>}
      </Button>
    }
    else if (type === "Barcode") {
      return <Button type="button" color="info">{<Link style={{ color: '#FFF', textDecorationLine: 'none' }}
        to={'/mst/sku/manage/barcode?barcode=' + data.Code + '&Name=' + data.Name}>Print</Link>}</Button>
    }
 
  }

  datetimeBody(value){
    if(value !== null){
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY HH:mm')}</div>
    }
  }
  
  checkboxBody(rowdata){
    return <input
    type="checkbox"
    className="checkbox"
    contentEditable
    suppressContentEditableWarning
    checked={rowdata.value === 1 || rowdata.value === true} 
    onChange={ (e) => {
      this.onEditorValueChange(rowdata , e.target.checked === false ? 0 : 1, rowdata.column.id)
    }}/>
  }
  
  leadingZero(size,num) {
    var sign = Math.sign(num) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(num)]).join('0').slice(-size);
  }

  datePickerBody(format, value, rowdata){
    const date = moment(value);
    if(format === 'date')
    {
      return <DatePicker selected={date}
        customInput={<Input/>}
        onChange={(e) => {this.onEditDateChange(e, rowdata)}}
        onChangeRaw={(e) => {
          if (moment(value).isValid())
               this.onEditDateChange(e, rowdata);
       }}/>
    }
    else if(format === 'datetime'){
      return <DatePicker selected={date}
        customInput={<Input/>}
        onChange={(e) => {this.onEditDateChange(e, rowdata)}}
        onChangeRaw={(e) => {
          if (moment(e.target.value).isValid())
               this.onEditDateChange(e, rowdata);
       }}
        dateFormat="DD/MM/YYYY HH:mm"
        />
    }
    else{
      return <DatePicker selected={date}
        onChange={(e) => {return this.onEditDateChange(e, rowdata)}}
        customInput={<Input/>}
        showTimeSelectOnly
        dateFormat="LT"
        timeCaption="Time"/>
    }
  }
  
  onEditDateChange(value, rowdata){
    const dateformat = moment(value).format('YYYY-MM-DDTHH:mm')
    this.onEditorValueChange(rowdata ,dateformat, rowdata.column.id)
  }

  inputTextEditor(rowdata) {
    return <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />;
  }

  onEditValueAutoCode(rowdata,value,field){
    console.log(rowdata+":"+value+":"+field)
    if (field==="Bank"){
      var codestr = (this.props.autocode)+","+value+","+rowdata.row["Bay"]+","+rowdata.row["Level"]
    }else if(field==="Bay"){
      var codestr = (this.props.autocode)+","+rowdata.row["Bank"]+","+value+","+rowdata.row["Level"]
    }else if(field==="Level"){
      var codestr = (this.props.autocode)+","+rowdata.row["Bank"]+","+rowdata.row["Bay"]+","+value
    }else if(field==="Gate"){
      var codestr = (this.props.autocode)+","+value
    }
    this.onEditorValueChange(rowdata, this.props.areamaster,"AreaMaster_ID")
    this.onEditorValueChange(rowdata, codestr, "Code")
    this.onEditorValueChange(rowdata, value, rowdata.column.id)
  }

  autoGenLocationCode(rowdata){
    return <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.onEditValueAutoCode(rowdata,e.target.value,rowdata.column.id)}} />
  }
  autoGenBaseCode(rowdata){
    if(rowdata.row["Code"] === "" && rowdata.row["BaseMasterType_Code"] !== ""){
      var codestr=this.props.autocode+","+rowdata.original["BaseMasterType_ID"]

      this.onEditorValueChange(rowdata, codestr, rowdata.column.id)

    }else{
      var rowBaseCode = rowdata.row["Code"]
      if(!rowBaseCode.includes(this.props.autocode)){
        return <span>{rowdata.row["Code"] === null ? "" : rowdata.row["Code"]}</span>;
      }
    }
  }

  inputPassword(rowdata){
    return <Input type="password" maxLength="8" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />
  }

  onEditorValueChange(rowdata, value, field) {
    const data = [...this.state.data];
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
    const dataedit = [...this.state.dataedit];
    dataedit.forEach((datarow,index) => {
      if(datarow.ID === data[rowdata.index]["ID"]){
        dataedit.splice(index,1);
      }
    })
    dataedit.push(data[rowdata.index]);
    this.setState({dataedit});
  }

  createAutoCompleteDownshift(rowdata){
    const getdata = this.state.autocomplete.filter(row=>{
      return row.field  === rowdata.column.id
    })
    return <div style={{display: 'flex',flexDirection: 'column',}}>
    <Downshift
      initialInputValue = {rowdata.value === "" || rowdata.value === undefined ? "" : rowdata.value}
      onChange={(selection) => {
        if(selection){
          rowdata.value = selection.ID
          this.onEditorValueChange(rowdata, selection.Code, rowdata.column.id)
          this.onEditorValueChange(rowdata, selection.ID, getdata[0].pair)
        }
        else{
          rowdata.value = ""
          this.onEditorValueChange(rowdata, "", rowdata.column.id)
          this.onEditorValueChange(rowdata, "", getdata[0].pair)
        }
      }
    }
    itemToString={(item) => { 
      let getinit = getdata[0].data.filter(item => item.Code === rowdata.value)
      return item !== null ? item.Code : getinit === null ? null : getinit.Code ;
    }}
  >
    {({
      getInputProps,
      getItemProps,
      getMenuProps,
      isOpen,
      openMenu,
      inputValue,
      highlightedIndex,
      selectedItem,
      clearSelection,
    }) => (
      <div style={{width: '150px'}}>
        <div style={{position: 'relative'}}>
                <Input style={{paddingLeft:"20px"}}
                  {...getInputProps({
                    onChange: e => {
                      if (e.target.value === '') {
                        clearSelection()
                      }
                    },
                    isOpen:true,
                    onFocus:()=>openMenu(),
                  })}
                />
              </div>
              <div style={{position: 'absolute', zIndex:'1000'}}>
                <div {...getMenuProps({isOpen})} style={{position: 'absolute'}}>
                  {isOpen
                    ? getdata[0].data
                      .filter(item => !inputValue || item.Code.includes(inputValue))
                      .map((item, index) => (
                        <div style={{background:'white', width:'150px'}}
                          key={item.ID}
                          {...getItemProps({
                            item,
                            index,
                            style: {
                              backgroundColor:highlightedIndex === index ? 'lightgray' : 'white',
                              fontWeight: selectedItem === item ? 'bold' : 'normal',
                              width:'150px',
                              border:"1px solid black "
                            }
                          })}
                        >
                          {item ? item.Code : ''}
                        </div>
                      ))
                    : null}
                </div>
              </div>
      </div>
    )}
  </Downshift></div>
  }

  createAutocomplete(rowdata){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
    zIndex: '998',}
    if(this.state.autocomplete.length > 0){
      const getdata = this.state.autocomplete.filter(row=>{
        return row.field  === rowdata.column.id
      })
      if(getdata.length > 0){
        return <ReactAutocomplete 
        menuStyle={style}
        getItemValue={(item) => item.Code}
        items={getdata[0].data}
        shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.Code} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.Code}
          </div>
        }
        value={rowdata.value}
        onChange={(e) => {
          this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)
        }}
        onSelect={(val, row) => {
          this.onEditorValueChange(rowdata, row.Code, rowdata.column.id)
          this.onEditorValueChange(rowdata, row.ID, getdata[0].pair)
        }}
      />
      }
    }
  }

  onHandleSelection(rowdata, value, type){
    if(type === "checkbox"){
      let rowselect = this.state.rowselect;
      if(value){
        rowselect.push(rowdata.original)
      }
      else{
        rowselect.forEach((row,index) => {
          if(row.ID === rowdata.original.ID){
            rowselect.splice(index,1)
          }
        })
      }
      this.setState({rowselect}, () => {this.props.getselection(this.state.rowselect)})
    }
    else{
      let rowselect = [];
      if(value){
        rowselect.push(rowdata.original)
      }
      this.setState({rowselect:rowselect}, () => {this.props.getselection(this.state.rowselect)})
    }
  }

  createStatusField(data, type){
    if (type === "EventStatus") {

      return <span>
        {
          EventStatus.filter(row => {
            return row.code === data
          })[0].status
        }

        

      </span>
    }
    else if(type === "DocumentStatus"){
      return <span>
      {
        DocumentStatus.filter(row => {
          return row.code === data
        })[0].status
      }
      </span>
    }
    else if(type === "DocumentEvent"){
      return <span>
      {
        DocumentEventStatus.filter(row => {
          return row.code === data
        })[0].status
      }
      </span>
    }
    else if(type === "Status"){
      return <span>
      {
        Status.filter(row => {
          return row.code === data
        })[0].status
      }
      </span>
    }
  }

  createSelectAll(){
    return <input
    type="checkbox"
    onChange={(e)=> {
      this.props.getselection(this.state.data);
      var arr = Array.from(document.getElementsByClassName('selection'));
      if(e.target.checked){
        arr.forEach(row => {
          row.checked = true
        })
      }
      else{
        arr.forEach(row => {
          row.checked = false
        })
      }
    }}/>
  }
  createSelection(rowdata,type){
    return <input
    className="selection"
    type={type}
    name="selection"
    onChange={(e)=> this.onHandleSelection(rowdata, e.target.checked, type)}/>//
  }

  printbarcodeall() {
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
      onClick={() => {
        let obj = []
        this.state.data.forEach((datarow, index) => {
          obj.push({ "barcode": datarow.Code, "Name": datarow.Name });
        })
        const ObjStr = JSON.stringify(obj)
        window.open('/mst/base/manage/barcode?barcodesize=1&barcodetype=qr&barcode=' + ObjStr)
      }}>Print</Button>


  }

 

  render(){
    const col = this.props.column
      col.forEach((row) => {
          //set กล่อง Filter
          //row.width = getColumnWidth(this.state.data, row.accessor, row.Header)

          if(row.Filter === "text"){
            row.Filter = () => this.createCustomFilter(row.accessor,row)
          }
          else if(row.Filter === "dropdown"){
            row.Filter = () => this.createDropdownFilter(row.accessor,this.state.dataselect)
          }
          else if(row.Filter === "select"){
            row.Filter = (e) => this.createSelectAll()
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
 
                 
          if(row.Type === "datetime"){
            if(row.editable === true)
              row.Cell = (e) => this.datePickerBody(row.dateformat,e.value, e)
            else
              row.Cell = (e) => this.datetimeBody(e.value)
          }
          else if(row.Type === "checkbox"){
              row.Cell = (e) => this.checkboxBody(e)
              row.className="text-center"
          }
          else if(row.Type === "autolocationcode" && (row.body === undefined || !row.body)){
              row.Cell = (e) => (this.autoGenLocationCode(e))
              row.className="text-center"
          }
          else if(row.Type === "autobasecode" && (row.body === undefined || !row.body)){
            row.Cell = (e) => (this.autoGenBaseCode(e))
            row.className="text-center"
          }
          else if(row.Type === "password"){
            row.Cell = (e) => (this.inputPassword(e))
            row.className="text-center"
          }
          else if(row.Type === "button"){
            this.props.btn.find(btnrow => {
              if (row.btntype === "Remove" && btnrow.btntype) {
                row.Cell = (e) => <Button type="button" style={{ background: "#ef5350", borderColor: "#ef5350"}} color="success"  onClick={() => this.removedata(e.original)}>Remove</Button>
              }
              else{
                if(row.btntype === btnrow.btntype){
                  row.Cell = (e) => btnrow.func(e.original)
                }
              }
            })
          }
          else if(row.Type === "autocomplete"){
            row.Cell = (e) => this.createAutoCompleteDownshift(e)
          }
          else if(row.Type === "selection"){
            row.Cell = (e) => this.createSelection(e,"checkbox")
            row.className="text-center"
          }
          else if(row.Type === "selectrow"){
            row.Cell = (e) => this.createSelection(e,"radio")
            row.className="text-center"
          }
          else if(row.Type === "DocumentStatus"){
            row.Cell = (e) => this.createStatusField(e.value, row.Type)
          }
          else if(row.Type === "EventStatus"){
            row.Cell = (e) => this.createStatusField(e.value, row.Type)
          }
          else if(row.Type === "DocumentEvent"){
            row.Cell = (e) => this.createStatusField(e.value, row.Type)
          }
          else if(row.Type === "Status"){
            row.Cell = (e) => this.createStatusField(e.value, row.Type)
          }

          if(row.Aggregated === "blank"){
            row.Aggregated = (e) => {return (<span></span>);}
          }
          else if(row.Aggregated === "button"){
            row.Aggregated = (e) => this.createCustomButton(row.btntype, row.btntext, e.original)
          }
          else if(row.Aggregated === "select"){
            row.Aggregated = (e) => this.createSelectButton(e.row._subRows[0]._original)
          }
        })

    return(
      <div style={{ overflowX: 'auto'}}>
        <Button onClick={this.onHandleClickAdd} style={{ width: 200, display: this.state.addbtn === true ? 'inline' : 'none', background: "#66bb6a", borderColor: "#66bb6a" }} type="button" color="success" className="float-right">Add</Button>
        <div className="clearfix"></div>
        <ReactTableFixedColumns
          className="-striped" 
          data={this.state.data} 
          ref={ref => this.tableComponent = ref}
          style={{backgroundColor:'white', zIndex:0}}
          loading={this.state.loading}
          filterable={this.props.filterable}
          columns={col}
          pivotBy={this.props.pivotBy}
          multiSort={false}
          showPagination={true}
          minRows={5}
          defaultPageSize={100}
          SubComponent={this.subTable}
          getTrProps={(state, rowInfo) => {
            let result = false
            let rmv = false
            this.state.dataedit.forEach(row => {
              if(rowInfo && rowInfo.row){
                if(row.ID === rowInfo.original.ID){
                  result = true
                  if(row.Status === 2){
                    rmv = true
                  }
                }
              }
            })
            if(result && !rmv )
              return {style:{background:"gray"}}
            else if (rmv)
              return {style:{background:"red"}}
            else
              return {}              
          }}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
              this.setState({data:[],dataedit:[], loading:true });
              this.customSorting(sorted)}
          }/>
        <Card style={{display:this.state.accept === true ? 'inlne-block' : 'none',textAlign:'right'}}>
          <CardBody>
            <Button onClick={() => this.updateData()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }}   className="float-right">Accept</Button>
            <Button onClick={() => this.onHandleClickCancel()} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }} className="float-right">Cancel</Button>
          
          </CardBody>
        </Card>
        <Card style={{ display: this.state.printbtn === true ? 'inlne-block' : 'none', textAlign: 'right' }}>
          <CardBody>
            <Button onClick={() => this.updateData()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px' }} className="float-right">Accept</Button>
            <Button onClick={() => this.onHandleClickCancel()} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }} className="float-right">Cancel</Button>
            <Button onClick={() => this.printbarcodeall() } color="danger" style={{ background: "#26c6da", borderColor: "#26c6da ", width: '130px' }} className="float-left">Print</Button>
         
          </CardBody>
        </Card>


      </div>
    )
  }
}

export {TableGen};
