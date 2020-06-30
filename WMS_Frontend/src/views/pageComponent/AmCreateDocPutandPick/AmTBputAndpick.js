import React, { useContext, useState } from "react";
import PropTypes from "prop-types"
import { PutandPickContext } from './PutandPickContext';
import AmTable from '../../../components/AmTable/AmTable';
import AmButton from '../../../components/AmButton';
import Grid from '@material-ui/core/Grid';





const AmTBputAndpick = (props) => {
    const { doc, dia } = useContext(PutandPickContext);

    const rem = [
        {
            Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="info" onClick={() => {
                // setEditData(Clone(e.original));
                setEditdata(e);

            }}>Edit</AmButton>,
        },
        {
            Header: "", width: 110, Cell: (e) => <AmButton style={{ width: "100px" }} styleType="delete" onClick={
                () => {
                    setRemoveData(e.original.ID, e.original, e);
                }}>Remove</AmButton>,
        }
    ];

    const columns = props.doccolumns.concat(rem)


    const setEditdata = (e) => {
        if (doc.editdata.length === 0) {
            console.log(e.original)
            doc.seteditdata([e.original])
         
        } else {
        }
        doc.setdialogItem(true)
    }

    const setRemoveData = (id, e) => {
        let idx = doc.dataSourceItemTB.findIndex(x => x.ID === id);
        doc.dataSourceItemTB.splice(idx, 1);
        doc.setdataSourceItemTB([...doc.dataSourceItemTB])
    }
    const onSubmitSetItem = () => {
        doc.seteditdata([]);
        doc.setdataSet(doc.dataSourceItemTB)
        doc.setdialogItem(true)
    }

    return <div>
        <Grid container>
            <Grid item xs container direction="column">
            </Grid>
            <Grid item>
                <div style={{ marginTop: "20px" }}>
        <AmButton
            styleType="add"
            onClick={() => {
                onSubmitSetItem();
            }}
                    >SET</AmButton>
                    
                </div>
            </Grid>
        </Grid>
        <AmTable
            columns={columns}
            dataSource={doc.dataSourceItemTB.length !=0 ? doc.dataSourceItemTB : []}
        ></AmTable>

        </div>
   
}

AmTBputAndpick.propTypes = {

}

AmTBputAndpick.defaultProps = {

}


export default AmTBputAndpick;