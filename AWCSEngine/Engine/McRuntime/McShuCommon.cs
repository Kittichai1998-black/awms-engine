﻿using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AWCSEngine.Engine.McRuntime
{
    public class McShuCommon : BaseMcRuntime
    {
        public McShuCommon(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override void OnRun()
        {
            if (this.McObj.DV_Pre_Zone != 0)
            {
                string rowLv = this.McObj.DV_Pre_RowLevel.ToString("000000");
                var curLoc = this.StaticValue.ListLocationByWarehouse(this.Cur_Area.Warehouse_ID)
                    .FirstOrDefault(x => x.Code.EndsWith(rowLv) && x.Info1.ToLower() == "zone_" + this.McObj.DV_Pre_Zone);
                if (curLoc != null)
                    this.McObj.Cur_Location_ID = curLoc.ID.Value;
            }
        }

        protected override bool OnRun_COMMAND()
        {
            return false;
        }

        protected override bool OnRun_DONE()
        {
            return false;
        }

        protected override bool OnRun_ERROR()
        {
            return false;
        }

        protected override bool OnRun_IDLE()
        {
            return false;
        }

        protected override bool OnRun_WORKING()
        {
            return false;
        }
    }
}
