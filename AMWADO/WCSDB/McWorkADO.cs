﻿using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
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
            return DataADO.GetInstant().SelectByID<act_McObject>(mstID, BuVO);
        }
    }
}
