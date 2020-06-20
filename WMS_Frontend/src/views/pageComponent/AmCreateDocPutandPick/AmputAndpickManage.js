import React, { useContext } from "react";
import PropTypes from "prop-types"
import { WaveProvider } from './WaveContext';
import AmWaveManagement from './AmWaveManagement';
import AmWaveTab from './AmWaveTab';
import AmWaveDetail from './AmWaveDetail'

const AmWave = (props) => {
    return <WaveProvider>
        <AmWaveManagement
            waveDialog={props.waveDialog}
            waveColumns={props.waveColumns}
            waveQuery={props.waveQuery}
            waveArealocationMasterQuery={props.waveArealocationMasterQuery}
            waveAreaMasterQuery={props.waveAreaMasterQuery}
            waveCustomtabRunmode={props.waveCustomtabRunmode}
        />
        <div style={{ marginTop: "10px" }}>
            <AmWaveTab
                waveSeqQuery={props.waveSeqQuery}
            >
            </AmWaveTab></div>
        <div>
            <AmWaveDetail
                wavedetailColumns={props.wavedetailColumns}
                waveManageQuery={props.waveManageQuery}
            />
        </div>
    </WaveProvider>


}

AmWave.propTypes = {

}

AmWave.defaultProps = {

}

export default AmWave;