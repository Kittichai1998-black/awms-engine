import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import {Input, Card, Button, CardBody} from 'reactstrap';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import {Dropdown as DDLP} from 'primereact/dropdown';
import Axois from 'axios';
import {AutoComplete} from 'primereact/autocomplete';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const createQueryString = (select) => {
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


class TableGen extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      dataedit : [],
      dropdownvalue:[],
      dropdownfilter:[],
      dataremove:[],
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
    };
    
    this.actionTemplate = this.actionTemplate.bind(this);
    this.dropdownFilter = this.dropdownFilter.bind(this);
    this.customFilter = this.customFilter.bind(this);
    this.onEditChange = this.onEditChange.bind(this);
    this.customSorting = this.customSorting.bind(this);
    this.onHandleClickAdd = this.onHandleClickAdd.bind(this);
    this.removedata = this.removedata.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.paginationButton = this.paginationButton.bind(this)
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.autocompleteBody = this.autocompleteBody.bind(this);
    this.datePickerBody = this.datePickerBody.bind(this)
    this.onEditDateChange = this.onEditDateChange.bind(this)
    this.datetimeBody = this.datetimeBody.bind(this)
    
    this.data = []
    this.sortstatus=0
    this.order=0
    this.addkey=0
  }

  componentWillReceiveProps(nextProps){
    this.queryInitialData();
    //this.setState({dropdownfilter:nextProps.ddlfilter})
    this.setState({dropdownfilter:nextProps.ddlfilter})
  }

  componentDidMount(props){
    this.queryInitialData();
    
    this.props.column.forEach((row) => {
      let uneditable = this.state.uneditable
      if(row.updateable !== undefined && row.updateable === false){
        uneditable.push(row.field)
      }
      this.setState({uneditable: uneditable})
    })
  }

  queryInitialData(){
    this.setState({select:this.props.data})
    let queryString = createQueryString(this.props.data)
    Axois.get(queryString).then(
      (res) => {
        this.setState({data:res.data.datas})
        this.setState({loading:false})
      }
    )
    
    const ddl = [...this.props.statuslist]
    let ddvalue = [...this.state.dropdownvalue]
    ddl.map((row,index) => {
      let field= {};
      field[row.field] = "*"
      ddvalue.push(field)
    })
    this.setState({dropdownvalue:ddvalue})
    if(this.dt.table.children[1].children.length > 1)
    {
      for(let i = 0; i < this.dt.table.children[1].children.length; i++){
        this.dt.table.children[1].children[i].classList.remove('ui-state-highlight')
      }
    }
  }

  onHandleClickCancel(event){
    this.queryInitialData();
  }

  onEditorValueChange(props, value) {
    const data = [...this.state.data];
    data[props.rowIndex][props.field] = value;
    this.setState({ data });
    const dataedit = [...this.state.dataedit];
    dataedit.forEach((datarow,index) => {
      if(datarow.ID === data[props.rowIndex]["ID"]){
        dataedit.splice(index,1);
      }
    })
    this.dt.table.children[1].children[props.rowIndex].classList.add('ui-state-highlight')
    dataedit.push(data[props.rowIndex]);
    this.setState({dataedit}, () => console.log(this.state.dataedit));
  }

  inputTextEditor(props, field) {
      return <Input type="text" value={props.rowData[field]} onChange={(e) => {return this.onEditorValueChange(props, e.target.value)}} />;
  }

  actionTemplate(column, event, rowData) {
    let listbtn = column.map((data,index) => {
      if(data === 'barcode'){
        return <Button key={index} type="button" color="info">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} to={'/mst/sku/manage/barcode?barcode='+event.Code+'&Name='+event.Name}>Print</Link>}</Button>
      }
      else if(data === 'remove'){
        return <Button key={index} type="button" color="danger" onClick={() => this.removedata(rowData, 2)}>Remove</Button>
      }
      else{
        return <Button key={index} type="button" color="danger" onClick={() => this.removedata(rowData, 2)}>Remove</Button>
      }
    })
    return listbtn
  }
  
  removedata(props, value){
    const data = [...this.state.data];
    data[props.rowIndex]["Status"] = value;
    const dataedit = [...this.state.dataedit];
    dataedit.forEach((datarow,index) => {
      if(datarow.ID === data[props.rowIndex]["ID"]){
        dataedit.splice(index,1);
      }
    })
    dataedit.push(data[props.rowIndex]);
    data.forEach((datarow,index) => {
      if(datarow.ID === data[props.rowIndex]["ID"]){
        data.splice(index,1);
      }
    })
    this.setState({ data });
    this.setState({dataedit});
  }

  booleanTemplate(row,rowData,status) {
    return <input
    type="checkbox"
    className="checkbox"
    contentEditable
    suppressContentEditableWarning
    defaultChecked={row.Status === 1} 
    onChange={ (e) => {
      this.onEditorValueChange(rowData, e.target.checked === false ? 0 : 1)
    }}
    disabled={status}/>
  }

  onEditChange(field, value) {
    let filter = [...this.state.datafilter]
      filter.forEach((datarow,index) => {
        if(Object.keys(datarow)[0] === field){
          filter.splice(index,1);
        }
      })
      if(value !== ""){
        filter.push({[field]: value})
      }
      this.setState({datafilter:filter}, this.onCheckFliter(filter))
  }

  onDropdownValue(field){
    let result = ""
    this.state.dropdownvalue.forEach((data) => {
      if(Object.keys(data)[0] === field){
        result = data[Object.keys(data)[0]]
      }
    })
    return result
  }

  suggestData(event,field) {
    let result = [];
    const filterlist = [...this.state.dropdownfilter]
    filterlist.forEach((row) => {
      if(row.field === field){
        result = row.data.filter((obj) => {
          return obj[Object.keys(obj)[1]].toLowerCase().startsWith(event.query.toLowerCase())
        })
      }
    })
    let result1 = [...result]
    this.setState({suggestWithData:result1})
    let result2 = []
    result1.forEach((row) => {
      result2.push(row.Code)
    })
    this.setState({dataSuggestions:result2})
  }

  autocompleteBody(rowCom,field){
    return <AutoComplete value={rowCom.rowData[field]} onChange={(e) => this.onEditorDropdownChange(rowCom,e.value)}
            dropdown={true} suggestions={this.state.dataSuggestions} completeMethod={(event) => this.suggestData(event,field)} />
  }

  datetimeBody(rowData,rowCom){
    if(rowData[rowCom["field"]] !== null){
      const date = moment(rowData[rowCom["field"]]);
      return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
    }
  }

  datePickerBody(format,rowCom,field){
    if(format === 'date')
    {
      return <DatePicker selected={moment(rowCom.rowData[field])}
        onChange={(e) => {return this.onEditDateChange(e,rowCom)}}/>
    }
    else if(format === 'datetime'){
      return <DatePicker selected={moment(rowCom.rowData[field])}
        onChange={(e) => {return this.onEditDateChange(e,rowCom)}}
        showTimeSelect
        timeFormat="hh:mm"
        dateFormat="LLL"
        timeCaption="time"/>
    }
    else{
      return <DatePicker selected={moment(rowCom.rowData[field])}
        onChange={(e) => {return this.onEditDateChange(e,rowCom)}}
        showTimeSelectOnly
        dateFormat="LT"
        timeCaption="Time"/>
    }
  }

  onEditDateChange(date,component){
    console.log(date)
    const dateformat = date.format('YYYY-MM-DDTHH:mm:ss')
    this.onEditorValueChange(component,dateformat)
  }
  
  onEditorDropdownChange(props, value) {
    setTimeout(()=>{
      if(this.state.suggestWithData !== undefined){
        const data = [...this.state.data];
        let result = this.state.suggestWithData.filter((obj) => {
          return obj[Object.keys(obj)[1]].toLowerCase() === value.toLowerCase()
        })
        if(result.length === 1){
          result.forEach((row) => {
            data[props.rowIndex][props.field] = row[Object.keys(row)[1]];
            data[props.rowIndex][Object.keys(row)[0]] = row[Object.keys(row)[0]];
          })
          this.setState({ data });
        }
        const dataedit = [...this.state.dataedit];
        dataedit.forEach((datarow,index) => {
          if(datarow.ID === data[props.rowIndex]["ID"]){
            dataedit.splice(index,1);
          }
        })
        this.dt.table.children[1].children[props.rowIndex].classList.add('ui-state-highlight')
        dataedit.push(data[props.rowIndex]);
        this.setState({dataedit});
      }
    },100)
  }

  dropdownFilter(field){
    const ddl = [...this.props.statuslist]
    const ddlvalue = [...this.state.dropdownvalue]
    let result = ddl.map((row,index) => {
      return <DDLP key={row.header} style={{width: '100%'}} className="ui-column-filter"
        value={this.onDropdownValue(row.field)}
        options={row.status}
        onChange={(e) => {
          ddlvalue.forEach((data) =>{
            if(Object.keys(data)[0] === row.field){
              data[Object.keys(data)] = e.value
            }
            this.setState({status:e.value})
          })
          this.onEditChange(field, e.value)
        }}/>
    })
    let res = result.filter((ele) => {
      return ele.key === field
    })
    return res;
  }
  
  customFilter(field){
    return <Input type="text" onBlur={(e) => {
      this.onEditChange(field, e.target.value)
    }}
    
    onKeyPress={(e) => {
      if (e.key === 'Enter'){
        this.onEditChange(field, e.target.value)
      }}
    } />;
  }
  
  onCheckFliter(filter){
    let filterlist = []
    
    this.setState({dataedit:[]})
    this.setState({dataremove:[]})
    
    if(filter.length > 0)
    {
      filter.map((data, id) => {
        if(data[1] !== ""){
          switch(data[Object.keys(data)[0]].toString().charAt(0)){
            case "=":
              filterlist.push([{"f":Object.keys(data)[0], "c":"=", "v": data[Object.keys(data)[0]].replace("=","")}])
              break
            case ">":
              filterlist.push([{"f":Object.keys(data)[0], "c":">", "v": data[Object.keys(data)[0]].replace(">","")}])
              break
            case "<":
              filterlist.push([{"f":Object.keys(data)[0], "c":"<", "v": data[Object.keys(data)[0]].replace("<","")}])
              break
            case ">=":
              filterlist.push([{"f":Object.keys(data)[0], "c":">=", "v": data[Object.keys(data)[0]].replace(">=","")}])
              break
            case "<=":
              filterlist.push([{"f":Object.keys(data)[0], "c":"<=", "v": data[Object.keys(data)[0]].replace("<=","")}])
              break
            case "%":
              filterlist.push([{"f":Object.keys(data)[0], "c":"like", "v": data[Object.keys(data)[0]]}])
              break
            case "*":
              filterlist.push([{"f":Object.keys(data)[0], "c":"!=", "v":2}])
              break
            default:
              filterlist.push([{"f":Object.keys(data)[0], "c":"=", "v": data[Object.keys(data)[0]]}])
          }
          const select = this.state.select
          select["q"] = JSON.stringify(...filterlist)
          let queryString = createQueryString(select)
          Axois.get(queryString).then(
              (res) => {
                this.setState({data:res.data.datas})
              }
          )
        }
      })
    }
    else{
      const select = this.state.select
      select["q"] = ""
      let queryString = createQueryString(select)
      Axois.get(queryString).then(
          (res) => {
            this.setState({data:res.data.datas})
          }
      )
    }
  }
  
  customSorting(event){
    if(this.sortstatus !== event.order)
    {
      this.setState({dataedit:[]})
      this.setState({dataremove:[]})
      this.sortstatus = event.order
      this.order = event.order
      const select = this.state.select
      select["s"] = JSON.stringify([{'f':event.field,'od':event.order === -1 ? 'asc' : 'desc'}])
      let queryString = createQueryString(select)
      Axois.get(queryString).then(
      (res) => {
        this.setState({data:res.data.datas})
       }
      )
    }

    return this.state.data
  }

  onHandleClickAdd(event){
    event.preventDefault();
    let adddata = [...this.state.data];
    adddata.push({'ID':this.addkey,'Status':1})
    this.addkey += -1
    this.setState({data:adddata.sort((a,b) => a.ID - b.ID)});
  }

  updateData(){
      const dataedit = Object.assign([],[...this.state.dataedit])
      if(dataedit.length > 0){
        dataedit.forEach((row) => {
          row["ID"] = row["ID"] <= 0 ? "" : row["ID"]
          for(let col of this.state.uneditable){
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
    
        Axois.put(this.state.select.queryString, updjson).then((result) =>{
          this.queryInitialData();
        })
  
        this.setState({dataedit:[]})
      }
  }

  pageOnHandleClick(position){
    let queryString = "";
    this.setState({loading:true})
    const select = this.state.select
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
    Axois.get(queryString).then(
      (res) => {
        if(res.data.datas.length > 0){
          this.setState({data:res.data.datas})
        }
        for(let i = 0; i < this.dt.table.children[1].children.length; i++){
          this.dt.table.children[1].children[i].classList.remove('ui-state-highlight')
        }
        this.setState({loading:false})
      }
    )
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

  expandRow(){

  }

  render(){
    let dynamicColumns = this.props.column.map((col,i) => {
      if(col.body === 'checkbox'){
        if(col.editable === false)
        {
          return <Column style={{overflowX:'initial'}} filterElement={this.dropdownFilter(col.field)} filter={true} 
          key={col.field} field={col.field} header={col.header} body={(rowData,rowCom) => {return this.booleanTemplate(rowData,rowCom,true)}}/>;
        }
        else{
          return <Column style={{overflowX:'initial'}} filterElement={this.dropdownFilter(col.field)} filter={true} 
          key={col.field} field={col.field} header={col.header} body={(rowData,rowCom) => {return this.booleanTemplate(rowData,rowCom,false)}}/>;
        }
      }
      else if(col.body === 'dropdown'){
        if(col.editable === false)
        {
          return <Column style={{overflowX:'initial'}} filter={true} 
          key={col.field} field={col.field} header={col.header}/>;
        }
        else{
          return <Column style={{overflowX:'initial'}} filter={true} 
          key={col.field} field={col.field} header={col.header}
          editor={(rowCom) => {return this.autocompleteBody(rowCom, col.field)}}/>;
        }
      }
      else if(col.body === 'datetime'){
        if(col.editable === false)
        {
          return <Column filterElement={this.customFilter(col.field)} filter={true} 
          body={(rowData,rowCom) => {return this.datetimeBody(rowData,rowCom)}} sortable="custom" sortFunction={this.customSorting} key={col.field} field={col.field} header={col.header}/>;
        }
        else{
          return <Column filterElement={this.customFilter(col.field)} filter={true} 
          sortable="custom" sortFunction={this.customSorting} key={col.field} field={col.field} header={col.header}
          body={(rowData,rowCom) => {return this.datetimeBody(rowData,rowCom)}} 
          editor={(rowCom) => {return this.datePickerBody('datetime',rowCom, col.field)}}/>;
        }
      }
      else if(col.sortable === false){
        return <Column filterElement={this.customFilter(col.field)} filter={true} 
        key={col.field} field={col.field} header={col.header} 
        editor={(dataRow) => {return this.inputTextEditor(dataRow, col.field)}}/>;
      }
      else if(col.manage !== undefined){
        return <Column key={col.field} body={(e,rowCom) => this.actionTemplate(col.manage,e,rowCom)} style={{textAlign:'center', width: '6em'}}/>
      }
      else if(col.editable !== false){
        return <Column filterElement={this.customFilter(col.field)} filter={true} 
        sortable="custom" sortFunction={this.customSorting} key={col.field} field={col.field} header={col.header} 
        editor={(dataRow) => {return this.inputTextEditor(dataRow, col.field)}}/>;
      }
      else{
        return <Column filterElement={this.customFilter(col.field)} filter={true} 
        sortable="custom" sortFunction={this.customSorting} key={col.field} field={col.field} header={col.header}/>;
      }
    });
    
    return(
      <div style={{overflowX:'auto'}}>
        <Button onClick={this.onHandleClickAdd} style={{width:200, display:this.state.addbtn === true ? 'inline' : 'none'}} type="button" color="success"className="mr-sm-1">Add</Button>
        {this.paginationButton()}
        <DataTable ref={(el) => this.dt = el} value={this.state.data} loading={this.state.loading}
        editable={true} resizableColumns={true} columnResizeMode="expand"
        paginatorPosition="top">
            {dynamicColumns}
        </DataTable>
        <Card>
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