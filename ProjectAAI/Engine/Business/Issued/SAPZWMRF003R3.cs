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
            public string LENUM = "";
            public long RSNUM;
            public string BESTQ_UR = "";
            public string BESTQ_QI = "";
            public string BESTQ_BLK = "";
            public string MATNR;
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R03",
                LGNUM = "W01",
                LENUM = reqVO.LENUM,
                RSNUM = reqVO.RSNUM,
                BESTQ_UR = reqVO.BESTQ_UR,
                BESTQ_QI = reqVO.BESTQ_QI,
                BESTQ_BLK = reqVO.BESTQ_BLK,
                MATNR = reqVO.MATNR
            };

            var res = SAPInterfaceADO.GetInstant().ZWMRF003(sapCriteria, this.BuVO);

            if(res.datas.Any(x=>x.ERR_MSG != ""))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, res.datas.Find(x => x.ERR_MSG != "").ERR_MSG);
            }

            return res.datas;
        }
    }
}
