import Axios from 'axios';
import React, { useState, useEffect } from "react";
import TreeView from 'deni-react-treeview';

import { apicall } from '../../../components/function/CoreFunction2'

const axios = new apicall()

export default (props) => {

    const [Data, SetData] = useState([])
    const width = window.innerWidth - 240 - 48
    const height = window.innerHeight - 141

    useEffect(() => {
        Axios.get(window.apipath + "/v2/GetRootLogFile?apikey=FREE01").then(res => {
            if (res.data._result.status) {
                let dataFormated = []
                for (let x in Object.entries(res.data.datas.directory)[0][1].directory) {
                    dataFormated.push({
                        text: x, children: Object.entries(res.data.datas.directory)[0][1].directory[x].file.map(y => {
                            return { text: y, isLeaf: true, path: "D:/logs/" + Object.entries(res.data.datas.directory)[0][0] + "/" + x + "/" + y }
                        })
                    })
                }
                SetData(dataFormated)
            }
        })
    }, [])

    const getFile = (e) => {
        if (!e.children) {
            axios.get(window.apipath + "/v2/GetLogFile?path=" + e.path).then(res => {
                if (res.data._result.status) {
                    console.log(res.data.datas.join('\n'));
                    const element = document.createElement("a");
                    const file = new Blob([res.data.datas.join('\n')],
                        { type: 'text/plain;charset=utf-8' });
                    element.href = URL.createObjectURL(file);
                    element.download = e.text;
                    document.body.appendChild(element);
                    element.click();
                }
            })
        }

    }

    return (
        <div>
            <TreeView
                onSelectItem={(e) => getFile(e)}
                items={Data}
                style={{ width: width, height: height }}
            />
        </div>
    )
}

