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

//const iconpdf = <img className="iconpdf" src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPHBhdGggc3R5bGU9ImZpbGw6I0UyRTVFNzsiIGQ9Ik0xMjgsMGMtMTcuNiwwLTMyLDE0LjQtMzIsMzJ2NDQ4YzAsMTcuNiwxNC40LDMyLDMyLDMyaDMyMGMxNy42LDAsMzItMTQuNCwzMi0zMlYxMjhMMzUyLDBIMTI4eiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojQjBCN0JEOyIgZD0iTTM4NCwxMjhoOTZMMzUyLDB2OTZDMzUyLDExMy42LDM2Ni40LDEyOCwzODQsMTI4eiIvPgo8cG9seWdvbiBzdHlsZT0iZmlsbDojQ0FEMUQ4OyIgcG9pbnRzPSI0ODAsMjI0IDM4NCwxMjggNDgwLDEyOCAiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0YxNTY0MjsiIGQ9Ik00MTYsNDE2YzAsOC44LTcuMiwxNi0xNiwxNkg0OGMtOC44LDAtMTYtNy4yLTE2LTE2VjI1NmMwLTguOCw3LjItMTYsMTYtMTZoMzUyYzguOCwwLDE2LDcuMiwxNiwxNiAgVjQxNnoiLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTEwMS43NDQsMzAzLjE1MmMwLTQuMjI0LDMuMzI4LTguODMyLDguNjg4LTguODMyaDI5LjU1MmMxNi42NCwwLDMxLjYxNiwxMS4xMzYsMzEuNjE2LDMyLjQ4ICAgYzAsMjAuMjI0LTE0Ljk3NiwzMS40ODgtMzEuNjE2LDMxLjQ4OGgtMjEuMzZ2MTYuODk2YzAsNS42MzItMy41ODQsOC44MTYtOC4xOTIsOC44MTZjLTQuMjI0LDAtOC42ODgtMy4xODQtOC42ODgtOC44MTZWMzAzLjE1MnogICAgTTExOC42MjQsMzEwLjQzMnYzMS44NzJoMjEuMzZjOC41NzYsMCwxNS4zNi03LjU2OCwxNS4zNi0xNS41MDRjMC04Ljk0NC02Ljc4NC0xNi4zNjgtMTUuMzYtMTYuMzY4SDExOC42MjR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTE5Ni42NTYsMzg0Yy00LjIyNCwwLTguODMyLTIuMzA0LTguODMyLTcuOTJ2LTcyLjY3MmMwLTQuNTkyLDQuNjA4LTcuOTM2LDguODMyLTcuOTM2aDI5LjI5NiAgIGM1OC40NjQsMCw1Ny4xODQsODguNTI4LDEuMTUyLDg4LjUyOEgxOTYuNjU2eiBNMjA0LjcyLDMxMS4wODhWMzY4LjRoMjEuMjMyYzM0LjU0NCwwLDM2LjA4LTU3LjMxMiwwLTU3LjMxMkgyMDQuNzJ6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTMwMy44NzIsMzEyLjExMnYyMC4zMzZoMzIuNjI0YzQuNjA4LDAsOS4yMTYsNC42MDgsOS4yMTYsOS4wNzJjMCw0LjIyNC00LjYwOCw3LjY4LTkuMjE2LDcuNjggICBoLTMyLjYyNHYyNi44NjRjMCw0LjQ4LTMuMTg0LDcuOTItNy42NjQsNy45MmMtNS42MzIsMC05LjA3Mi0zLjQ0LTkuMDcyLTcuOTJ2LTcyLjY3MmMwLTQuNTkyLDMuNDU2LTcuOTM2LDkuMDcyLTcuOTM2aDQ0LjkxMiAgIGM1LjYzMiwwLDguOTYsMy4zNDQsOC45Niw3LjkzNmMwLDQuMDk2LTMuMzI4LDguNzA0LTguOTYsOC43MDRoLTM3LjI0OFYzMTIuMTEyeiIvPgo8L2c+CjxwYXRoIHN0eWxlPSJmaWxsOiNDQUQxRDg7IiBkPSJNNDAwLDQzMkg5NnYxNmgzMDRjOC44LDAsMTYtNy4yLDE2LTE2di0xNkM0MTYsNDI0LjgsNDA4LjgsNDMyLDQwMCw0MzJ6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo="/>;
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
      showResults: false 
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
    var datalength = this.state.datashow.length;
    console.log("datalength"+datalength);
    if (datalength <= 10) {
      //มีข้อมูล 1-10แถว ไม่ต้องเพิ่มหน้า
      const input = document.getElementById('myPDF');
      const allfooter = document.getElementById('allfooter');
      html2canvas(input, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'pt', 'a4');
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.save(this.state.CodeDoc + ".pdf");
        }).then(() => this.props.clearpdf());
    } else {
      //มีข้อมูลมากกว่า 10-28 แถว ยก footer ไปหน้าใหม่
      // const input = document.getElementById('myPDF');
      const allfooter = document.getElementById('allfooter');
      const detail = document.getElementById('detail');
      const pdf = new jsPDF('p', 'pt', 'a4');
      pdf.setFontSize(12);
      pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
      html2canvas(detail, { dpi: 600 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'JPEG', 28, 40);
          pdf.addPage();
          pdf.setFontSize(12);
          pdf.text(470, 35, 'No. ' + this.state.CodeDoc);
          html2canvas(allfooter, { dpi: 300 })
            .then((canvas2) => {
              const imgData2 = canvas2.toDataURL('image/png');
              pdf.addImage(imgData2, 'JPEG', 28, 70);
              pdf.save(this.state.CodeDoc + ".pdf");
            }).then(() => this.props.clearpdf());
        });
    }

  }
  genData() {
    let dataitems = this.state.datasitems.datas;
    var groupdisplay = [];
    var packName = [];
    let groupdata = _.groupBy(dataitems, (e) => { return e.code });
    // console.log(groupdata);
    var no = parseInt(0);
    for (let i in groupdata) {
      var packName = "";
      var packQty = parseInt(0);
      groupdata[i].forEach((group, index) => {
        packName += group.packName;
        if (groupdata[i].length > index + 1)
          packName += ", ";
        packQty += group.packQty;
      })
      groupdisplay.push({
        "id": no += 1,
        "code": i,
        "item": packName,
        "qty": packQty
      });
    }
    this.setState({ datashow: groupdisplay }, () => this.htmlToPDF());
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
