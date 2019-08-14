import React, { useState, useEffect } from 'react';
import SaveIcon from '@material-ui/icons/Save';
import { useTranslation } from 'react-i18next'

import AmButton from "../AmButton";
import AmExportExcel from '../AmExportExcel'

const Export = (props) => {
    const { t } = useTranslation()
    const [isLoad, setIsLoad] = useState(false);

    return <div>
        <AmButton styleType="warning" onClick={(e) => setIsLoad(true)}>
            {t('Export Excel')}
        </AmButton>
        <AmExportExcel data={props.data}
            fileName={props.fileName}
            columns={props.cols}
            isLoading={isLoad}
            onToggleLoad={value => setIsLoad(value)} />
    </div>
}

export default Export