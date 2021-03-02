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
    public class PostQRtoReceiveGate : BaseAPIFileEngine<PostQRtoReceiveGate.TReq, PostQRtoReceiveGate.TRes>
    {
        public class TReq
        {
            public string GateCode;
            public string QR;
        }
        public class TRes
        {
            public string GateCode;
            public string QR;
        }

        public PostQRtoReceiveGate(string logref) : base(logref)
        {
        }

        protected override TRes ExecuteChild(TReq req)
        {
            if (string.IsNullOrWhiteSpace(req.QR))
                throw new AMWException(this.Logger, AMWExceptionCode.V0_QR_IS_NULL, req.QR);

            var mcGate = McRuntimeController.GetInstant().GetMcRuntime(req.GateCode);
            if (mcGate == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V0_MC_NOT_FOUND, req.GateCode);

            
            if (InboundGate_W08(req, mcGate)) ;
            else if (Inbound_W07(req, mcGate)) ;
            else if (Inbound_W06(req, mcGate)) ;
            else if (Inbound_W04(req, mcGate)) ;
            else if (Inbound_W03(req, mcGate)) ;
            else if (Inbound_W02(req, mcGate)) ;
            else { throw new AMWException(this.Logger, AMWExceptionCode.V0_INBOUND_CONDITION_FAIL); }

            return new TRes() { GateCode = req.GateCode, QR = req.QR };
        }

        private bool InboundGate_W08(TReq req, BaseMcRuntime mcGate)
        {
            if (!mcGate.Code.In("RC8-2", "PS8-4", "PS8-5")) return false;
            new CreateBaseObjectTemp_byQR(this.LogRefID, this.BuVO).Execute(new CreateBaseObjectTemp_byQR.TReq()
            {
                McObject_ID = mcGate.ID,
                LabelData = req.QR
            });

            return true;
        }

        private bool Inbound_W07(TReq req, BaseMcRuntime mcGate)
        {
            return false;
        }

        private bool Inbound_W06(TReq req, BaseMcRuntime mcGate)
        {
            return false;
        }

        private bool Inbound_W04(TReq req, BaseMcRuntime mcGate)
        {
            return false;
        }
        private bool Inbound_W03(TReq req, BaseMcRuntime mcGate)
        {
            return false;
        }
        private bool Inbound_W02(TReq req, BaseMcRuntime mcGate)
        {
            return false;
        }

    }
}
