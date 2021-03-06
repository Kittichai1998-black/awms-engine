using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class McObjectADO : BaseWCSDB<McObjectADO>
    {
        public act_McObject GetByID(long id, VOCriteria BuVO)
        {
            return DataADO.GetInstant().SelectBy<act_McObject>(
                new ListKeyValue<string, object>().Add("ID", id)
                , BuVO).FirstOrDefault();
        }
        public act_McObject GetByMstID(long mstID, VOCriteria BuVO)
        {
            return DataADO.GetInstant().SelectBy<act_McObject>(
                new ListKeyValue<string, object>().Add("McMaster_ID", mstID).Add("Status", EntityStatus.ACTIVE).Items.ToArray()
                , BuVO).FirstOrDefault();
        }
        public act_McObject GetByMstCode(string mstCode, VOCriteria BuVO)
        {
            var mcMst = WCSStaticValue.StaticValueManager.GetInstant().GetMcMaster(mstCode);
            return DataADO.GetInstant().SelectBy<act_McObject>(
                new ListKeyValue<string, object>().Add("McMaster_ID", mcMst.ID.Value)
                .Add("Status", EntityStatus.ACTIVE).Items.ToArray()
                , BuVO).FirstOrDefault();
        }
        public void BatteryLow_CheckOut(long shuID, int statusType, int statusQueue,VOCriteria buVO)
        {
            Dapper.DynamicParameters parameters = new Dapper.DynamicParameters();
            parameters.Add("shu_id", shuID);
            parameters.Add("statusType", statusType);
            parameters.Add("statusQueue", statusQueue);
            DataADO.GetInstant().QuerySP("SP_SHULOWBAT", parameters, buVO);
        }
    }
}
