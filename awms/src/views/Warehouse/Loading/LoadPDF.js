import React from 'react'
import './pdfstyle.css';
import _ from 'lodash';

const checkBox = <img className="mybox" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDI3OC43OTkgMjc4Ljc5OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjc4Ljc5OSAyNzguNzk5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI2NS41NCwwSDEzLjI1OUM1LjkzOSwwLDAuMDAzLDUuOTM2LDAuMDAzLDEzLjI1NnYyNTIuMjg3YzAsNy4zMiw1LjkzNiwxMy4yNTYsMTMuMjU2LDEzLjI1NkgyNjUuNTQgICBjNy4zMTgsMCwxMy4yNTYtNS45MzYsMTMuMjU2LTEzLjI1NlYxMy4yNTVDMjc4Ljc5Niw1LjkzNSwyNzIuODYsMCwyNjUuNTQsMHogTTI1Mi4yODQsMjUyLjI4N0gyNi41MTVWMjYuNTExaDIyNS43NjlWMjUyLjI4N3oiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;

class DataTable extends React.Component {
  constructor(props) {
    super(props);
  }

  readDataItems() {
    return this.props.groupdisplay.map((items, index) => {
      return (
        <tr key={index}>
          <td>{items.no}</td>
          <td className="lefttb"><div style={{ float: 'left', text_align: 'left' }}>{items.code}: {items.item}</div></td>
          <td>{items.qty}</td>
          <td></td>
          <td>{items.issuedcode}</td>
        </tr>

      );
    })
  }

  render() {
    return (
      <div id={this.props.divId}>
        <table className="showitems" id="showtable" width="100%">
          <thead>
            <tr>
              <th>ลำดับที่</th>
              <th>รายการ</th>
              <th>ปริมาณ</th>
              <th>หน่วย</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>

          <tbody>
            {this.readDataItems()}
          </tbody>
        </table>
      </div>
    )
  }
}


class LoadPDF extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BranchName: "ปันกัน",
    };

    this.addTable = this.addTable.bind(this);
  }

  createDatatable() {
    console.log(this.props.groupdisplay);
    return this.props.groupdisplay.map((items, index) => {
      return (
        <DataTable groupdisplay={items.groupdisplay} divId={"table" + index} />
      );
    })
  }
  addTable = () => {
    var datalength = this.props.groupdisplay.length;
    let table = []
    // Outer loop to create parent
    if (datalength <= 10) {
      for (let i = 0; i < (4 - datalength); i++) {
        let children = []
        //Inner loop to create children
        for (let j = 0; j < 5; j++) {
          children.push(<td></td>)
        }
        //Create the parent and add the children
        table.push(<tr>{children}</tr>)
      }
    } else if (datalength > 10 || datalength <= 20) {
      for (let i = 0; i < (20 - datalength); i++) {
        let children = []
        //Inner loop to create children
        for (let j = 0; j < 5; j++) {
          children.push(<td></td>)
        }
        //Create the parent and add the children
        table.push(<tr>{children}</tr>)
      }
    } else {
      for (let i = 0; i < (25 - datalength); i++) {
        let children = []
        //Inner loop to create children
        for (let j = 0; j < 5; j++) {
          children.push(<td></td>)
        }
        //Create the parent and add the children
        table.push(<tr>{children}</tr>)
      }
    }
    return table
  }

  render() {
    return (

      <div className="container" id="divHidden">
        <br />
        <div id="myPDF" className="pdf">
          <div id="detail">
            <div id="detailhead">

              <div id="header">
               
                <h4>ใบขออนุญาตนำของออกนอกคลัง ปันกัน</h4>
              </div>

              <div>
                <table className="hidtb" id="header2">
                  <tbody>
                    <tr>
                      <td className="lefttb">
                   
                      </td>
                      <td className="leftobj">
                        <tr>วันที่นำออก.................{this.props.actionDate}...................</tr>
                   
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

         
              <div>
                <p className="pleft">สิ่งของ อนุญาตให้นำของออกได้ ตามรายการข้างล่างนี้</p>
              </div>
            </div>

            <div id="datatable">
              {this.createDatatable()}
            </div>
          </div>
          <br />
          <br />
          <div id="allfooter">
            <div id="footer1">
              <table className="hidtb" id="header4">
                <tbody>
                  <tr>
                    <td>
                      <tr>ผู้ขออนุญาตนำของออก..................................................</tr>
                      <tr>(..................................................)</tr>
                      <tr>วันที่........../........../..........</tr>
                    </td>
                    <td>
                      <tr>ผู้อนุญาต..................................................</tr>
                      <tr>(ผู้อำนวยการ // ผู้จัดการปันกัน)</tr>
                      <tr>วันที่........../........../..........</tr>
                    </td>
                  </tr>
                </tbody>
              </table>         
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default LoadPDF
