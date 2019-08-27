using AWMSEngine.Engine;
using ProjectAAI.ADO.SAPApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.Engine.Business.Issued
{
    public class SAPZWMRF003R4 : BaseEngine<CreateIssuedDocR1.TReq, List<SAPCriteria.ZSWMRF003_OUT_REQ>>
    {
        public class TReq
        {
            public string LENUM;
            public string LGTYP = "";
            public string LGBER = "";
            public string LGPLA = "";
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R01",
                LGNUM = "W01",
                LENUM = reqVO.LENUM,
                LGTYP = reqVO.LGTYP,
                LGBER = reqVO.LGBER,
                LGPLA = reqVO.LGPLA
            };

            var res = SAPInterfaceADO.GetInstant().ZWMRF003(sapCriteria, this.BuVO);

            return res.datas;
        }
    }
}
