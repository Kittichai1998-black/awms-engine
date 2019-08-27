using AMWUtil.Exception;
using AWMSEngine.Engine;
using ProjectAAI.ADO.SAPApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectAAI.Engine.Business.Issued
{
    public class SAPZWMRF003R5 : BaseEngine<SAPZWMRF003R5.TReq, List<SAPCriteria.ZSWMRF003_OUT_REQ>>
    {
        public class TReq
        {
            public string VBELN_VL = "";
            public string POSNR = "";
            public string MATNR = "";
            public string CHARG = "";
        }

        protected override List<SAPCriteria.ZSWMRF003_OUT_REQ> ExecuteEngine(TReq reqVO)
        {
            var sapCriteria = new SAPCriteria.ZSWMRF003_IN_REQ()
            {
                ZMODE = "R05",
                LGNUM = "W01",
                VBELN_VL = reqVO.VBELN_VL,
                POSNR = reqVO.POSNR,
                CHARG = reqVO.CHARG,
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
