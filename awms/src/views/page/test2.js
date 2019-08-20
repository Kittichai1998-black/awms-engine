import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
    root: {
      width: '100%',
      marginTop: theme.spacing(3),
      overflowX: 'auto',
    },
    table: {
      minWidth: 700,
    },
  });
  
  let id = 0;

  function createData(name, calories, fat, lname, protein) {
    id += 1;
    return { id, name, calories, fat, lname, protein };
  }
  const rows = [
    createData('Frozen yoghurtFrozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];

  const columns = [{"field":"name", "Header":"Name", "fieldType":"Text", "Cell":null},
  {"field":"lname", "Header":"Last Name", "fieldType":"Text", "Cell":null},
  {"field":"age", "Header":"Age", "fieldType":"Text", "Cell":null},
  {"field":"height", "Header":"Height", "fieldType":"Text", "Cell":null},
  {"field":"weight", "Header":"Weight", "fieldType":"Text", "Cell":null}]

class Test2 extends Component{
    render(){
        const {classes} = this.props;
        return (
            <div>

        <Table className={classes.table}>
            <TableHead>

            <TableRow>
                {columns.map((x,idx) => {
                    return <TableCell key={idx}>{x.Header}</TableCell>
                })}
            </TableRow>
            </TableHead>
            <TableBody>
            {rows.map((x,idx) => {
                return <TableRow key={x.id}>
                {columns.map((y,idx2) => {
                    let element = []
                    Object.keys(x).forEach((z,idx3) => {
                        if(y.field === z){
                            if(y.Cell === null){
                                element.push(<TableCell key={idx3} component="th" scope="row">{x[z]}</TableCell>)
                            }else{
                                element.push(<TableCell key={idx3} component="th" scope="row">{x[z]}</TableCell>)
                            }
                        }
                    })
                    return element
                })}
                </TableRow>
            })}
            </TableBody>
                </Table>
                </div>
        )
    }
}

export default withStyles(styles)(Test2);