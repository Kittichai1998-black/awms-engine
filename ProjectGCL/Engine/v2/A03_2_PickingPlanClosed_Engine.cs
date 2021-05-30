using ADO.WMSDB;
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

            var docis = DocumentADO.GetInstant().ListItemAndDisto(doc.ID.Value, BuVO);
            //จบงาน REJECTED ที่ยังไม่ได้รับเข้า
            docis.ForEach(doci =>
            {

                //ยกเลิกพาเลทเบิก คือสถานะพาเลท
                doci.DocItemStos.ForEach(disto =>
                {
                    if(disto.Status == EntityStatus.INACTIVE)
                    {
                        //REMOVE DISTO
                        disto.Status = EntityStatus.REMOVE;
                        DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(
                            ListKeyValue<string, object>.New("ID", disto.ID),
                            ListKeyValue<string, object>.New("Status", EntityStatus.REMOVE),
                            this.BuVO);

                        //ROLLBACK STO RECEIVED
                        DataADO.GetInstant().UpdateBy<amt_StorageObject>(
                            ListKeyValue<string, object>.New("ID", disto.Des_StorageObject_ID),
                            ListKeyValue<string, object>.New("EventStatus", StorageObjectEventStatus.PACK_RECEIVED),
                            this.BuVO);
                    }
                });

                //ปิด Document Item เมื่อคือนสถานะพาเลทแล้วทั้งหมด
                if(doci.DocItemStos
                    .TrueForAll(disto=>disto.Status == EntityStatus.REMOVE || disto.Status == EntityStatus.DONE))
                {
                    doci.Status = EntityStatus.DONE;
                    doci.EventStatus = DocumentEventStatus.CLOSED;
                    ADO.WMSDB.DataADO.GetInstant().UpdateBy<amt_DocumentItem>(
                        ListKeyValue<string, object>.New("ID", doci.ID),
                        ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.CLOSED).Add("Status", EntityStatus.DONE),
                        this.BuVO);
                }
            });
            
            //ปิดเอกสารเมื่อ doc item ปิดแล้วทั้งหมด
            if(docis.TrueForAll(doci=>doci.Status == EntityStatus.REMOVE || doci.Status == EntityStatus.DONE))
            {
                ADO.WMSDB.DataADO.GetInstant().UpdateBy<amt_Document>(
                    ListKeyValue<string, object>.New("ID", doc.ID),
                    ListKeyValue<string, object>.New("EventStatus", DocumentEventStatus.CLOSED).Add("Status", EntityStatus.DONE),
                    this.BuVO);
            }

            //ส่งปิดคิวงานให้ WCS
            ADO.WMSDB.WcsADO.GetInstant().SP_Receive_Close(IOType.OUTBOUND, doc.Code, this.BuVO);

            return new TRES__return { };

        }
    }
}