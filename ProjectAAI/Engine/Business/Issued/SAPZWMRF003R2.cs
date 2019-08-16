using AMWUtil.Exception;
using AWMSEngine.Engine;
using ProjectAAI.ADO.SAPApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.Engine.Business.Issued
{
    public class SAPZWMRF003R2 : BaseEngine<SAPZWMRF003R2.TReq, List<SAPCriteria.ZSWMRF003_OUT_REQ>>
    {
        public class TReq
        {
            public long resvNum;
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R02",
                LGNUM = "W01",
                RSNUM = reqVO.resvNum,
            };

            var res = SAPInterfaceADO.GetInstant().ZWMRF003(sapCriteria, this.BuVO);

            if (res.datas.Any(x => x.ERR_MSG != "" || x.ERR_MSG != null))
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, res.datas.Find(x => x.ERR_MSG != "" || x.ERR_MSG != null).ERR_MSG);
            }

            return res.datas;
        }
    }
}
