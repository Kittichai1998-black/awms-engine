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
        public act_McObject GetByMstID(long mstID, VOCriteria BuVO)
        {
            return DataADO.GetInstant().SelectBy<act_McObject>(
                new ListKeyValue<string, object>().Add("McMaster_ID", mstID).Add("Status", EntityStatus.ACTIVE).Items.ToArray()
                , BuVO).First();
        }
    }
}
