using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace AWMSEngine.Engine.V2.Business.Received
{
    public class RejectGRDocument : BaseEngine<RejectGRDocument.TDocReq, RejectGRDocument.TDocRes>
    {

        public class TDocReq
        {
            public long[] docIDs;
            public long desArea;
        }
        public class TDocRes
        {
            public List<amt_Document> documents;
        }

        protected override TDocRes ExecuteEngine(TDocReq reqVO)
        {
            foreach(var docID in reqVO.docIDs)
            {
                //AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID,
                //DocumentEventStatus.CLOSING, null, DocumentEventStatus.REJECTED, this.BuVO);

                var DocClose =AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(docID,this.BuVO);

                var distos = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(docID, this.BuVO);

                //var DocItemClose = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>("Document_ID", DocClose.ID, this.BuVO);
               
                    foreach (var docItem in distos)
                    {
                        amt_Document doc = new amt_Document();

                        doc = new CreateGIDocument().Execute(this.Logger, this.BuVO,
                                       new CreateGIDocument.TReq()
                                       {
                                           refID = DocClose.RefID,
                                           ref1 = DocClose.Ref1,
                                           ref2 = DocClose.Ref2,
                                           souBranchID = null,
                                           souWarehouseID = DocClose.Sou_Warehouse_ID,
                                           souAreaMasterID = DocClose.Sou_AreaMaster_ID,
                                           desBranchID = DocClose.Des_Branch_ID,
                                           desWarehouseID = DocClose.Des_Warehouse_ID,
                                           desAreaMasterID = DocClose.Des_AreaMaster_ID,
                                           movementTypeID = MovementType.FG_TRANSFER_REJECT,
                                           lot = DocClose.Lot,
                                           batch = DocClose.Batch,
                                           forCustomerID = DocClose.For_Customer_ID,
                                           documentDate = DateTime.Now,
                                           actionTime = DateTime.Now,
                                           eventStatus = DocumentEventStatus.NEW,
                                           issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                                                                new CreateGIDocument.TReq.IssueItem
                                                                {
                                                                    //palletcode = null,
                                                                    skuCode = docItem.Code,
                                                                    packCode = docItem.Code,
                                                                    quantity = docItem.Quantity,
                                                                    unitType = StaticValue.UnitTypes.First(x => x.ID == docItem.UnitType_ID).Code,
                                                                    lot = docItem.Lot,
                                                                    orderNo = docItem.OrderNo,
                                                                    batch = docItem.Batch,
                                                                    options =  AMWUtil.Common.ObjectUtil.QryStrSetValue(doc.Options, "palletcode", string.Join(", ",docItem.DocItemStos[0].Sou_StorageObject_ID)),ref1 = docItem.Ref1,
                                                                    ref2 = docItem.Ref2,
                                                                    refID = docItem.RefID,
                                                                    eventStatus = DocumentEventStatus.NEW,
                                                                    
                                                                    //docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(packH, null, null, null)}

                                                                }}
                                       });
                    }
                this.ProcessQ(reqVO);
            }
       


            return null;
        }
            private void ProcessQ(TDocReq reqVO)
            {



            //var process = new ASRSProcessQueue().Execute(


            //    );
            }
        }
}
