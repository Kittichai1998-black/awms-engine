import Axios from 'axios';
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import TreeView from 'deni-react-treeview';

// import { apicall } from '../../../components/function/CoreFunction2'
// import { Clone } from '../../../components/function/CoreFunction2'
import AmInput from '../../../components/AmInput'
// const axios = new apicall()
import moment from 'moment'

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth - 240 - 48, window.innerHeight - 141 - 42]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

export default (props) => {

    const [dataUse, setDataUse] = useState([])
    const [dataInitial, setDataInitial] = useState([])
    const [width, height] = useWindowSize()
    const treeview = useRef();

    useEffect(() => {
        setDataUse(dataInitial)
    }, [dataInitial])

    useEffect(() => {
        treeview.current.api.load()
    }, [dataUse])

    useEffect(() => {
        Axios.get(window.apipath + "/v2/GetDirectoryLogFile?apikey=FREE01").then(res => {
            if (res.data._result.status) {
                const dataNew = res.data.datas.directory.map(x => {
                    return { text: x, children: [{ isLeaf: true }] }
                }).sort((a, b) => b.text - a.text)
                setDataInitial(dataNew)
            }
        })
    }, [])

    const GetFile = (e) => {
        if (e.expanded && !e.children[0].text) {
            Axios.get(window.apipath + "/v2/GetDirectoryLogFile?apikey=FREE01&file=/" + e.text).then(res => {
                if (res.data._result.status) {
                    const dataNew = [...dataUse]
                    const dataFolderSelect = dataNew.find(x => x.text === e.text)
                    dataFolderSelect.children.length = 0
                    res.data.datas.file.name.forEach((x, xi) => {
                        dataFolderSelect.children.push({ text: x + " - " + moment(res.data.datas.file.modifyDate[xi]).format("DD/MM/YYYY | HH:mm"), file: e.text, isLeaf: true, textOriginal: x })
                    });
                    setDataUse(dataNew)
                }
            })
        }
    }

    const DownloadFile = (e) => {
        if (e.isLeaf) {
            const file_path = window.apipath + "/download/log?apikey=" + localStorage.getItem("Token") + "&path=/" + e.file + "/" + e.textOriginal;
            const a = document.createElement('A');
            a.href = file_path;
            a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    const onKeyUp = (e) => {
        const dataNew = [...dataInitial]
        const dataFolderSearch = dataNew.filter(x => x.text.match(e))
        setDataUse(dataFolderSearch)
    }

    return (
        <div>
            <AmInput
                style={{ width: "300px", paddingBottom: "10px" }}
                type="search"
                placeholder={"Search"}
                onKeyUp={onKeyUp}
            />
            <TreeView
                // selectRow={true}
                ref={treeview}
                onExpanded={GetFile}
                onSelectItem={DownloadFile}
                items={dataUse}
                style={{ width: width, height: height }}
            />
        </div>
    )
}

