using AMSModel.Constant.EnumConst;
using AMSModel.Entity;
using AMWUtil.Common;
using AWMSEngine.Engine;
using ProjectGCL.GCLModel.Criterie;
using System;
using System.Linq;

namespace ProjectGCL.Engine.v2
{
    public class A03_2_PickingPlanClosed_Engine : BaseEngine<A03_2_PickingPlanClosed_Engine.TReq, TRES__return>
    {

        public class TReq
        {
            public string wms_doc;
        }
        protected override TRES__return ExecuteEngine(TReq reqVO)
        {
            amt_Document doc = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_Document>(
                ListKeyValue<string, object>.New("ref2", reqVO.wms_doc).Add("status", EntityStatus.ACTIVE),
                this.BuVO).FirstOrDefault();
            if (doc == null)
                throw new Exception($"ไม่พบเลขที่เอกสาร '{reqVO.wms_doc}' ในระบบ");

            //จบงาน REJECTED ที่ยังไม่ได้รับเข้า
            ADO.WMSDB.DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                ListKeyValue<string, object>.New("Document_ID", doc.ID).Add("EventStatus", DocumentEventStatus.NEW),
                ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.WORKED),
                this.BuVO);
            ADO.WMSDB.WcsADO.GetInstant().SP_Receive_Close(IOType.INBOUND, doc.Code, this.BuVO);

            return new TRES__return { };

        }
    }
}