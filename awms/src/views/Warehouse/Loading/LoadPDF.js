import React from 'react'
import './pdfstyle.css';
import _ from 'lodash';

const checkBox = <img className="mybox" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDI3OC43OTkgMjc4Ljc5OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjc4Ljc5OSAyNzguNzk5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTI2NS41NCwwSDEzLjI1OUM1LjkzOSwwLDAuMDAzLDUuOTM2LDAuMDAzLDEzLjI1NnYyNTIuMjg3YzAsNy4zMiw1LjkzNiwxMy4yNTYsMTMuMjU2LDEzLjI1NkgyNjUuNTQgICBjNy4zMTgsMCwxMy4yNTYtNS45MzYsMTMuMjU2LTEzLjI1NlYxMy4yNTVDMjc4Ljc5Niw1LjkzNSwyNzIuODYsMCwyNjUuNTQsMHogTTI1Mi4yODQsMjUyLjI4N0gyNi41MTVWMjYuNTExaDIyNS43NjlWMjUyLjI4N3oiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K" />;

class LoadPDF extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BranchName: "ปันกัน",
      datasitems: [],
      datashow: []
    };
    this.addTable = this.addTable.bind(this);

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

  readDataItems() {
    return this.props.groupdisplay.map((items, index) => {
      return (
        <tr key={index}>
          <td>{index+1}</td>
          <td className="lefttb"><div style={{ float: 'left', text_align: 'left'}}>{items.code}: {items.item}</div></td>
          <td>{items.qty}</td>
          <td></td>
          <td>{items.issuedcode}</td>
        </tr>

      );
    })
  }

  render() {
    return (

      <div className="container" id="divHidden">
        <br />
        <div id="myPDF" className="pdf">
          <div id="detail">
            <div id="header">
              <h4>มูลนิธิ ยุวพัฒน์</h4>
              <h4>ใบขออนุญาตนำของออกนอกคลัง ปันกัน</h4>
            </div>

            <div>
              <table className="hidtb" id="header2">
                <tbody>
                  <tr>
                    <td className="lefttb">
                      <tr><td>ผู้ขออนุญาตนำของออก.......................................................................</td></tr>
                      <tr><td>บริษัท.............{this.state.BranchName}............................โทร............................................</td></tr>
                    </td>
                    <td className="leftobj">
                      <tr>วันที่นำออก.................{this.props.actionDate}...................</tr>
                      <tr>เวลา..........................{this.props.actionTime} น. .............................</tr>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <table className="hidtb" id="header3">
                <tbody>
                  <tr>
                    <td>
                      <tr>วัตถุประสงค์การนำออก</tr>
                      <tr></tr>
                      <tr></tr>
                    </td>
                    <td>
                      <div className="leftobj">
                        <tr>{checkBox} ส่งซ่อม และจะนำกลับเข้าคลังปันกันประมาณวันที่........................................................................................</tr>
                        <tr>{checkBox} นำออกไปใช้งานภายนอกชั่วคราว และจะนำกลับเข้าคลังฯ ประมาณวันที่................................................</tr>
                        <tr>{checkBox} นำออกถาวร (ระบุ)...................{this.props.customer}....................................................</tr>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="pleft">มูลนิธิฯ อนุญาตให้นำของออกได้ ตามรายการข้างล่างนี้</p>
            </div>
            <div>
              <table className="showitems" id="showtable">
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
                  {/*this.addTable()*/}
                </tbody>
              </table>
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

                  <tr>
                    <td>
                      <div className="bordertd">
                        <tr>กรณีที่ผู้ขออนุญาตเป็นระดับปฏิบัติการต้องมีผู้บังคับบัญชา</tr>
                        <tr className="lefttb">ระดับผู้จัดการลงนามรับทราบการนำออก</tr>
                        <tr>&nbsp;</tr>
                        <tr>ผู้จัดการลงนาม.................................................................</tr>
                        <tr>(..................................................)</tr>
                      </div>
                    </td>
                    <td>
                      <tr>เจ้าหน้าที่ รปภ. ตรวจสอบของออก</tr>
                      <tr className="lefttb" >ลงนาม</tr>
                      <tr>(..................................................)</tr>
                      <tr>วันที่........../........../..........</tr>
                      <tr>เจ้าหน้าที่ รปภ. ตรวจสอบของนำคืน</tr>
                      <tr className="lefttb">ลงนาม</tr>
                      <tr>(..................................................)</tr>
                      <tr>วันที่........../........../..........</tr>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="borderfooter">
                <table className="hidtb" id="header5">
                  <tbody>
                  <tr>
                    <td>หมายเหตุ :&nbsp;</td>
                    <td>1. ใบนำของออกถาวรเมื่อ รปภ.ลงนามแล้ว ให้นำส่งคืนยัง ผจก.คลังสินค้า</td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td>2. ใบนำของออกชั่วคราว / ส่งซ่อม เมื่อ รปภ.ลงนามแล้ว ให้นำฉบับจริงส่ง ผจก คลัง เพื่อเก็บไว้ตรวจรับคืน</td>
                  </tr>
                  <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default LoadPDF
