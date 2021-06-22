using ADO.WMSDB;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class SCE06_RequestCapInformation_Engine : AWMSEngine.Engine.BaseEngine<TREQ_Request_CAP, TRES_Request_CAP>
    {
        protected override TRES_Request_CAP ExecuteEngine(TREQ_Request_CAP reqVO)
        {
            TRES_Request_CAP res = new TRES_Request_CAP();
            res.WH_CAP = new List<TRES_Request_CAP.TWH_CAP>();
            reqVO.RECORD.LINE.ForEach(x =>
            {
                res.API_REF = x.API_REF;
                res.Date_time = x.API_Date_Time;
                res.WH_CAP.AddRange(exec(x));
            });

            return res;
        }
        private TRES_Request_CAP.TWH_CAP[] exec(TREQ_Request_CAP.TRecord.TLine req)
        {
            Dapper.DynamicParameters datas = new Dapper.DynamicParameters();
            datas.Add("@CUSTOMER_CODE", req.CUSTOMER_CODE);
            datas.Add("@SKU", req.SKU);
            datas.Add("@LOT", req.LOT);
            datas.Add("@UD_CODE", req.UD_CODE);

            var res2 = DataADO.GetInstant().QuerySP< TRES_Request_CAP.TWH_CAP>("SP_SCE06_RequestCapInformation", datas, BuVO).ToArray();
            return res2;
        }
    }
}
