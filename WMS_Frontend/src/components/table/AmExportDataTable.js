import React, { useState, useEffect } from 'react';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next'
import AmButton from "../AmButton";
import AmExportExcel from '../AmExportExcel'
import { apicall } from '../../components/function/CoreFunction'
const Axios = new apicall();
const useExportExcel = (initialData, onExcelFooter) => {
    const [dataSrc, setDataSrc] = useState(initialData);

    async function GetDataExport(queryAPI) {
        try {
            const resData = await Axios.get(queryAPI).then(res => {
                if (res.data.datas) {
                    if (res.data._result.status !== 0) {
                        return (res.data.datas);
                    }
                }
            });
            if (onExcelFooter) {
                setDataSrc(onExcelFooter(resData));
            } else {
                setDataSrc(resData);
            }
        } catch (err) {
            setDataSrc([]);
        }

    }
    const onClickLoad = (queryAPI) => {
        if (queryAPI) {
            GetDataExport(queryAPI);
        } else {
            if (dataSrc && dataSrc.length > 0 && onExcelFooter) {
                setDataSrc(onExcelFooter(dataSrc));
            }
        }
    };

    return { dataSrc, onClickLoad };
};
const Export = (props) => {
    const { t } = useTranslation()
    const { data, excelQueryAPI, onExcelFooter, cols, fileName } = props;
    const { dataSrc, onClickLoad } = useExportExcel(data, onExcelFooter);

    const [isLoad, setIsLoad] = useState(false);
    useEffect(() => {
        if (dataSrc && dataSrc.length > 0) {
            setIsLoad(true);
        }
    }, [dataSrc]);

    return <div>
        <AmButton styleType="warning" onClick={(e) => onClickLoad(excelQueryAPI)}>
            {t('Export Excel')}
        </AmButton>
        <AmExportExcel
            data={dataSrc}
            fileName={fileName}
            columns={cols}
            isLoading={isLoad}
            onToggleLoad={value => setIsLoad(value)} />
    </div>
}

export default Export