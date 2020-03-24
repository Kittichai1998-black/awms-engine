using AMWUtil.DataAccess;
using AWMSEngine.ADO.StaticValue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.ADO
{
    public class WaveADO : BaseMSSQLAccess<WaveADO>
    {
        public long? PUT(amt_Wave wave, VOCriteria buVO)
        {
            var param = new Dapper.DynamicParameters();
            param.Add("@ID", wave.ID);
            param.Add("@IoType", wave.IOType);
            param.Add("@Code", wave.Code);
            param.Add("@Name", wave.Name);
            param.Add("@Description", wave.Description);
            param.Add("@RunMode", wave.RunMode);
            param.Add("@RunScheduleTime", wave.RunScheduleTime);
            param.Add("@Priority", wave.Priority);
            param.Add("@StartTime", wave.StartTime);
            param.Add("@EndTime", wave.EndTime);
            param.Add("@EventStatus", wave.EventStatus);
            param.Add("@Status", wave.Status);
            param.Add("@ActionBy", buVO.ActionBy);

            var res = this.Query<long?>("SP_WAVE_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).FirstOrDefault();

            return res;
        }
        public long? SEQ_PUT(amt_WaveSeq wave, VOCriteria buVO)
        {
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
            param.Add("@Status", wave.Status);
            param.Add("@ActionBy", buVO.ActionBy);

            var res = this.Query<long?>("SP_WAVESEQ_PUT", CommandType.StoredProcedure, param, buVO.Logger, buVO.SqlTransaction).FirstOrDefault();

            return res;
        }

        public int UpdateStatusToChild(long waveID,
            WaveEventStatus? fromEventStatus, EntityStatus? fromStatus, WaveEventStatus? toEventStatus,
            VOCriteria buVO)
        {
            EntityStatus? toStatus = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<WaveEventStatus>(toEventStatus);
            Dapper.DynamicParameters param = new Dapper.DynamicParameters();
            param.Add("rootid", waveID);
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
    }
}
