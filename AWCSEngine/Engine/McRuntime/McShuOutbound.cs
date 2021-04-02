using System;
using System.Collections.Generic;
using System.Text;
using ADO.WCSDB;
using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWCSEngine.Controller;
using System.Linq;

namespace AWCSEngine.Engine.McRuntime
{
    public class McShuOutbound : BaseMcRuntime
    {
        public McShuOutbound(acs_McMaster mcMst) : base(mcMst)
        {
        }

        protected override McTypeEnum McType => McTypeEnum.SHU;

        protected override void OnEnd()
        { 
            /// throw new NotImplementedException();
        }

        protected override void OnRun()
        {
            // Check % แบต
            var iStat = this.McObj.DV_Pre_Status;
            if (this.McObj.McMaster_ID == 107)
            {

            }
            ///

            ///
            ///

            ///

            ///
        }

        protected override void OnStart()
        {
            
        }
    }
}
