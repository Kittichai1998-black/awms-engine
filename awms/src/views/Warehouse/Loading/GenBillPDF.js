import React from 'react'
import * as jsPDF from 'jspdf';
import moment from 'moment';
import html2canvas from 'html2canvas';
import './pdfstyle.css';
import _ from 'lodash';
import LoadPDF from './LoadPDF';
import { apicall } from '../ComponentCore'

const Axios = new apicall()

const iconpdf = <img className="iconpdf" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6I0U5RTlFMDsiIGQ9Ik0zNi45ODUsMEg3Ljk2M0M3LjE1NSwwLDYuNSwwLjY1NSw2LjUsMS45MjZWNTVjMCwwLjM0NSwwLjY1NSwxLDEuNDYzLDFoNDAuMDc0ICAgYzAuODA4LDAsMS40NjMtMC42NTUsMS40NjMtMVYxMi45NzhjMC0wLjY5Ni0wLjA5My0wLjkyLTAuMjU3LTEuMDg1TDM3LjYwNywwLjI1N0MzNy40NDIsMC4wOTMsMzcuMjE4LDAsMzYuOTg1LDB6Ii8+Cgk8cG9seWdvbiBzdHlsZT0iZmlsbDojRDlEN0NBOyIgcG9pbnRzPSIzNy41LDAuMTUxIDM3LjUsMTIgNDkuMzQ5LDEyICAiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDQzRCNEM7IiBkPSJNMTkuNTE0LDMzLjMyNEwxOS41MTQsMzMuMzI0Yy0wLjM0OCwwLTAuNjgyLTAuMTEzLTAuOTY3LTAuMzI2ICAgYy0xLjA0MS0wLjc4MS0xLjE4MS0xLjY1LTEuMTE1LTIuMjQyYzAuMTgyLTEuNjI4LDIuMTk1LTMuMzMyLDUuOTg1LTUuMDY4YzEuNTA0LTMuMjk2LDIuOTM1LTcuMzU3LDMuNzg4LTEwLjc1ICAgYy0wLjk5OC0yLjE3Mi0xLjk2OC00Ljk5LTEuMjYxLTYuNjQzYzAuMjQ4LTAuNTc5LDAuNTU3LTEuMDIzLDEuMTM0LTEuMjE1YzAuMjI4LTAuMDc2LDAuODA0LTAuMTcyLDEuMDE2LTAuMTcyICAgYzAuNTA0LDAsMC45NDcsMC42NDksMS4yNjEsMS4wNDljMC4yOTUsMC4zNzYsMC45NjQsMS4xNzMtMC4zNzMsNi44MDJjMS4zNDgsMi43ODQsMy4yNTgsNS42Miw1LjA4OCw3LjU2MiAgIGMxLjMxMS0wLjIzNywyLjQzOS0wLjM1OCwzLjM1OC0wLjM1OGMxLjU2NiwwLDIuNTE1LDAuMzY1LDIuOTAyLDEuMTE3YzAuMzIsMC42MjIsMC4xODksMS4zNDktMC4zOSwyLjE2ICAgYy0wLjU1NywwLjc3OS0xLjMyNSwxLjE5MS0yLjIyLDEuMTkxYy0xLjIxNiwwLTIuNjMyLTAuNzY4LTQuMjExLTIuMjg1Yy0yLjgzNywwLjU5My02LjE1LDEuNjUxLTguODI4LDIuODIyICAgYy0wLjgzNiwxLjc3NC0xLjYzNywzLjIwMy0yLjM4Myw0LjI1MUMyMS4yNzMsMzIuNjU0LDIwLjM4OSwzMy4zMjQsMTkuNTE0LDMzLjMyNHogTTIyLjE3NiwyOC4xOTggICBjLTIuMTM3LDEuMjAxLTMuMDA4LDIuMTg4LTMuMDcxLDIuNzQ0Yy0wLjAxLDAuMDkyLTAuMDM3LDAuMzM0LDAuNDMxLDAuNjkyQzE5LjY4NSwzMS41ODcsMjAuNTU1LDMxLjE5LDIyLjE3NiwyOC4xOTh6ICAgIE0zNS44MTMsMjMuNzU2YzAuODE1LDAuNjI3LDEuMDE0LDAuOTQ0LDEuNTQ3LDAuOTQ0YzAuMjM0LDAsMC45MDEtMC4wMSwxLjIxLTAuNDQxYzAuMTQ5LTAuMjA5LDAuMjA3LTAuMzQzLDAuMjMtMC40MTUgICBjLTAuMTIzLTAuMDY1LTAuMjg2LTAuMTk3LTEuMTc1LTAuMTk3QzM3LjEyLDIzLjY0OCwzNi40ODUsMjMuNjcsMzUuODEzLDIzLjc1NnogTTI4LjM0MywxNy4xNzQgICBjLTAuNzE1LDIuNDc0LTEuNjU5LDUuMTQ1LTIuNjc0LDcuNTY0YzIuMDktMC44MTEsNC4zNjItMS41MTksNi40OTYtMi4wMkMzMC44MTUsMjEuMTUsMjkuNDY2LDE5LjE5MiwyOC4zNDMsMTcuMTc0eiAgICBNMjcuNzM2LDguNzEyYy0wLjA5OCwwLjAzMy0xLjMzLDEuNzU3LDAuMDk2LDMuMjE2QzI4Ljc4MSw5LjgxMywyNy43NzksOC42OTgsMjcuNzM2LDguNzEyeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NDNEI0QzsiIGQ9Ik00OC4wMzcsNTZINy45NjNDNy4xNTUsNTYsNi41LDU1LjM0NSw2LjUsNTQuNTM3VjM5aDQzdjE1LjUzN0M0OS41LDU1LjM0NSw0OC44NDUsNTYsNDguMDM3LDU2eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0xNy4zODUsNTNoLTEuNjQxVjQyLjkyNGgyLjg5OGMwLjQyOCwwLDAuODUyLDAuMDY4LDEuMjcxLDAuMjA1ICAgIGMwLjQxOSwwLjEzNywwLjc5NSwwLjM0MiwxLjEyOCwwLjYxNWMwLjMzMywwLjI3MywwLjYwMiwwLjYwNCwwLjgwNywwLjk5MXMwLjMwOCwwLjgyMiwwLjMwOCwxLjMwNiAgICBjMCwwLjUxMS0wLjA4NywwLjk3My0wLjI2LDEuMzg4Yy0wLjE3MywwLjQxNS0wLjQxNSwwLjc2NC0wLjcyNSwxLjA0NmMtMC4zMSwwLjI4Mi0wLjY4NCwwLjUwMS0xLjEyMSwwLjY1NiAgICBzLTAuOTIxLDAuMjMyLTEuNDQ5LDAuMjMyaC0xLjIxN1Y1M3ogTTE3LjM4NSw0NC4xNjh2My45OTJoMS41MDRjMC4yLDAsMC4zOTgtMC4wMzQsMC41OTUtMC4xMDMgICAgYzAuMTk2LTAuMDY4LDAuMzc2LTAuMTgsMC41NC0wLjMzNWMwLjE2NC0wLjE1NSwwLjI5Ni0wLjM3MSwwLjM5Ni0wLjY0OWMwLjEtMC4yNzgsMC4xNS0wLjYyMiwwLjE1LTEuMDMyICAgIGMwLTAuMTY0LTAuMDIzLTAuMzU0LTAuMDY4LTAuNTY3Yy0wLjA0Ni0wLjIxNC0wLjEzOS0wLjQxOS0wLjI4LTAuNjE1Yy0wLjE0Mi0wLjE5Ni0wLjM0LTAuMzYtMC41OTUtMC40OTIgICAgYy0wLjI1NS0wLjEzMi0wLjU5My0wLjE5OC0xLjAxMi0wLjE5OEgxNy4zODV6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMi4yMTksNDcuNjgyYzAsMC44MjktMC4wODksMS41MzgtMC4yNjcsMi4xMjZzLTAuNDAzLDEuMDgtMC42NzcsMS40NzdzLTAuNTgxLDAuNzA5LTAuOTIzLDAuOTM3ICAgIHMtMC42NzIsMC4zOTgtMC45OTEsMC41MTNjLTAuMzE5LDAuMTE0LTAuNjExLDAuMTg3LTAuODc1LDAuMjE5QzI4LjIyMiw1Mi45ODQsMjguMDI2LDUzLDI3Ljg5OCw1M2gtMy44MTRWNDIuOTI0aDMuMDM1ICAgIGMwLjg0OCwwLDEuNTkzLDAuMTM1LDIuMjM1LDAuNDAzczEuMTc2LDAuNjI3LDEuNiwxLjA3M3MwLjc0LDAuOTU1LDAuOTUsMS41MjRDMzIuMTE0LDQ2LjQ5NCwzMi4yMTksNDcuMDgsMzIuMjE5LDQ3LjY4MnogICAgIE0yNy4zNTIsNTEuNzk3YzEuMTEyLDAsMS45MTQtMC4zNTUsMi40MDYtMS4wNjZzMC43MzgtMS43NDEsMC43MzgtMy4wOWMwLTAuNDE5LTAuMDUtMC44MzQtMC4xNS0xLjI0NCAgICBjLTAuMTAxLTAuNDEtMC4yOTQtMC43ODEtMC41ODEtMS4xMTRzLTAuNjc3LTAuNjAyLTEuMTY5LTAuODA3cy0xLjEzLTAuMzA4LTEuOTE0LTAuMzA4aC0wLjk1N3Y3LjYyOUgyNy4zNTJ6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zNi4yNjYsNDQuMTY4djMuMTcyaDQuMjExdjEuMTIxaC00LjIxMVY1M2gtMS42NjhWNDIuOTI0SDQwLjl2MS4yNDRIMzYuMjY2eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />;

