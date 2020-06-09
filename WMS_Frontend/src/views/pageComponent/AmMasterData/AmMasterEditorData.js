import React, {useState, useEffect} from "react";
import AmEditorTable from '../../../components/table/AmEditorTable';
import { IsEmptyObject } from "../../../components/function/CoreFunction2";
import {InputComponent, DropDownComponent, FindPopupComponent, DateTimeComponent} from "./AmMasterComponentType";

const EditorData = ({config, editorColumns, editData, response}) => {
    const [popupState, setPopState] = useState(false);
    
    useEffect(() => {
        if(editData !== undefined && editData !== null){
            setPopState(!popupState)
        }
    }, [editData])

    const genEditorField = (editColumns) => {
        const findEditorField = (config, field, data, key) => {
            if(config.type === "input"){
                return <InputComponent key={key} 
                    config={config} 
                    defaultData={data ? data[field] : ""}
                    response={(e)=>{if(!IsEmptyObject(e)){
                        data[e.field] =  e.value
                    }
                    }}
                />
            }
            else if(config.type === "dropdown"){
                console.log(data ? data[field] : "")
                return <DropDownComponent key={key} 
                    config={config}
                    response={(obj, val)=>{
                        if(obj !== null && obj !== undefined){
                            if(!IsEmptyObject(obj)){
                                data[field] =  val;
                            }
                        }
                    }}
                    defaultData={data ? data[field] : ""}
                    queryData={config.dataDropDown}
                />
            }
            else if(config.type === "findPopup"){
                return <FindPopupComponent key={key} 
                    config={config}
                    response={(obj, val)=>{
                        if(obj !== null && obj !== undefined){
                            if(!IsEmptyObject(obj)){
                                data[field] =  val;
                            }
                        }
                    }}
                    columns={config.findPopupColumns}
                    queryData={config.findPopopQuery}
                    defaultData={data ? data[field] : ""}
                />
            }
        }
        return editColumns.map(y=>{
            return { 
              "field":y.field,
              "component":(data=null, cols, key)=>{
                return <div key={key}>
                    {findEditorField(y, y.field, data, key)}
                </div>
              }
            }
        });
    }
    const cols = genEditorField(editorColumns)

    return <AmEditorTable 
        renderOptionalText={config.required === true ?<span style={{color:"red"}}>* required field  </span> : null}
        open={popupState} 
        onAccept={(status, rowdata)=> {
            //var res = response(status, rowdata)
            var updateData = {ID:null, Status:1, Revision:1}
            if(rowdata !== undefined){
                if(rowdata["ID"] !== null)
                    updateData["ID"] = rowdata["ID"]
                    editorColumns.forEach(x => {
                    if(rowdata[x.field] !== undefined){
                        updateData[x.field] = rowdata[x.field]
                    }
                });
            }
            response(status, !status ? null : updateData)
            //if(res.result === 1){
            //    setPopState(false)
            //}
            setPopState(false)
        }} 
        titleText={config.title} 
        data={editData}
        columns={cols}
    />
}

export default EditorData;