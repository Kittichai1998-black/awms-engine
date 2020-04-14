import React, { useContext } from "react";
import PropTypes from "prop-types"
import { WaveProvider } from './WaveContext';
import AmWaveManagement from './AmWaveManagement';
import AmWaveTab from './AmWaveTab';
import AmWaveDetail from './AmWaveDetail'

const AmWave = (props) => {
    return <WaveProvider>
            <AmWaveManagement
                waveColumns={props.waveColumns}
                WavemangeQuery={props.WavemangeQuery}
            />
            <AmWaveTab/>
            <AmWaveDetail detailColumns={props.detailColumns}/>
        </WaveProvider>

    
}

AmWave.propTypes = {

}

AmWave.defaultProps = {

}

export default AmWave;