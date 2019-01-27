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
                var docItemID = new List<long>();
                var setSTO = ADO.StorageObjectADO.GetInstant().Get(getQueue.StorageObject_ID, StorageObjectType.BASE, false, true, this.BuVO);

                var stos = TreeUtil.ToTreeList(setSTO).OrderByDescending(x => x.objectSizeID).ToList();
                List<amt_DocumentItemStorageObject> disto = new List<amt_DocumentItemStorageObject>();
                foreach (var sto in stos)
                {
                    if (sto.objectSizeID == 2)
                    {
                        var getdisto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]{
                            new SQLConditionCriteria("StorageObject_ID", sto.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                        }, this.BuVO);

                        docItemID.AddRange(getdisto.Select(x => x.DocumentItem_ID).ToList());

                        var gdisto = getdisto.Where(x => x.StorageObject_ID == sto.id).GroupBy(x => new { x.StorageObject_ID }).Select(x => new
                        {
                            x.Key.StorageObject_ID,
                            x.First().UnitType_ID,
                            x.First().BaseUnitType_ID,
                            x.First().DocumentItem_ID,
                            Quantity = x.Sum(y => y.Quantity.Value),
                            BaseQuantity = x.Sum(y => y.BaseQuantity.Value)
                        }).FirstOrDefault();

                        if (gdisto != null)
                        {
                            ADO.DataADO.GetInstant().UpdateBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                            {
                            new SQLConditionCriteria("StorageObject_ID", sto.id, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                            }, new KeyValuePair<string, object>[]{
                            new KeyValuePair<string, object>("Status", EntityStatus.ACTIVE)
                            }, this.BuVO);

                            sto.qty = sto.qty - gdisto.Quantity;
                            sto.baseQty = sto.baseQty - gdisto.BaseQuantity;
                            if (sto.qty == 0)
                            {
                                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.PICKED, this.BuVO);
                            }
                            ADO.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
                        }
                    }
                    else
                    {
                        var pickedInPallet = stos.Where(x => x.objectSizeID == 2).Any(x => x.eventStatus != StorageObjectEventStatus.PICKED);
                        if (pickedInPallet)
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.PICKED, this.BuVO);
                        }
                    }
                }
                
                foreach(var id in docItemID.Distinct())
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
