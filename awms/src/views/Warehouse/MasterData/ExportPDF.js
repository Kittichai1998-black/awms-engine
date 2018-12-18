import React, { Component } from 'react';
import _ from 'lodash'
import { apicall, Clone } from '../ComponentCore'
import { Button, DropdownItem } from 'reactstrap';
import * as jsPDF from 'jspdf';
import './stylepdf.css';
import moment from 'moment';
import html2canvas from 'html2canvas';
//var pdfFonts = require('../../node_modules/jspdf-customfonts/dist/default_vfs.js');

class ExportPDF extends Component {
  constructor(props) {
    super(props);
    //this.state = {

    //}
    this.html2pdf = this.html2pdf.bind(this)
  }
  componentDidMount() {
    //console.log(this.props.column);
    //console.log(this.props.dataxls);
    this.html2pdf()
  }
  html2pdf() {
    const input = document.getElementById('printpdf');
    var heightPx = document.getElementById('printpdf').clientHeight;
    var widthPx = document.getElementById('printpdf').clientWidth;

    console.log(heightPx)
    console.log(widthPx)
    html2canvas(input, { dpi: 300 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'px', [widthPx, heightPx]);
          //{
          //orientation: widthPx > heightPx ? "l" : "p",
          //unit: "px",
          //format: {
          //  width: widthPx,
          //  height: heightPx
          //}
        //}
        
        pdf.setFontSize(12);
        pdf.text(470, 35, "Hello");
        pdf.addImage(imgData, 'JPEG', 0, 0);
        pdf.save(this.props.filename+".pdf");
      }).then(() => this.props.clearpdf());
  }

   
  render() {
    return (
      <div>
        <div id="parent4">
          <div id="printpdf" className="pdf">
            <table className="showitems" id="showtable" width="100%">
              <thead>
                 <tr> 
                  {this.props.column.map((item) => {
                    
                      <th>{item.Header}</th>
                  })}
                 </tr>
              </thead>

              <tbody>
                {/*this.readDataItems() id="divHidden" */}
                
              </tbody>
            </table>
        </div>
        </div>
      </div>
    )
  }
}

export default ExportPDF