class GenBillPDF extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: "คลังสินค้าปันกัน",
      ActionDate: "19/10/61",
      ActionTime: "08:00",
      BranchName: "ปันกัน",
      CodeDoc: "LD-18110001",
      data: [],
      datasitems: [],
      datashow: [],
      showResults: false,
      groupdisplayLength: null
    };
    this.htmlToPDF = this.htmlToPDF.bind(this);
    this.genData = this.genData.bind(this);
  }

  componentDidMount() {
    console.log("ID: " + this.props.id);
    let documents = [];
    let dataitems = [];
    Axios.get(window.apipath + "/api/wm/loading/doc/?getMapSto=true&docID=" + this.props.id).then(rowselect1 => {
      if (rowselect1.data._result.status === 0) {
        documents = [];
      }
      else {
        documents = rowselect1.data;
      }
      Axios.get(window.apipath + "/api/wm/loading/conso?docID=" + this.props.id).then(res => {
        dataitems = res.data;
      }).then(() => {
        //console.log(documents); console.log(dataitems);
        this.setState({
          //data: documents.document.documentItems,
          customer: documents.document.desCustomerName,
          CodeDoc: documents.document.code,
          ActionDate: moment(documents.document.actionTime).format("DD/MM/YYYY"),
          ActionTime: moment(documents.document.actionTime).format("HH:mm"),
          datasitems: dataitems
        }, () => {
          this.genData()
        })
      });
    })
  }


  htmlToPDF() {
    var datalength = this.state.groupdisplayLength;
    console.log("datalength: " + datalength);
    if (datalength <= 20) {
      //มีข้อมูล 1-10แถว ไม่ต้องเพิ่มหน้า
      const input = document.getElementById('myPDF');
      html2canvas(input, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.save(this.state.CodeDoc + ".pdf");
        }).then(() => this.props.clearpdf());
    } else if (datalength > 20 || datalength <= 25) {
      //มีข้อมูล 11-25 แถว ยก footer ไปหน้าใหม่
      const detailhead = document.getElementById('detailhead');
      const datatable = document.getElementById('datatable');
      const allfooter = document.getElementById('allfooter');
      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.setFontSize(12);
      pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
      html2canvas(detailhead, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          html2canvas(datatable, { dpi: 600 })
            .then((canvas2) => {
              const imgData2 = canvas2.toDataURL('image/png');
              pdf.addImage(imgData2, 'JPEG', 40, 200); //
              pdf.addPage();
              pdf.setFontSize(12);
              pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
              html2canvas(allfooter, { dpi: 600 })
                .then((canvas3) => {
                  const imgData3 = canvas3.toDataURL('image/png');
                  pdf.addImage(imgData3, 'JPEG', 28, 70);
                  pdf.save(this.state.CodeDoc + ".pdf");
                }).then(() => this.props.clearpdf());
            });

        });
    } else {
      //มีข้อมูลมากกว่า 25 แถว
      const countTb = this.state.datashow.length;
      console.log("countTb:" + countTb);
      const detailhead = document.getElementById('detailhead');
      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.setFontSize(12);
      pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
      html2canvas(detailhead, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'JPEG', 28, 40); //
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          this.addtable(0, countTb, pdf);
        });
    }
  }

  addtable(i, countTb, pdf) {
    console.log(i + ":" + countTb);
    if (i < countTb) {
      var table = document.getElementById("table" + i)
      html2canvas(table, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          if (i === 0) {
            pdf.addImage(imgData, 'JPEG', 28, 245);
          } else {
            pdf.addImage(imgData, 'JPEG', 28, 50);
          }
          if (countTb - i !== 1) {
            pdf.addPage();
            pdf.setFontSize(12);
            pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          }
          this.addtable(++i, countTb, pdf);

        });
    } else {
      const allfooter = document.getElementById('allfooter');
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
      html2canvas(allfooter, { dpi: 600 })
        .then((canvas3) => {
          const imgData3 = canvas3.toDataURL('image/png');
          pdf.addImage(imgData3, 'JPEG', 28, 70);
          pdf.save(this.state.CodeDoc + ".pdf");
        }).then(() => this.props.clearpdf());
    }
  }
  genData() {
    let dataitems = this.state.datasitems.datas;
    var groupdisplay = [];
    var packname = [];
    let groupdata = _.groupBy(dataitems, (e) => { return e.id });
    var no = parseInt(0);
    for (let row in groupdata) {
      var packNames = "";
      var code = "";
      var issuedcode = "";
      groupdata[row].forEach((grow, index) => {
        code = grow.code
        issuedcode = grow.issuedCode
        packname.forEach((prow, index) => {

          if (prow === grow.packName) {
            packname.splice(index, 1)
          }
        })
        packname.push(grow.packName)

      })
      packNames = packname.join(", ");

      //รวมค่า packQTY
      let sumpackQty = _.uniqBy(groupdata[row], (e) => { return e.packID });
      //console.log(sumpackQty);
      let sumqty = _.sumBy(sumpackQty, 'packQty');
      //console.log("sumqty " + sumqty);

      groupdisplay.push({
        "no": no += 1,
        "id": row,
        "code": code,
        "item": packNames,
        "qty": sumqty,
        "issuedcode": issuedcode
      });
      packNames = null;
      packname = []
      sumpackQty = []
    }

    let arr_dataitems = [];
    var groupdisplayLength = groupdisplay.length;
    if (groupdisplayLength > 30) {
      var sliced1 = groupdisplay.slice(0, 30);
      var sliced2 = groupdisplay.slice(25, groupdisplay.length);
      arr_dataitems.push({ "groupdisplay": sliced1 });
      arr_dataitems.push({ "groupdisplay": sliced2 });

    } else {
      arr_dataitems.push({ "groupdisplay": groupdisplay });
    }

    this.setState({ datashow: arr_dataitems }, () =>
      this.setState({ groupdisplayLength: groupdisplayLength }, () => this.htmlToPDF())
    )

  }

  render() {
    return (
      <React.Fragment>
        {/*<a onClick={this.onClick}>{iconpdf}</a> <Button outline color="danger" onClick={this.onClick}>{iconpdf} PDF</Button> */}
        <LoadPDF
          customer={this.state.customer}
          actionDate={this.state.ActionDate}
          actionTime={this.state.ActionTime}
          codeDoc={this.state.CodeDoc}
          groupdisplay={this.state.datashow}
        />
      </React.Fragment>
    )
  }
}

export default GenBillPDF