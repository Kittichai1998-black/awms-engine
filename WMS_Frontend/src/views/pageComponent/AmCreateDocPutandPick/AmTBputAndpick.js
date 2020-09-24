import React, { useContext, useState } from "react";
import PropTypes from "prop-types"
import { PutandPickContext } from './PutandPickContext';
import AmTable from '../../../components/AmTable/AmTable';
import AmButton from '../../../components/AmButton';
import AmInput from '../../../components/AmInput'
import AmEditorTable from '../../../components/table/AmEditorTable'
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Grid from '@material-ui/core/Grid';
import LabelT from '../../../components/AmLabelMultiLanguage'
import queryString from "query-string";
import styled from 'styled-components'

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;
const LabelTStyle = {
    "font-weight": "bold",
    width: "200px"
}


const InputDiv = styled.div`
margin: 5px;
@media(max - width: 800px) {
    margin: 0;
}
`;




const AmTBputAndpick = (props) => {
    const { doc, dia } = useContext(PutandPickContext);
    const [dialog, setdialog] = useState(false)

    const rem = [
        {
            Header: "", width: 30, Cell: (e) => <IconButton
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}
                onClick={() => {
                    setEditdatass(e);
                }}
            >
                <EditIcon
                    fontSize="small"
                    style={{ color: "#f39c12" }}
                />
            </IconButton>
        },

        {
            Header: "", width: 30, Cell: (e) =>
                <IconButton
                    size="small"
                    aria-label="info"
                    onClick={
                        () => {
                            setRemoveData(e.original.ID, e.original, e);
                        }}
                    style={{ marginLeft: "3px" }}>
                    <DeleteIcon
                        fontSize="small"
                        style={{ color: "#e74c3c" }} />
                </IconButton>

        }
    ];

    const columns = props.doccolumnEditItem.concat(rem)

    const setEditdatass = (e) => {
        console.log(e)
        doc.seteditdata([e.original])
        setdialog(true)
        console.log(dialog)
    }

    const onHandleEditConfirm = (status, rowdata, inputError) => {
        if (status) {
            let checkdata = doc.dataSourceItemTB.find(x => x.ID === rowdata.ID)
            if (checkdata) {
                for (let row in doc.editdata) {
                    checkdata[row] = doc.editdata[row]
                }

            }
            setdialog(false)

        }
        setdialog(false)

    }


    const onChangeEditor = (value, key) => {

        if (value !== 0 && value > 0) {
            if (doc.editdata[0]['Quantity'] !== undefined) {
                if (value > doc.editdata[0]['Quantity']) {
                    dia.setdailogErr(true)
                    dia.setdailogMsg("Qty is max")
                } else {
                    doc.editdata[0][key] = value
                }
            }
            //doc.editdata[0][key] = value
        } else {
            dia.setdailogErr(true)
            dia.setdailogMsg("Qty < 0")

        }

    }
    const setRemoveData = (id, e) => {
        let idx = doc.dataSourceItemTB.findIndex(x => x.ID === id);
        doc.dataSourceItemTB.splice(idx, 1);
        doc.setdataSourceItemTB([...doc.dataSourceItemTB])
    }

    const onSubmitSetItem = () => {
        //doc.seteditdata([]);
        doc.setdialogItemSet(true)
        //doc.setdataSet(doc.datadocItem)
        //doc.setdialogItem(true)
    }


    const editorListcolunm = () => {
        if (props.doccolumnEdit !== undefined) {
            return props.doccolumnEdit.map((row, i) => {
                return {
                    "field": row.accessor,
                    "component": (data = null, cols, key) => {
                        //let rowError = inputError.length ? inputError.some(x => { return x === row.accessor }) : false;
                        return <div key={key}>
                            {getTypeEditorItem(row)}

                        </div>
                    }
                }

            })
        }
    }

    const getTypeEditorItem = ({ type, Header, accessori, accessor, data, cols, row, idddl, queryApi,
        columsddl, fieldLabel, style, width, validate, placeholder, TextInputnum, texts, required }) => {
        if (type === "inputNum") {
            return (<div>
                <FormInline>
                    <FormInline>
                        <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    </FormInline>
                    <InputDiv>

                        <FormInline>{TextInputnum ? (
                            <FormInline>
                                <AmInput
                                    required={required}
                                    //error={rowError}
                                    // helperText={inputError.length ? "required field" : false}
                                    //inputRef={ref.current}
                                    defaultValue={doc.editdata[0][accessor] ? doc.editdata[0][accessor] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(ele, accessor) }} />
                                <div style={{ paddingLeft: "5px", paddingTop: "5px" }}>
                                    <LabelT>{TextInputnum}</LabelT>
                                </div>
                            </FormInline>
                        ) : (
                                <AmInput
                                    required={required}
                                    //error={rowError}
                                    //disable={checkItem[idx] ? checkIem[idx] : false}
                                    // helperText={inputError.length ? "required field" : false}
                                    //inputRef={ref.current}
                                    defaultValue={doc.editdata[0][accessor] ? doc.editdata[0][accessor] : ""}
                                    style={TextInputnum ? { width: "100px" } : { width: "300px" }}
                                    type="number"
                                    onChange={(ele) => { onChangeEditor(ele, accessor) }} />
                            )
                        }</FormInline>
                    </InputDiv>
                </FormInline>


            </div>)
        } else if (type === "text") {
            return (
                <div>
                    <LabelT style={LabelTStyle}>{Header} :</LabelT>
                    <label>{texts || doc.editdata[0][accessor]}</label >
                </div>

            )
        }
    }


    return <div>

        <AmEditorTable
            style={{ width: "600px", height: "500px" }}
            //titleText={title}
            open={dialog}
            onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError)}
            data={doc.editdata ? doc.editdata : []}
            columns={editorListcolunm()}
        />

        <Grid container>
            <Grid item xs container direction="column">
            </Grid>
            <Grid item>
                <div style={{ marginTop: "20px" }}>
                    {doc.dataSourceItemTB.length > 0 ? <AmButton
                        styleType="add"
                        onClick={() => {
                            onSubmitSetItem();
                        }}
                    >ADD</AmButton> : null}

                </div>
            </Grid>
        </Grid>
        <AmTable
            columns={columns}
            dataSource={doc.dataSourceItemTB.length != 0 ? [...doc.dataSourceItemTB] : []}
        ></AmTable>

    </div>

}

AmTBputAndpick.propTypes = {

}

AmTBputAndpick.defaultProps = {

}


export default AmTBputAndpick;