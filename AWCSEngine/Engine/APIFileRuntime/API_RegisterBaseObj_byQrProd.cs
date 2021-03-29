using ADO.WCSDB;
using ADO.WCSStaticValue;
using AMSModel.Constant.EnumConst;
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
    public class API_RegisterBaseObj_byQrProd : BaseAPIFileRuntime
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
            public string ResultMessage;
        }

        public API_RegisterBaseObj_byQrProd(string logref) : base(logref)
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

            string result_msg = string.Empty;

            if (InboundGate_W08(req,ref result_msg)) ;
            else if (Inbound_W07(req)) ;
            else if (Inbound_W06(req)) ;
            else if (Inbound_W04(req)) ;
            else if (Inbound_W03(req)) ;
            else if (Inbound_W02(req)) ;
            else { throw new AMWException(this.Logger, AMWExceptionCode.V0_INBOUND_CONDITION_FAIL); }

            return new TRes() { GateCode = req.GateCode, QR = req.QR, ResultMessage= result_msg };
        }

        private bool InboundGate_W08(TReq req,ref string result_msg)
        {
            if (!req.GateCode.In("RC8-2", "PS8-4", "PS8-5")) return false;


            var mcObj = ADO.WCSDB.McObjectADO.GetInstant().GetByMstCode(req.GateCode,this.BuVO);
            var bo = new Comm_CreateBaseObjTemp_byQrProd(this.LogRefID, this.BuVO).Execute(new Comm_CreateBaseObjTemp_byQrProd.TReq()
            {
                McObject_ID = mcObj.ID.Value,
                LabelData = req.QR.Json()
            });
            if (bo._result.status == 1)
            {
                if (bo.datas.Status == EntityStatus.ACTIVE)
                    result_msg = "Inserted.";
                else if (bo.datas.Status == EntityStatus.REMOVE)
                    result_msg = "Removed.";
            }
            else
            {
                throw new Exception(bo._result.message);
            }

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
