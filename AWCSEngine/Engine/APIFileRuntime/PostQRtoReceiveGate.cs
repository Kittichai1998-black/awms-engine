using ADO.WCSStaticValue;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWCSEngine.Controller;
using AWCSEngine.Engine.CommonEngine;
using AWCSEngine.Engine.McRuntime;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWCSEngine.Engine.APIFileRuntime
{
    public class PostQRtoReceiveGate : BaseAPIFileRuntime
    {
        public class TReq
        {
            public string GateCode;
            public List<string> QR;
        }
        public class TRes
        {
            public string GateCode;
            public List<string> QR;
        }

        public PostQRtoReceiveGate(string logref) : base(logref)
        {
        }

        protected override dynamic ExecuteChild(dynamic _req)
        {
            var req = ObjectUtil.DynamicToModel<TReq>(_req);
            if (req.QR.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_QR_IS_NULL);

            //var mcGate = McRuntimeController.GetInstant().GetMcRuntime(req.GateCode);
            //if (mcGate == null)
            //    throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_NOT_FOUND, req.GateCode);

            
            if (InboundGate_W08(req)) ;
            else if (Inbound_W07(req)) ;
            else if (Inbound_W06(req)) ;
            else if (Inbound_W04(req)) ;
            else if (Inbound_W03(req)) ;
            else if (Inbound_W02(req)) ;
            else { throw new AMWException(this.Logger, AMWExceptionCode.V0_INBOUND_CONDITION_FAIL); }

            return new TRes() { GateCode = req.GateCode, QR = req.QR };
        }

        private bool InboundGate_W08(TReq req)
        {
            if (!req.GateCode.In("RC8-2", "PS8-4", "PS8-5")) return false;

            var mcObj = ADO.WCSDB.McObjectADO.GetInstant().GetByMstCode(req.GateCode,this.BuVO);
            new CreateBaseObjectTemp_byQR(this.LogRefID, this.BuVO).Execute(new CreateBaseObjectTemp_byQR.TReq()
            {
                McObject_ID = mcObj.ID.Value,
                LabelData = string.Join(",", req.QR.ToArray())
                
            });

            return true;
        }

        private bool Inbound_W07(TReq req)
        {
            return false;
        }

        private bool Inbound_W06(TReq req)
        {
            return false;
        }

        private bool Inbound_W04(TReq req)
        {
            return false;
        }
        private bool Inbound_W03(TReq req)
        {
            return false;
        }
        private bool Inbound_W02(TReq req)
        {
            return false;
        }

    }
}
