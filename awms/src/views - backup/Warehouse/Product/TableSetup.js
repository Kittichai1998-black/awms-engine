import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import ReactTable from "react-table";
import "react-table/react-table.css";
import {Button, Dropdown, DropdownItem, 
  DropdownMenu, DropdownToggle} from 'reactstrap';
import _ from "lodash"

class DropdownList extends Component{
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);

    this.state = {
      dropdownOpen: false,
      header:this.props.data.header.text
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  render(){
    return(
      <Dropdown className="mr-sm-1" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
          {this.state.header}
        </DropdownToggle>
        <DropdownMenu>
          {this.props.data.status.map((ele,key) => {
            return <DropdownItem key={key} value={ele.value} onClick={() => {
              this.setState({header:ele.value});
              this.props.return( ele.value === 'Inactive' ? false : ele.value === 'Active' ? true : ele.value, this.props.name)
            }}>{ele.value}</DropdownItem>
          })}
        </DropdownMenu>
      </Dropdown>
    )
  }
}

  class TableGen extends Component{
    constructor(props) {
      super(props);
  
      this.state = {
        data : [],
        datasearch : [],
        dataedit : [],
        barcode:false,
        dataremove:[],
        datafilter :[],
      };
  
      this.renderEditable = this.renderEditable.bind(this);
      this.onClickBarcode = this.onClickBarcode.bind(this);
      this.renderEditCheckbox = this.renderEditCheckbox.bind(this);
      this.fliterData = this.fliterData.bind(this)
    }

    componentDidMount(props){
      this.setState({data:this.props.data})
    }
  
    componentWillReceiveProps(nextProps, prevProps){
      if(prevProps.data !== nextProps.data){
        this.setState({data:nextProps.data})
      }

      const data = [...this.state.data];

      if(nextProps.adddata.length > 0){
        data.push(...nextProps.adddata)
      }

      this.setState({data})
    }

    onClickBarcode(){
      return(
        this.setState({barcode:true})
      )
    }
  
    onClickRemove(row){
      const data = [...this.state.data];
      const dataremove = [...this.state.dataremove];

      let dataedit = [...this.state.dataedit];
      dataedit.forEach((datarow,index) => {
        if(datarow.ID === data[row.index]["ID"]){
          dataedit.splice(index,1);
        }
      })

      data.forEach((datarow,index) => {
        if(index === row.index){
          if(datarow.ID !== -1)
          dataremove.push(datarow)
          data.splice(row.index,1);
        }
      })
      this.setState({dataedit});
      this.setState({dataremove})
      this.setState({data})
    }

    shouldComponentUpdate(nextState){
      console.log(_.isEqual(this.state.data,nextState.data))
      console.log(this.state.data)
      console.log(nextState.data)
      if(!_.isEqual(this.state.data,nextState.data) || this.state.data !== []){
        return true
      }
      else if(_.isEqual(this.state.data,nextState.data)){
        return false;
      }
    }

    fliterData(){
      let getdata = this.state.data
      this.props.filter.map((data,key) => {
        let result = getdata.filter((row) => {
          let col = row[data["column"]];
          let value = data["desc"];
          if(typeof(value) === 'boolean'){
            return col === value
          }
          else if(typeof(value) === 'string'){
            return col.toLowerCase().indexOf(value.toLowerCase()) > -1;
          }
          else{
            return col === value
          }
        })
        getdata = result
      });
      return getdata
    }

    renderEditable(cellInfo) {
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: this.state.data[cellInfo.index][cellInfo.column.id]
          }}
          style={{ backgroundColor: "#fafafa" }}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => {
            const data = [...this.state.data];
            const defaultdata = data[cellInfo.index][cellInfo.column.id];
            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
            this.setState({ data });
            let dataedit = [...this.state.dataedit];
            if(defaultdata !== data[cellInfo.index][cellInfo.column.id]){
              dataedit.forEach((datarow,index) => {
                if(datarow.ID === data[cellInfo.index]["ID"]){
                  dataedit.splice(index,1);
                }
              })
              dataedit.push(data[cellInfo.index]);
            }
            this.setState({dataedit});
          }}
        />
      );
    }
    
    renderEditCheckbox(row){
      const data = [...this.state.data];
      data[row.index][row.column.id] = row.value;
      this.setState({ data });
      const dataedit = [...this.state.dataedit];
      dataedit.forEach((datarow,index) => {
        if(datarow.ID === data[row.index]["ID"]){
          dataedit.splice(index,1);
        }
      })
      dataedit.push(data[row.index]);
      this.setState({dataedit});
    }
  
    render(){

      const columns = [{type:1,column:[{
        accessor: 'Code',
        Header: 'รหัส',
      }, {
        accessor: 'Name',
        Header: 'ชื่อ',
      }, {
        accessor: 'Description',
        Header: 'รายละเอียด',
      }, {
        accessor: 'Status',
        Header: 'สถานะ',
        Cell: (row) => {
          return(
            <input
              type="checkbox"
              className="checkbox"
              contentEditable
              suppressContentEditableWarning
              checked={row.value === true}
              onChange={ () => {
                if(row.value === true){
                  row.value = false
                  this.renderEditCheckbox(row)
                }
                else
                {
                  row.value = true
                  this.renderEditCheckbox(row)                
                }
              }
              }
              disabled={true}
            />
        )}
      }, {
        accessor: 'WidthM',
        Header: 'กว้าง',
      }, {
        accessor: 'LengthM',
        Header: 'ยาว',
      }, {
        accessor: 'HeightM',
        Header: 'สูง',
      }, {
        accessor: 'Weight',
        Header: 'น้ำหนัก',
      }, {
        accessor: 'CreateBy',
        Header: 'สร้างโดย',
      }, {
        accessor: 'ModifyBy',
        Header: 'แก้ไขโดย',
      }, {
        Header: 'QR Code',
        Cell : (row)=>{
          return(
            <div>
              <Button onClick={this.onClickBarcode} color="primary">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} to={'/mst/sku/manage/barcode?barcode='+row.original.Code}>Print</Link>}</Button>{' '}
            </div>
          )}
      }]},{type:2,column:[{
        accessor: 'Code',
        Header: 'รหัส',
        Cell: this.renderEditable
      }, {
        accessor: 'Name',
        Header: 'ชื่อ',
        Cell: this.renderEditable
      }, {
        accessor: 'Description',
        Header: 'รายละเอียด',
        Cell: this.renderEditable
      }, {
        accessor: 'Type',
        Header: 'ประเภท',
        Cell: this.renderEditable
      },{
        accessor: 'Status',
        Header: 'สถานะ',
        Cell: (row) => {
          return(
            <input
              type="checkbox"
              className="checkbox"
              contentEditable
              suppressContentEditableWarning
              checked={row.value === true}
              onChange={ () => {
                if(row.value === true){
                  row.value = false
                  this.renderEditCheckbox(row)
                }
                else
                {
                  row.value = true
                  this.renderEditCheckbox(row)                
                }
              }
              }
              //disabled={true}
            />
        )}
      }, {
        accessor: 'CreateBy',
        Header: 'สร้างโดย',
      }, {
        accessor: 'ModifyBy',
        Header: 'แก้ไขโดย',
      }, {
        Header: 'QR Code',
        Cell : (row)=>{
          return(
            <div>
              <Button onClick={this.onClickBarcode} color="primary">{<Link style={{ color: '#FFF', textDecorationLine :'none' }} to={'/mst/sku/manage/barcode?barcode='+row.original.Code}>Print</Link>}</Button>{' '}
              <Button onClick={this.onClickRemove.bind(this, row)} color="danger">X</Button>
            </div>
          )}
      }]
    }]

      let filtercolumn = []

      let getcolumns = {...columns}
      for(let i=0; i<Object.keys(getcolumns).length; i++){
        if(getcolumns[i].type === this.props.type){
          filtercolumn = getcolumns[i].column
          break;
        }
      }

      return(
          <ReactTable data={this.fliterData()} columns={filtercolumn} minRows={10} defaultPageSize={10} />
      )
    }
  }

export {TableGen,DropdownList};