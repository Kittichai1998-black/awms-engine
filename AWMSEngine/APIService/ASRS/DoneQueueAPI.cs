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
            var req = AMWUtil.Common.ObjectUtil.DynamicToModel<DoneQueue.TReq>(this.RequestVO);
            WorkQueueCriteria res = new DoneQueue().Execute(this.Logger, this.BuVO, req);
            new Engine.General.MoveStoInGateToNextArea().Execute(this.Logger, this.BuVO, new Engine.General.MoveStoInGateToNextArea.TReq()
            {
                baseStoID = res.baseInfo.id
            });

            var queueID = (long?)req.queueID.Value;
            var getQueue = ADO.DataADO.GetInstant().SelectByID<amt_WorkQueue>(queueID, this.BuVO);
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
                    var pickedInPallet = stos.Where(x => x.objectSizeID == 2).Any(x=> x.eventStatus != StorageObjectEventStatus.PICKED);
                    if (pickedInPallet)
                    {
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(sto.id.Value, null, null, StorageObjectEventStatus.PICKED, this.BuVO);
                    }
                }
            }



            return res;
        }
    }
}
