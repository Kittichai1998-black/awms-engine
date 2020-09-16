import React, {useState, useEffect} from "react";
import AmEditorTable from '../../../components/table/AmEditorTable';
import { IsEmptyObject } from "../../../components/function/CoreFunction2";
import {InputComponent, DropDownComponent, FindPopupComponent,PasswordComponent} from "./AmMasterComponentType";

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
                    defaultData={data !== undefined ? data[field] : ""}
                    response={(e)=>{if(!IsEmptyObject(e)){
                        data[e.field] =  e.value
                    }
                    }}
                />
            }
            else if(config.type === "password"){
                return <PasswordComponent key={key} 
                    config={config} 
                    defaultData={data !== undefined ? data[field] : ""}
                    response={(e)=>{if(!IsEmptyObject(e)){
                        if(config.custom !== undefined){
                            data[e.field] =  config.custom(e.value)
                        }
                        else{
                            data[e.field] =  e.value
                        }
                    }
                    }}
                />
            }
            else if(config.type === "dropdown"){
                return <DropDownComponent key={key} 
                    config={config}
                    response={(obj, val)=>{
                        if(obj !== null && obj !== undefined){
                            if(!IsEmptyObject(obj)){
                                data[field] =  val;
                            }
                        }
                    }}
                    defaultData={data !== undefined ? data[field] : ""}
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
                    defaultData={data !== undefined ? data[field] : ""}
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
            var updateData = {...editData}
            let chkRequire = []

            if(rowdata !== undefined){
                if(rowdata["ID"] !== null)
                    updateData["ID"] = rowdata["ID"]
                    chkRequire = editorColumns.map(x => {
                    if(rowdata[x.field] !== undefined){
                        updateData[x.field] = rowdata[x.field]
                    }
                    if((rowdata[x.field] === undefined || rowdata[x.field] === '') && x.required)
                        return false;
                    else 
                        return true;
                });
            }
            
            if(!status){
                setPopState(false)
            }
            else{
                if(chkRequire.find(x => !x) !== undefined){
                    response(status, {messageError:"กรุณากรอกข้อมูลไห้ครบ"})
                }else{
                    response(status, updateData);
                    setPopState(false)
                }
            }
            //if(res.result === 1){
            //    setPopState(false)
            //}
        }} 
        titleText={config.title} 
        data={editData}
        columns={cols}
    />
}

export default EditorData;