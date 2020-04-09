import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Axios from 'axios'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  paper: {
    marginTop: theme.spacing(3),
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

  useEffect(() => {
    const res = Axios.get(window.apipath + "/v2/GetSPReportAPI?&spname="
      + chartConfig.spname + "&_token=" + localStorage.getItem("Token"))
      .then(res => {

        let datas = res.data.datas;

        let dataHeader = []

        let datalist = []
        for (var key in datas[0]) {
          if (key.substring(key.length - 2, key.length - 1) === '_') {
            datalist.push(key.substring(key.length - 1, key.length))
          }
        }
        let numDatasets = new Set([...datalist]);
        for (let item of numDatasets) {

          let _header = datas[0]['header_' + item] ? datas[0]['header_' + item] : '';
          let _align = datas[0]['headerAlign_' + item] ? datas[0]['headerAlign_' + item] : '';
          let _width = datas[0]['headerWidth_' + item] ? datas[0]['headerWidth_' + item] : '';
          let _bgColor = datas[0]['headerBGColor_' + item] ? datas[0]['headerBGColor_' + item] : '';
          let _borderRight = datas[0]['headerBorderRight_' + item] ? datas[0]['headerBorderRight_' + item] : '';

          dataHeader.push({
            label: _header,
            align: _align,
            width: _width,
            backgroundColor: _bgColor,
            borderRight: _borderRight
          });
        }

        let temp = {
          dataHeader: dataHeader,
          dataRows: datas
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
      <Table size="small" >
        <TableHead >
          <TableRow >
            {datas.dataHeader.map((row, idx) => (
              (idx + 1) !== datas.dataHeader.length ?
                <TableCell style={{
                  fontWeight: 'bolder', width: row.width,
                  backgroundColor: row.backgroundColor ? row.backgroundColor : '#bdbdbd',
                  borderRight: row.borderRight ? row.borderRight : '1px solid #9e9e9e'
                }}
                  key={idx} align={row.align}>{row.label}</TableCell>
                :
                <TableCell style={{
                  fontWeight: 'bolder',
                  backgroundColor: row.backgroundColor ? row.backgroundColor : '#bdbdbd'
                }}
                  key={idx} align={row.align}>{row.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {datas.dataRows.map((row, idx) => (
            <TableRow key={idx}>
              {
                datas.dataHeader.map((rowx, idxs) => (
                  idxs === 0 ?
                    <TableCell key={idxs} component="th" scope="row" align={row['cellAlign_' + (idxs + 1)]}
                      style={{
                        borderRight: row['cellBorderRight_' + (idxs + 1)] ? row['cellBorderRight_' + (idxs + 1)] : '1px solid #e0e0e0',
                        backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null
                      }}>
                      {row['data_' + (idxs + 1)]}
                    </TableCell>
                    :
                    (idxs + 1) !== datas.dataHeader.length ?
                      <TableCell key={idxs} align={row['cellAlign_' + (idxs + 1)]}
                        style={{
                          borderRight: row['cellBorderRight_' + (idxs + 1)] ? row['cellBorderRight_' + (idxs + 1)] : '1px solid #e0e0e0',
                          backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null
                        }}>
                        {row['data_' + (idxs + 1)]}
                      </TableCell> :
                      <TableCell key={idxs} align={row['cellAlign_' + (idxs + 1)]}
                        style={{ backgroundColor: row['cellBGColor_' + (idxs + 1)] ? row['cellBGColor_' + (idxs + 1)] : null }}>
                        {row['data_' + (idxs + 1)]}
                      </TableCell>
                ))
                // Object.keys(row).map((key) => key === 0 ?
                //   <TableCell key={key} component="th" scope="row">{row[key]}</TableCell>
                //   :
                //   <TableCell key={key} >{row[key]}</TableCell>
                // )
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  return (
    <div>
      <div className={classes.root}>
        <Paper className={classes.paper}>
          {showTable}
        </Paper>
      </div>
    </div>

  )
}

export default GenerateChart;