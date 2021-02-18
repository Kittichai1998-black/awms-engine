using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine.V2.Business.Received;
using ADO.WMSStaticValue;
using AMWUtil.Common;

namespace AWMSEngine.Engine.V2.Business.Document
{
    public class CreateGoodsReceive : BaseEngine<CreateGoodsReceive.TReq, CreateGoodsReceive.TRes>
    {
       
        public class TReq : AMWRequestCreateGR
        {
        }
        public class TRes
        {
            public string document;
        }
         
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            
            amt_Document document = new amt_Document();
            this.Checknull(this.Logger, reqVO, this.BuVO);

            document = this.CreateDocGR(this.Logger, reqVO, this.BuVO);

            this.CreateDocPA(this.Logger, reqVO, document, this.BuVO);
            res.document = document.Code;
            

            return res;
        }


        private amt_Document CreateDocGR(AMWLogger logger, TReq reqVO, VOCriteria buVO)
        {
            amt_Document docResultGR = new amt_Document();

            List<CreateGRDocument.TReq.ReceiveItem> docItemsList = new List<CreateGRDocument.TReq.ReceiveItem>();

            var docGR = new CreateGRDocument.TReq()
            {
                documentTypeID = DocumentTypeID.GOODS_RECEIVE,

                forCustomerCode = reqVO.fromCustomer,
                souSupplierCode = reqVO.fromSupplier,
                souWarehouseID = String.IsNullOrWhiteSpace(reqVO.fromWarehouse) ? null : StaticValueManager.GetInstant().Warehouses.First(x => x.Code == reqVO.fromWarehouse).ID,
                desWarehouseID = String.IsNullOrWhiteSpace(reqVO.toWarehouse) ? null : StaticValueManager.GetInstant().Warehouses.First(x => x.Code == reqVO.toWarehouse).ID,

                remark = reqVO.remark,

                documentProcessTypeID = reqVO.process.Value,
                ref1 = reqVO.ref1,
                ref2 = reqVO.ref2,
                ref3 = reqVO.ref3,
                ref4 = reqVO.ref4,
                documentDate = DateTime.Now,
                actionTime = reqVO.actionTime.HasValue ? reqVO.actionTime : DateTime.Now,
                eventStatus = DocumentEventStatus.NEW,
            };

            reqVO.item.ForEach(item => {
                if (String.IsNullOrWhiteSpace(item.auditStatus))
                {
                    //var auditstatus = StaticValueManager.GetInstant().GetConfigValue(ConfigFlow.AUDIT_STATUS_DEFAULT, reqVO.process.Value);
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "AuditStatus เป็นค่าว่าง");
                }

                var _auditstatus = EnumUtil.GetValueEnum<AuditStatus>(item.auditStatus);

                docItemsList.Add(new CreateGRDocument.TReq.ReceiveItem
                {
                    skuCode = item.sku,
                    packCode = item.sku,
                    quantity = item.quantity,
                    unitType = item.unitType,
                    baseCode = item.baseNo,
                    itemNo = item.itemNo,
                    batch = item.batch,
                    lot = item.lot,
                    orderNo = item.orderNo,
                    cartonNo = item.cartonNo,
                    ref1 = item.ref1,
                    ref2 = item.ref2,
                    ref3 = item.ref3,
                    ref4 = item.ref4,
                    auditStatus = _auditstatus,
                    eventStatus = DocumentEventStatus.NEW,
                });

            });
            docGR.receiveItems = docItemsList;

            docResultGR = new CreateGRDocument().Execute(Logger, this.BuVO, docGR);

            return docResultGR;
        }


        private amt_Document CreateDocPA(AMWLogger logger, TReq reqVO, amt_Document document, VOCriteria buVO)
        {
            if (reqVO.autoPutaway == 1)
            {
                //document.DocumentItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(document.ID.Value, buVO);
                //create putaway
                amt_Document docResultPA = new amt_Document();
                List<CreateGRDocument.TReq.ReceiveItem> docItemsPAList = new List<CreateGRDocument.TReq.ReceiveItem>();

                var docPA = new CreateGRDocument.TReq()
                {
                    documentTypeID = DocumentTypeID.PUTAWAY,
                    parentDocumentID = document.ID.Value,

                    forCustomerCode = reqVO.fromCustomer,
                    souSupplierCode = reqVO.fromSupplier,
                    souWarehouseID = String.IsNullOrWhiteSpace(reqVO.fromWarehouse) ? null : StaticValueManager.GetInstant().Warehouses.First(x => x.Code == reqVO.fromWarehouse).ID,
                    desWarehouseID = String.IsNullOrWhiteSpace(reqVO.toWarehouse) ? null : StaticValueManager.GetInstant().Warehouses.First(x => x.Code == reqVO.toWarehouse).ID,

                    remark = reqVO.remark,

                    documentProcessTypeID = reqVO.process.Value,
                    ref1 = reqVO.ref1,
                    ref2 = reqVO.ref2,
                    ref3 = reqVO.ref3,
                    ref4 = reqVO.ref4,
                    documentDate = DateTime.Now,
                    actionTime = reqVO.actionTime.HasValue ? reqVO.actionTime : DateTime.Now,
                    eventStatus = DocumentEventStatus.NEW,
                };
                document.DocumentItems.ForEach(item => {
                    docItemsPAList.Add(new CreateGRDocument.TReq.ReceiveItem
                    {
                        parentDocumentItem_ID = item.ID,
                        packCode = item.Code,
                        skuCode = item.Code,
                        quantity = item.Quantity,
                        unitType = this.StaticValue.UnitTypes.First(x => x.ID == item.UnitType_ID).Code,
                        baseCode = item.BaseCode,
                        itemNo = item.ItemNo,
                        batch = item.Batch,
                        lot = item.Lot,
                        orderNo = item.OrderNo,
                        cartonNo = item.CartonNo,
                        ref1 = item.Ref1,
                        ref2 = item.Ref2,
                        ref3 = item.Ref3,
                        ref4 = item.Ref4,
                        auditStatus = item.AuditStatus.Value,
                        eventStatus = DocumentEventStatus.NEW,
                    });
                });
                

                docPA.receiveItems = docItemsPAList;
                docResultPA = new CreateGRDocument().Execute(Logger, this.BuVO, docPA);
                return docResultPA;
            }
            else
            {
                return null;
            }
        }
        private void Checknull(AMWLogger logger, TReq reqVO, VOCriteria buVO)
        {
            if (reqVO.process is not DocumentProcessTypeID)
                throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "Process Type เป็นค่าว่าง");
            if (!String.IsNullOrWhiteSpace(reqVO.fromCustomer))
            {
                var customer = StaticValueManager.GetInstant().Customers.First(x => x.Code == reqVO.fromCustomer);
                if (customer == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี Customer นี้ในระบบ");

            }

            if (!String.IsNullOrWhiteSpace(reqVO.fromSupplier))
            {
                var supplier = StaticValueManager.GetInstant().Suppliers.First(x => x.Code == reqVO.fromSupplier);
                if (supplier == null)
                    throw new AMWException(this.BuVO.Logger, AMWExceptionCode.S0001, "ไม่มี Supplier นี้ในระบบ");

            }
        }
    }
}
