using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ADO.WCSDB
{
    public class McObjectADO : BaseWCSDB<McObjectADO>
    {
        public act_McObject GetByMstID(long mstID, VOCriteria BuVO)
        {
            return DataADO.GetInstant().SelectBy<act_McObject>(
                new KeyValuePair<string, object>[]{
                    new KeyValuePair<string, object>("McMaster_ID", mstID)
                }, BuVO).FirstOrDefault();
        }
    }
}
