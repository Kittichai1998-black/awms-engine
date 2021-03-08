using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class McWorkADO : BaseWCSDB<McWorkADO>
    {
        public List<act_McWork> ListInactive_inWarehouse(string whCode, VOCriteria buVO)
        {
            var wh = WCSStaticValue.StaticValueManager.GetInstant().GetWarehouse(whCode);
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.INACTIVE)
                    .Add("Cur_Warehouse_ID", wh.ID.Value), buVO);
        }
        public List<act_McWork> ListActive_inWarehouse(string whCode, VOCriteria buVO)
        {
            var wh =WCSStaticValue.StaticValueManager.GetInstant().GetWarehouse(whCode);
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_Warehouse_ID", wh.ID.Value), buVO);
        }
        public act_McWork GetByBaseObj(long baseObjID, VOCriteria buVO)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("BaseObject_ID", baseObjID), buVO).FirstOrDefault();
        }
        public act_McWork GetByCurLocation(long locID, VOCriteria buVO)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_Location_ID", locID), buVO).FirstOrDefault();
        }
        public act_McWork GetByDesMcObject(long curMcObjID, VOCriteria buVO)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Des_McObject_ID", curMcObjID), buVO).FirstOrDefault();
        }
        public act_McWork GetByCurMcObject(long curMcObjID, VOCriteria buVO)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_McObject_ID", curMcObjID), buVO).FirstOrDefault();
        }
        public long? UpdateCurLocation(long mcWorkID, long locID, VOCriteria buVO)
        {
            return DataADO.GetInstant().UpdateByID<act_McWork>(
                mcWorkID,
                ListKeyValue<string, object>.New("Cur_Location_ID", locID),
                null);
        }
        public long? UpdateMcObject(long mcWorkID, long mcObjID, VOCriteria buVO)
        {
            return DataADO.GetInstant().UpdateByID<act_McWork>(
                mcWorkID,
                ListKeyValue<string, object>.New("McObject_ID", mcObjID),
                buVO);
        }
    }
}
