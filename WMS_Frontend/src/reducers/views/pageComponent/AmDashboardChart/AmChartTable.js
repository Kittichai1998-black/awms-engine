import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import { apicall } from '../../../components/function/CoreFunction'
const Axios = new apicall();

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    // marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
}));
const GenerateChart = props => {
  const classes = useStyles();

  const {
    // classes,
    chartConfig,
  } = props;

  const [dataRow, setDataRow] = useState([]);
  const [showTable, setShowTable] = useState(null);
  const [subTitle, setSubTitle] = useState(null);

  useEffect(() => {
    const res = Axios.get(window.apipath + "/v2/GetSPReportAPI?&spname="
      + chartConfig.spname)
      .then(res => {

        let datas = res.data.datas;

        let dataHeader = []

        let datalist = []
        console.log(datas[0])

        for (var key in datas[0]) {
          if (key.substring(key.length - 2, key.length - 1) === '_') {
            datalist.push(key.substring(key.length - 1, key.length))
          }
        }
        console.log(datalist)

        let numDatasets = new Set([...datalist]);
        console.log(numDatasets)
        for (let item of numDatasets) {

          let _header = datas[0]['header_' + item] ? datas[0]['header_' + item] : '';
          let _position = datas[0]['headerPosition_' + item] ? datas[0]['headerPosition_' + item] : '';
          let _width = datas[0]['headerWidth_' + item] ? datas[0]['headerWidth_' + item] : '';
          let _bgColor = datas[0]['headerBGColor_' + item] ? datas[0]['headerBGColor_' + item] : '';
          let _borderRight = datas[0]['headerBorderRight_' + item] ? datas[0]['headerBorderRight_' + item] : '';
          let _fontColor = datas[0]['headerFontColor_' + item] ? datas[0]['headerFontColor_' + item] : '';
          dataHeader.push({
            label: _header,
            position: _position,
            width: _width,
            backgroundColor: _bgColor,
            borderRight: _borderRight,
            fontColor: _fontColor
          });
        }
        let dataTitle = {
          title: datas[0].options_title_text ? datas[0].options_title_text : null,
          position: datas[0].options_title_position ? datas[0].options_title_position : null,
          fontColor: datas[0].options_title_fontColor ? datas[0].options_title_fontColor : null,
          fontSize: datas[0].options_title_fontSize ? datas[0].options_title_fontSize : null,
        }
        console.log(dataTitle)

        let temp = {
          dataHeader: dataHeader,
          dataRows: datas,
          dataTitle: dataTitle
        }
        const tempTable = genTableRow(temp);
        setShowTable(tempTable)

      })
      .catch(error => {
        console.log(error)
      });

  }, [chartConfig])

  const genTableRow = (datas) => {
    console.log(datas)
    return (
      <div>
        {datas.dataTitle.title ?
          <div style={{
            marginTop: '4px',
            textAlign: datas.dataTitle.position
          }}>
            <label color={datas.dataTitle.fontColor ? datas.dataTitle.fontColor : '#000000'}
              style={{
                fontWeight: 'bolder',
                fontSize: datas.dataTitle.fontSize ? datas.dataTitle.fontSize : 18,
                color: datas.dataTitle.fontColor ? datas.dataTitle.fontColor : '#000000'
              }}>
              {datas.dataTitle.title}
            </label>
          </div>
          : null
        }
        <TableContainer component={Paper}>
          <Table size="small" >
            <TableHead >
              <TableRow >
                {datas.dataHeader.map((row, idx) => (
                  (idx + 1) !== datas.dataHeader.length ?
                    <TableCell style={{
                      fontWeight: 'bolder', width: row.width,
                      backgroundColor: row.backgroundColor ? row.backgroundColor : '#bdbdbd',
                      borderRight: row.borderRight ? row.borderRight : '1px solid #9e9e9e',
                      color: row.fontColor
                    }}
                      key={idx} align={row.position}>{row.label}</TableCell>
                    :
                    <TableCell style={{
                      fontWeight: 'bolder',
                      backgroundColor: row.backgroundColor ? row.backgroundColor : '#bdbdbd',
                      color: row.fontColor
                    }}
                      key={idx} align={row.position}>{row.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {datas.dataRows.map((row, idx) => (
                <TableRow key={idx}>
                  {
                    datas.dataHeader.map((rowx, idxs) => (
                      idxs === 0 ?
                        <TableCell key={idxs} component="th" scope="row" align={row['cellPosition_' + (idxs + 1)]}
                          style={{
                            borderRight: row['cellBorderRight_' + (idxs + 1)] ? row['cellBorderRight_' + (idxs + 1)] : '1px solid #e0e0e0',
                            backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null,
                            color: row['cellFontColor_' + (idxs + 1)] ? row['cellFontColor_' + (idxs + 1)] : null
                          }}>
                          {row['data_' + (idxs + 1)]}
                        </TableCell>
                        :
                        (idxs + 1) !== datas.dataHeader.length ?
                          <TableCell key={idxs} align={row['cellPosition_' + (idxs + 1)]}
                            style={{
                              borderRight: row['cellBorderRight_' + (idxs + 1)] ? row['cellBorderRight_' + (idxs + 1)] : '1px solid #e0e0e0',
                              backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null,
                              color: row['cellFontColor_' + (idxs + 1)] ? row['cellFontColor_' + (idxs + 1)] : null
                            }}>
                            {row['data_' + (idxs + 1)]}
                          </TableCell> :
                          <TableCell key={idxs} align={row['cellPosition_' + (idxs + 1)]}
                            style={{
                              backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null,
                              color: row['cellFontColor_' + (idxs + 1)] ? row['cellFontColor_' + (idxs + 1)] : null
                            }}>
                            {row['data_' + (idxs + 1)]}
                          </TableCell>
                    ))
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    )
  }
  return (
    <div>
      <div className={classes.root}>
        <Paper className={classes.paper}>
          {subTitle}
          {showTable}
        </Paper>
      </div>
    </div>

  )
}

export default GenerateChart;