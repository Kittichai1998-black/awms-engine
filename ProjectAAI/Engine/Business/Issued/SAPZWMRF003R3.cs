using AMWUtil.Exception;
using AWMSEngine.Engine;
using ProjectAAI.ADO.SAPApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.Engine.Business.Issued
{
    public class SAPZWMRF003R3 : BaseEngine<SAPZWMRF003R3.TReq, List<SAPCriteria.ZSWMRF003_OUT_REQ>>
    {
        public class TReq
        {
            public string stoNum = "";
            public long resvNum;
            public string ur = "";
            public string qi = "";
            public string blocked = "";
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R03",
                LGNUM = "W01",
                LENUM = reqVO.stoNum,
                RSNUM = reqVO.resvNum,
                BESTQ_UR = reqVO.ur,
                BESTQ_QI = reqVO.qi,
                BESTQ_BLK = reqVO.blocked
            };

            var res = SAPInterfaceADO.GetInstant().ZWMRF003(sapCriteria, this.BuVO);

            if(res.datas.Any(x=>x.ERR_MSG != "" || x.ERR_MSG != null))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, res.datas.Find(x => x.ERR_MSG != "" || x.ERR_MSG != null).ERR_MSG);
            }

            return res.datas;
        }
    }
}
