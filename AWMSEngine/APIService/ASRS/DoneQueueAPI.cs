using AWMSEngine.Engine.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using AMWUtil.Common;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AWMSEngine.Engine.Business.Issued;
using AWMSModel.Constant.StringConst;

namespace AWMSEngine.APIService.ASRS
{
    public class DoneQueueAPI : BaseAPIService
    {
        public DoneQueueAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            this.BeginTransaction();
            DoneQueue.TReq req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQueue.TReq>(this.RequestVO);
            WorkQueueCriteria res = new DoneQueue().Execute(this.Logger, this.BuVO, req);
            new Engine.General.MoveStoInGateToNextArea().Execute(this.Logger, this.BuVO, new Engine.General.MoveStoInGateToNextArea.TReq()
            {
                baseStoID = res.baseInfo.id
            });

            var queueID = req.queueID.Value;
            var getQueue = ADO.DataADO.GetInstant().SelectByID<amt_WorkQueue>(queueID, this.BuVO);
            if(getQueue.IOType == IOType.OUTPUT)
            {
                var docItemID = new List<amt_DocumentItem>();
                var setSTO = ADO.StorageObjectADO.GetInstant().Get(getQueue.StorageObject_ID, StorageObjectType.BASE, false, true, this.BuVO);

                var stos = TreeUtil.ToTreeList(setSTO).OrderByDescending(x => x.objectSizeID).ToList();
                List<amt_DocumentItemStorageObject> disto = new List<amt_DocumentItemStorageObject>();

                var docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(stos.Where(x=>x.type== StorageObjectType.PACK).Select(x=>x.id.Value).ToList(), DocumentTypeID.GOODS_ISSUED, this.BuVO);
                docItems.ForEach(x => {
                    var i = ADO.DocumentADO.GetInstant().GetItemAndStoInDocItem(x.ID.Value, this.BuVO);
                    x.DocItemStos = i.DocItemStos.Where(dsto => dsto.Status == EntityStatus.INACTIVE).ToList();
                });

                foreach (var sto in stos)
                {
                    if (sto.type == StorageObjectType.PACK)
                    {
                        var getdisto = new List<amt_DocumentItemStorageObject>();

                        foreach (var docItem in docItems)
                        {
                            getdisto = docItem.DocItemStos.Where(x => x.StorageObject_ID == sto.id).ToList();
                            docItemID.Add(docItems.Where(x => x.ID == docItem.Document_ID).FirstOrDefault());
                        }

                        var gdisto = getdisto.GroupBy(x => new { x.StorageObject_ID, x.DocumentItem_ID }).Select(x => new
                        {
                            x.First().ID,
                            x.Key.StorageObject_ID,
                            x.First().UnitType_ID,
                            x.First().BaseUnitType_ID,
                            x.First().DocumentItem_ID,
                            Quantity = x.Sum(y => y.Quantity.Value),
                            BaseQuantity = x.Sum(y => y.BaseQuantity.Value)
                        }).ToList();

                        gdisto.ForEach(x =>
                        {
                            ADO.DataADO.GetInstant().UpdateByID<amt_DocumentItemStorageObject>(x.ID.Value, this.BuVO, new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE));

                            sto.qty = sto.qty - x.Quantity;
                            sto.baseQty = sto.baseQty - x.BaseQuantity;
                            if (sto.qty == 0)
                            {
                                sto.eventStatus = StorageObjectEventStatus.PICKED;
                            }
                            ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
                        });
                    }
                    else if (sto.type == StorageObjectType.BASE)
                    {
                        var pickedInPallet = stos.Where(x => x.objectSizeID == 2).All(x => x.eventStatus == StorageObjectEventStatus.PICKED);
                        if (pickedInPallet)
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.PICKED, this.BuVO);
                        }
                    }
                }
                
                foreach(var docItem in docItems)
                {
                    var docID = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(id, this.BuVO).Document_ID;

                    object closeDoc = null;
                    var docTarget = ADO.DocumentADO.GetInstant().Target(docID, DocumentTypeID.GOODS_ISSUED, this.BuVO);
                    var target = docTarget.Any(z => z.needPackQty <= 0);
                    if (target)
                    {
                        ADO.DocumentADO.GetInstant().UpdateStatusToChild(docID, null, EntityStatus.ACTIVE, DocumentEventStatus.WORKED, this.BuVO);
                        closeDoc = new { docIDs = new long[] { docID }, auto = 0, _token = this.BuVO.Get<string>(BusinessVOConst.KEY_TOKEN) };
                    }

                    if (closeDoc != null)
                    {
                        this.BeginTransaction();
                        var reqLocal = ObjectUtil.DynamicToModel<ClosingGIDocument.TDocReq>(closeDoc);
                        var resLocal = new ClosingGIDocument().Execute(this.Logger, this.BuVO, reqLocal);
                        this.CommitTransaction();

                        this.BeginTransaction();
                        var reqSAP = ObjectUtil.DynamicToModel<ClosedGIDocument.TDocReq>(closeDoc);
                        var resSAP = new ClosedGIDocument().Execute(this.Logger, this.BuVO, reqSAP);
                    }
                }
            }
            return res;
        }
    }
}
