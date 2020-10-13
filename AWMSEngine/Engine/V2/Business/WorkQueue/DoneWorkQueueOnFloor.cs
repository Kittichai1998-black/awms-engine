using AMWUtil.Common;
using AMWUtil.Exception;

using ADO.WMSStaticValue;
using ADO.WMSDB;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class DoneWorkQueueOnFloor : BaseEngine<DoneWorkQueueOnFloor.TReq, DoneWorkQueueOnFloor.TReq>
    {
        public class TReq
        {
            public long? docID;
            public List<PackList> packList;
            public class PackList
            {
                public long rootID;
                public long packID;
                public long distoID;
                public long docItemID;
            }
        }

        protected override TReq ExecuteEngine(TReq reqVO)
        {
            var doc = ADO.WMSDB.DocumentADO.GetInstant().Get(reqVO.docID.Value, this.BuVO);


            doc.DocumentItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID.Value, this.BuVO);

            
            var groupSTO = reqVO.packList
                .GroupBy(x => x.rootID).Select(grp => new { rootID = grp.Key, packList = grp.ToList() }).ToList();
            groupSTO.ForEach(pack => {
                var stos = ADO.WMSDB.StorageObjectADO.GetInstant().Get(pack.rootID, StorageObjectType.BASE, false, true, this.BuVO);
                var stoPackList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

                stoPackList.ForEach(stopack =>
                {
                    var pickPack = pack.packList.Find(y => y.packID == stopack.id.Value);
                    if (pickPack != null)
                    {
                        var docitem = doc.DocumentItems.Find(y => y.ID == pickPack.docItemID);  //5
                        var disto = docitem.DocItemStos.Find(z => z.ID == pickPack.distoID);

                        var updSto = new StorageObjectCriteria();
                        updSto = stopack;
                        updSto.baseQty -= disto.BaseQuantity.Value;
                        var qtyConvert = StaticValue.ConvertToBaseUnitBySKU(stopack.skuID.Value, updSto.baseQty, updSto.unitID);
                        updSto.qty = qtyConvert.newQty;

                        //update new sto pick
                        var issuedSto = new StorageObjectCriteria();
                        issuedSto = stopack.Clone();
                        issuedSto.id = null;
                        issuedSto.baseQty = disto.BaseQuantity.Value;
                        var qtyConvert_issued = StaticValue.ConvertToBaseUnitBySKU(issuedSto.skuID.Value, issuedSto.baseQty, issuedSto.unitID);
                        issuedSto.qty = qtyConvert_issued.newQty;
                        issuedSto.parentID = null;
                        issuedSto.mapstos = null;
                        issuedSto.eventStatus = StorageObjectEventStatus.PICKED;
                        var stoIDIssued = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                        ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);


                        if (updSto.baseQty == 0)
                        {
                            updSto.eventStatus = StorageObjectEventStatus.REMOVED;

                            ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

                        }
                        else
                        {

                            var distoAll = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                                {
                                                        new SQLConditionCriteria("Sou_StorageObject_ID", stopack.id.Value, SQLOperatorType.EQUALS),
                                                        new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                }, this.BuVO);
                            if (distoAll.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                            {
                                var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                                if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                                {
                                    updSto.eventStatus = StorageObjectEventStatus.RECEIVED;
                                }
                                else
                                {
                                    StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(upd_done_sou_event_status);
                                    updSto.eventStatus = eventStatus;
                                    RemoveOPTEventSTO(updSto.id.Value, updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS, this.BuVO);
                                }
                            }
                            var stoIDUpdated = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

                        }

                        updatePallet(stopack.parentID.Value, StorageObjectType.BASE);

                        if (disto.WorkQueue_ID != null)
                        {
                            UpdateWorkQueueWork(disto.WorkQueue_ID);
                        }
                    }
                    else
                    {
                        updatePallet(stopack.parentID.Value, StorageObjectType.BASE);
                    }

                });
            });


            void updatePallet(long parent_id, StorageObjectType parent_type)
            {
                // ถ้าไม่มี status pack 1 => ถ้ามันมี 3 พาเลทจบงาน ไม่มีลบพาเลท

                if (parent_type != StorageObjectType.LOCATION)
                {
                    var sto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
                    var stoLists = new List<StorageObjectCriteria>();
                    if (sto != null)
                        stoLists = sto.ToTreeList();

                    var all_pack = stoLists.FindAll(x => x.parentID == parent_id && x.parentType == parent_type);
                    if (stoLists.Count() > 0 && all_pack.TrueForAll(x => {
                        var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(x.eventStatus);
                        return status != EntityStatus.ACTIVE;
                    })) //ต้องไม่ใช่1ทั้งหมด
                    {
                        var parentUpdate = stoLists.Find(x => x.id == parent_id);

                        if (all_pack.TrueForAll(x => {
                            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(x.eventStatus);
                            return status == EntityStatus.DONE;
                        }))
                        {
                            ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.REMOVE, this.BuVO);
                            if (parentUpdate.parentID.HasValue)
                                updatePallet(parentUpdate.parentID.Value, parentUpdate.parentType.Value);
                        }
                       
                    }

                }
            }

            return reqVO;
        }

        private void UpdateWorkQueueWork(long? workQueue_ID)
        {
            var queueTrx = ADO.WMSDB.WorkQueueADO.GetInstant().Get(workQueue_ID.Value, this.BuVO);
            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKING
                || queueTrx.EventStatus == WorkQueueEventStatus.WORKED)
            {

                queueTrx.ActualTime = DateTime.Now;
                queueTrx.EndTime = DateTime.Now;
                queueTrx.EventStatus = WorkQueueEventStatus.WORKED;
                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);

                queueTrx.ActualTime = DateTime.Now;
                queueTrx.EndTime = DateTime.Now;
                queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;
                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);

            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
            }
        }

        private void RemoveOPTEventSTO(long bsto_id, string bsto_options, string opt, VOCriteria buVO)
        {
            //remove OPT_DONE_DES_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto_options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(opt));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }

            ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }

    }
}