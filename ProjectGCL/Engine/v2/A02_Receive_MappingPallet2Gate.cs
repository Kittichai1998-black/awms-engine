using AWMSEngine.Engine;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectGCL.Engine.v2
{
    public class A02_Receive_MappingPallet2Gate : BaseEngine<A02_Receive_MappingPallet2Gate.TReq, TRES__return>
    {
        protected override TRES__return ExecuteEngine(TReq reqVO)
        {
            ADO.WMSDB.WcsADO.GetInstant().SP_CreateBaseObject(reqVO.product_qr, reqVO.gate_code, this.BuVO);
            return new TRES__return { };
        }

        public class TReq
        {
            public string gate_code;
            public string product_qr;
        }
    }
}
