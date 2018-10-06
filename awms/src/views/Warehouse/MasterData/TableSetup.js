import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import {Input, Card, Button, CardBody} from 'reactstrap';
import ReactTable from 'react-table'
import Axios from 'axios';
import ReactAutocomplete from 'react-autocomplete';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import guid from 'guid';
import hash from 'hash.js';
import Select from 'react-select'

const getColumnWidth = (rows, accessor, headerText) => {
  const maxWidth = 500
  const magicSpacing = 10
  let cellLength = 10
  if(rows > 0 && rows !== undefined){
    cellLength = Math.max(
      ...rows.map(row => (`${row[accessor]}` || '').length),
      headerText.length,)
  }
  return Math.min(maxWidth, cellLength * magicSpacing)
}

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

const createQueryString = (select,wherequery) => {
  let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
  + (select.q === "" ? "" : "&q=" + select.q)
  + (select.f === "" ? "" : "&f=" + select.f)
  + (select.g === "" ? "" : "&g=" + select.g)
  + (select.s === "" ? "" : "&s=" + select.s)
  + (select.sk === "" ? "" : "&sk=" + select.sk)
  + (select.l === 0 ? "" : "&l=" + select.l)
  + (select.all === "" ? "" : "&all=" + select.all)
  return queryS
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
      addbtn:this.props.addbtn,
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
    this.autoGenCode = this.autoGenCode.bind(this)
    
    this.data = []
    this.sortstatus=0
    this.order=0
    this.addkey=0
  }

  componentWillReceiveProps(nextProps){
    this.queryInitialData();
    this.setState({dropdownfilter:nextProps.ddlfilter, autocomplete:nextProps.autocomplete,})
  }

  componentDidUpdate(){
    if(this.props.updData)
      this.props.updData(this.state.updateData)
    if(this.props.rmvData)
      this.props.rmvData(this.state.removedata)
    if(this.props.chkData)
      this.props.chkData(this.state.data)
  }

  queryInitialData(){
    if(this.props.url === null || this.props.url === undefined){
      const dataselect = this.props.data
      this.setState({dataselect:dataselect})
      let queryString = createQueryString(this.props.data)
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

  componentDidMount(){
    this.queryInitialData();
    this.setState({originalselect:this.props.data.q})
  }
  
  componentWillUnmount(){
    Axios.isCancel(true);
  }

  onHandleClickCancel(event){
    this.setState({dataedit:[]})
    this.queryInitialData();
  }
  
  removedata(rowdata){
    const data = [...this.state.data];
    const dataedit = [...this.state.dataedit];
    dataedit.forEach((datarow,index) => {
      if(datarow.ID === rowdata.ID){
        dataedit.splice(index,1);
      }
    })
    rowdata.Status = 2
    dataedit.push(rowdata);
    data.forEach((datarow,index) => {
      if(datarow.ID === rowdata.ID){
        data.splice(index,1);
      }
    })
    this.setState({ data });
    this.setState({dataedit});
  }

  onCheckFliter(filter,dataselect, status){
    let filterlist = [{"f":"Status", "c":"!=", "v": 2}]
    
    if(filter.length > 0)
    {
      filter.forEach((data, id) => {
        if(data[1] !== ""){
          switch(data["value"].toString().charAt(0)){
            case "%":
              filterlist.push({"f":data["id"], "c":"like", "v": encodeURIComponent(data["value"])})
              break
            case "*":
              if(data["id"] !== "Status")
                filterlist.push({"f":data["id"], "c":"=", "v": encodeURIComponent(data["value"])})
              
              break
            default:
              if(data["id"] === "Status"){
                filterlist.splice(0,1)
                filterlist.push({"f":data["id"], "c":"=", "v": encodeURIComponent(data["value"])})
              }
              else
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
    let adddata = this.state.data
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
              var guidstr = guid.raw().toUpperCase().replaceAll('-','').toUpperCase();
              var hash256password = hash.sha256().update((hash.sha256().update(row[col.accessor]).digest('hex').toUpperCase())+guidstr).digest('hex').toUpperCase()
              row[col.accessor] = hash256password
              row["SoftPassword"] = guidstr
            }
          })

          for(let col of this.props.uneditcolumn){
            delete row[col]
          }
        })
        let updjson = {
          "_token": null,
          "_apikey": null,
          "t": this.props.table,
          "pk": "ID",
          "datas": dataedit,
          "nr": false
        }
        Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
          this.queryInitialData();
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
            this.setState({data:res.data.datas})
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
      <div style={{marginBottom:'3px',textAlign:'center',margin:'auto',width:'132px'}}>
        <nav>
          <ul className="pagination">
            <li className="page-item"><a className="page-link" onClick={() => this.pageOnHandleClick("prev")}>Previous</a></li>
            <li className="page-item"><a className="page-link" onClick={() => this.pageOnHandleClick("next")}>Next</a></li>
          </ul>
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
        list = <select onChange={(e) => {
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
    return <Input type="text" id={name}
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
    if(type === "Remove"){
      return <Button type="button" color="danger" onClick={() => this.removedata(data)}>Remove</Button>
    }
    else if(type === "Link"){
      return <Button type="button" color="info">{
        <Link style={{ color: '#FFF', textDecorationLine :'none' }} 
        to={data}>{text}</Link>}
        </Button>
    }
    else if(type === "Barcode"){
      return <Button type="button" color="info">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} 
      to={'/mst/sku/manage/barcode?barcode='+data.Code+'&Name='+data.Name}>Print</Link>}</Button>
    }
  }

  datetimeBody(value){
    if(value !== null){
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
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
      return <DatePicker selected={date} style={{width:'1000px'}}
        onChange={(e) => {this.onEditDateChange(e, rowdata)}}
        onChangeRaw={(e) => {
          if (moment(value).isValid())
               this.onEditDateChange(e, rowdata);
       }}/>
    }
    else if(format === 'datetime'){
      return <DatePicker selected={date}
        onChange={(e) => {this.onEditDateChange(e, rowdata)}}
        onChangeRaw={(e) => {
          if (moment(e.target.value).isValid())
               this.onEditDateChange(e, rowdata);
       }}
        dateFormat="DD/MM/YYYY HH:mm:ss"
        />
    }
    else{
      return <DatePicker selected={date}
        onChange={(e) => {return this.onEditDateChange(e, rowdata)}}
        showTimeSelectOnly
        dateFormat="LT"
        timeCaption="Time"/>
    }
  }
  
  onEditDateChange(value, rowdata){
    const dateformat = moment(value).format('YYYY-MM-DDTHH:mm:ss')
    this.onEditorValueChange(rowdata ,dateformat, rowdata.column.id)
  }

  inputTextEditor(rowdata) {
    return <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />;
  }

  inputText(rowdata) {
    if(rowdata.value !== null && rowdata.value !== ""){
      return <Input type="text" value={rowdata.value === null ? "" : rowdata.value} editable='false' />;
    }else{
      return <Input type="text" value={rowdata.value} 
      onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />;
    }
  }

  autoGenCode(rowdata){
    if(rowdata.row["Bank"] > 0 && rowdata.row["Bay"] > 0 && rowdata.row["Level"] > 0 && (rowdata.row["AreaMaster_Code"] === null ? "" : rowdata.row["AreaMaster_Code"]) !== ""){
      const codeLoc = rowdata.row["AreaMaster_Code"] + this.leadingZero(3,rowdata.row["Bank"]) + 
      this.leadingZero(3,rowdata.row["Bay"]) + this.leadingZero(3,rowdata.row["Level"])
      return <Input type="text" value={codeLoc === null ? "" : codeLoc} editable="false"
          onChange={(e) => {this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id)}} />;
    }else{
      return <span>{rowdata.row["Code"] === null ? "" : rowdata.row["Code"]}</span>;
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
              console.log(e)
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
          else if(row.Type === "autocode" && (row.body === undefined || !row.body)){
              row.Cell = (e) => (this.autoGenCode(e))
              row.className="text-center"
          }
          else if(row.Type === "password"){
            row.Cell = (e) => (this.inputPassword(e))
            row.className="text-center"
          }
          else if(row.Type === "button"){
            this.props.btn.find(btnrow => {
              if(row.btntype === "Remove" && btnrow.btntype){
                row.Cell = (e) => <Button type="button" color="danger" onClick={() => this.removedata(e.original)}>Remove</Button>
              }
              else{
                if(row.btntype === btnrow.btntype){
                  row.Cell = (e) => btnrow.func(e.original)
                }
              }
            })
          }
          else if(row.Type === "autocomplete"){
            row.Cell = (e) => this.createAutocomplete(e)
          }
          else if(row.Type === "selection"){
            row.Cell = (e) => this.createSelection(e,"checkbox")
            row.className="text-center"
          }
          else if(row.Type === "selectrow"){
            row.Cell = (e) => this.createSelection(e,"radio")
            row.className="text-center"
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
      <div style={{overflowX:'auto'}}>
        <Button onClick={this.onHandleClickAdd} style={{width:200, display:this.state.addbtn === true ? 'inline' : 'none'}} type="button" color="success"className="mr-sm-1">Add</Button>
        <ReactTable 
          data={this.state.data} 
          ref={ref => this.tableComponent = ref}
          style={{backgroundColor:'white'}}
          loading={this.state.loading}
          filterable={this.props.filterable}
          columns={col}
          pivotBy={this.props.pivotBy}
          multiSort={false}
          showPagination={true}
          minRows={5}
          SubComponent={this.subTable}
          getTrProps={(state, rowInfo) => {
            let result = false
            this.state.dataedit.forEach(row => {
              if(rowInfo && rowInfo.row){
                if(row.ID === rowInfo.original.ID)
                  result = true
              }
            })
            if(result === true)
              return {style:{background:"gray"}}
            else
              return {}              
          }}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
              this.setState({data:[],dataedit:[], loading:true });
              this.customSorting(sorted)}
          }/>
        <Card style={{display:this.state.accept === true ? 'inlne-block' : 'none'}}>
          <CardBody>
            <Button onClick={() => this.updateData()} color="primary"className="mr-sm-1">Accept</Button>
            <Button onClick={() => this.onHandleClickCancel()} color="danger"className="mr-sm-1">Cancel</Button>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export {TableGen};