using AWMSEngine.Engine;
using ProjectAAI.ADO.SAPApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.Engine.Business.Issued
{
    public class SAPZWMRF003R4 : BaseEngine<SAPZWMRF003R4.TReq, List<SAPCriteria.ZSWMRF003_OUT_REQ>>
    {
        public class TReq
        {
            public string LENUM = "";
            public long RSNUM;
            public string BESTQ_UR = "";
            public string BESTQ_QI = "";
            public string BESTQ_BLK = "";
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R04",
                LGNUM = "W01",
                RSNUM = reqVO.RSNUM,
                LENUM = reqVO.LENUM,
                BESTQ_UR = reqVO.BESTQ_UR,
                BESTQ_QI = reqVO.BESTQ_QI,
                BESTQ_BLK = reqVO.BESTQ_BLK
            };

            var res = SAPInterfaceADO.GetInstant().ZWMRF003(sapCriteria, this.BuVO);

            return res.datas;
        }
    }
}
