using AMSModel.Constant.EnumConst;
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
        public List<act_McWork> ListInWarehouse(string whCode)
        {
            var wh =WCSStaticValue.StaticValueManager.GetInstant().GetWarehouse(whCode);
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_Warehouse_ID", wh.ID.Value), null);
        }
        public List<act_McWork> ListInWarehouse(int whID)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_Warehouse_ID", whID), null);
        }
        public act_McWork GetByBaseObj(long baseObjID)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("BaseObject_ID", baseObjID), null).First();
        }
        public act_McWork GetByCurLocation(long locID)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("Cur_Location_ID", locID), null).First();
        }
        public act_McWork GetByMcObject(long mcObjID)
        {
            return DataADO.GetInstant().SelectBy<act_McWork>(
                ListKeyValue<string, object>
                    .New("Status", EntityStatus.ACTIVE)
                    .Add("McObject_ID", mcObjID), null).First();
        }
        public long? SetCurLocation(long mcWorkID, long locID)
        {
            return DataADO.GetInstant().UpdateByID<act_McWork>(
                mcWorkID,
                ListKeyValue<string, object>.New("Cur_Location_ID", locID),
                null);
        }
        public long? SetMcObject(long mcWorkID, long mcObjID)
        {
            return DataADO.GetInstant().UpdateByID<act_McWork>(
                mcWorkID,
                ListKeyValue<string, object>.New("McObject_ID", mcObjID),
                null);
        }
    }
}
