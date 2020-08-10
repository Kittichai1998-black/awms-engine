import React, { useState, useEffect } from 'react';
import AmButton from '../components/AmButton'
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1)
        }
    },
    input: {
        display: "none"
    }
}));

const AmImportDocumentExcel = () => {

    const classes = useStyles();


    //let selectedFile;
    //console.log(window.XLSX);
    //document.getElementById('input').addEventListener("change", (event) => {
    //    selectedFile = event.target.files[0];
    //})




    //document.getElementById('button').addEventListener("click", () => {
    //    XLSX.utils.json_to_sheet(data, 'out.xlsx');
    //    if (selectedFile) {
    //        let fileReader = new FileReader();
    //        fileReader.readAsBinaryString(selectedFile);
    //        fileReader.onload = (event) => {
    //            let data = event.target.result;
    //            let workbook = XLSX.read(data, { type: "binary" });
    //            console.log(workbook);
    //            workbook.SheetNames.forEach(sheet => {
    //                let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
    //                console.log(rowObject);
    //                document.getElementById("jsondata").innerHTML = JSON.stringify(rowObject, undefined, 4)
    //            });
    //        }
    //    }

    const Opens = () => {
        //var selectedFile = event.target.files[0];

    }
    return (
        <div>
            <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
            />
            <label htmlFor="contained-button-file">
                <AmButton variant="contained" styleType="add" component="span">
                    Create Docment
        </AmButton>
            </label>
        </div>
    );
};


export default (AmImportDocumentExcel);
