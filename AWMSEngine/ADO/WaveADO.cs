using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class WaveADO : BaseAPIAccess<WaveADO>
    {
        public amt_Wave GetWaveAndSeq_byWaveSeq(long waveSeqID, VOCriteria buVO)
        {
            amt_WaveSeq waveSeq = ADO.DataADO.GetInstant().SelectByID<amt_WaveSeq>(waveSeqID, buVO);
            return this.GetWaveAndSeq(waveSeq.Wave_ID, buVO);
        }
        public amt_Wave GetWaveAndSeq(long waveID, VOCriteria buVO)
        {
            amt_Wave wave = ADO.DataADO.GetInstant().SelectByID<amt_Wave>(waveID, buVO);
            wave.WaveSeqs = ADO.DataADO.GetInstant().SelectBy<amt_WaveSeq>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("Wave_ID", waveID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
            }, buVO);
            return wave;
        }
    }
}
