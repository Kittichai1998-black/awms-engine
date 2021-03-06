using AMWUtil.DataAccess;
using ADO.WMSStaticValue;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ADO.WMSDB
{
    public class WaveADO : BaseWMSDB<WaveADO>
    {
        public long? Put(amt_Wave wave, VOCriteria buVO)
        {
            var WaveStatus = WMSStaticValue.StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WaveEventStatus>(wave.EventStatus);
            var param = new Dapper.DynamicParameters();
            param.Add("@ID", wave.ID);
            param.Add("@IoType", wave.IOType);
            param.Add("@Code", wave.Code);
            param.Add("@Name", wave.Name);
            param.Add("@DesAreaID", wave.Des_Area_ID);
            param.Add("@Description", wave.Description);
            param.Add("@RunMode", wave.RunMode);
            param.Add("@RunScheduleTime", wave.RunScheduleTime);
            param.Add("@Priority", wave.Priority);
            param.Add("@StartTime", wave.StartTime);
            param.Add("@EndTime", wave.EndTime);
            param.Add("@EventStatus", wave.EventStatus);
            param.Add("@Status", WaveStatus.Value);
            param.Add("@ActionBy", buVO.ActionBy);
            param.Add("@res", null, DbType.Int64, ParameterDirection.Output);

            this.Execute("SP_WAVE_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);

            var res = param.Get<long>("@res"); 
            return res;
        }
        public long? PutSeq(amt_WaveSeq wave, VOCriteria buVO)
        {
            var WaveStatus = WMSStaticValue.StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WaveEventStatus>(wave.EventStatus);
            var param = new Dapper.DynamicParameters();
            param.Add("@ID", wave.ID);
            param.Add("@Wave_ID", wave.Wave_ID);
            param.Add("@Seq", wave.Seq);
            param.Add("@Start_StorageObject_EventStatus", wave.Start_StorageObject_EventStatus);
            param.Add("@End_StorageObject_EventStatus", wave.End_StorageObject_EventStatus);
            param.Add("@AutoNextSeq", wave.AutoNextSeq);
            param.Add("@StartTime", wave.StartTime);
            param.Add("@EndTime", wave.EndTime);
            param.Add("@EventStatus", wave.EventStatus);
            param.Add("@Status", WaveStatus.Value);
            param.Add("@ActionBy", buVO.ActionBy);
            param.Add("@res", null, DbType.Int64, ParameterDirection.Output);

            this.Execute("SP_WAVESEQ_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction);

            var res = param.Get<long>("@res");
            return res;
            
        }

        public int UpdateStatusToChild(long waveID,
            WaveEventStatus? fromEventStatus, EntityStatus? fromStatus, WaveEventStatus? toEventStatus,
            VOCriteria buVO)
        {
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WaveEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("id", waveID);
            param.Add("fromEventStatus", fromEventStatus);
            param.Add("fromStatus", fromStatus);
            param.Add("toEventStatus", toEventStatus);
            param.Add("toStatus", toStatus);

            param.Add("actionBy", buVO.ActionBy);
            var res = this.Execute(
                "SP_WAVE_UPDATE_STATUS_TO_CHILD",
                System.Data.CommandType.StoredProcedure,
                param,
                buVO.Logger,
                buVO.SqlTransaction);
            return res;
        }

        public amt_Wave Get(long waveID, VOCriteria buVO)
        {
            var wave = DataADO.GetInstant().SelectByID<amt_Wave>(waveID, buVO);
            wave.WaveSeqs = DataADO.GetInstant().SelectBy<amt_WaveSeq>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("Wave_ID", waveID, SQLOperatorType.EQUALS)
                }, buVO);

            return wave;
        }
    
        public amt_Wave GetWaveAndSeq_byWaveSeq(long waveSeqID, VOCriteria buVO)
        {
            amt_WaveSeq waveSeq = DataADO.GetInstant().SelectByID<amt_WaveSeq>(waveSeqID, buVO);
            return this.GetWaveAndSeq(waveSeq.Wave_ID, buVO);
        }
        public amt_Wave GetWaveAndSeq(long waveID, VOCriteria buVO)
        {
            amt_Wave wave = DataADO.GetInstant().SelectByID<amt_Wave>(waveID, buVO);
            wave.WaveSeqs = DataADO.GetInstant().SelectBy<amt_WaveSeq>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("Wave_ID", waveID, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS)
            }, buVO);
            return wave;
        }
    }
}
