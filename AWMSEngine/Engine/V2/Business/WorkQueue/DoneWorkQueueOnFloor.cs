using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
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
    public class DoneWorkQueueOnFloor : BaseQueue<DoneWorkQueueOnFloor.TReq, DoneWorkQueueOnFloor.TReq>
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
            var doc = ADO.DocumentADO.GetInstant().Get(reqVO.docID.Value, this.BuVO);
           

            doc.DocumentItems = ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID.Value, this.BuVO);


            var groupSTO = reqVO.packList
                .GroupBy(x => x.rootID).Select(grp => new { rootID = grp.Key, packList = grp.ToList()}).ToList();
            groupSTO.ForEach(pack => {
                var stos = ADO.StorageObjectADO.GetInstant().Get(pack.rootID, StorageObjectType.BASE , false, true, this.BuVO);
                var stoPackList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

                stoPackList.ForEach(stopack =>
                {
                    var pickPack = pack.packList.Find(y => y.packID == stopack.id.Value);
                    if(pickPack != null)
                    {
                        var docitem = doc.DocumentItems.Find(y => y.ID == pickPack.docItemID);  //5
                        var disto = docitem.DocItemStos.Find(z => z.ID == pickPack.distoID);
                        var sumDiSTO = docitem.DocItemStos.Sum(y => y.BaseQuantity);

                        //var stopack = ADO.StorageObjectADO.GetInstant().Get(pickPack.packID, StorageObjectType.PACK, false, false, this.BuVO);
                        var remainBaseQty = docitem.BaseQuantity - sumDiSTO;

                        if (remainBaseQty > 0)
                        { //pickได้
                            if (remainBaseQty >= stopack.baseQty)
                            { //เบิกหมด
                                ADO.StorageObjectADO.GetInstant().UpdateStatus(pickPack.packID, null, null, StorageObjectEventStatus.PICKED, this.BuVO);

                                ADO.DistoADO.GetInstant().Update(pickPack.distoID, pickPack.packID, stopack.qty, stopack.baseQty, EntityStatus.ACTIVE, this.BuVO);
                            }
                            else
                            {
                                var updSto = new StorageObjectCriteria();
                                updSto = stopack;
                                updSto.baseQty -= remainBaseQty.Value;
                                var qtyConvert = StaticValue.ConvertToBaseUnitBySKU(stopack.skuID.Value, updSto.baseQty, updSto.unitID);
                                updSto.qty = qtyConvert.newQty;
                                if (updSto.baseQty == 0)
                                {
                                    ADO.StorageObjectADO.GetInstant().UpdateStatus(pickPack.packID, null, null, StorageObjectEventStatus.PICKED, this.BuVO);

                                    ADO.DistoADO.GetInstant().Update(disto.ID.Value, pickPack.packID, stopack.qty, stopack.baseQty, EntityStatus.ACTIVE, this.BuVO);
                                }
                                else
                                {
                                    var issuedSto = new StorageObjectCriteria();
                                    issuedSto = stopack.Clone();
                                    issuedSto.id = null;
                                    issuedSto.baseQty = remainBaseQty.Value;
                                    var qtyConvert_issued = StaticValue.ConvertToBaseUnitBySKU(issuedSto.skuID.Value, issuedSto.baseQty, issuedSto.unitID);
                                    issuedSto.qty = qtyConvert_issued.newQty;
                                    issuedSto.parentID = null;
                                    issuedSto.mapstos = null;
                                    issuedSto.eventStatus = StorageObjectEventStatus.PICKED;
                                    var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                                    ADO.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);

                                    var distoAll = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                                        {
                                                    //new SQLConditionCriteria("DocumentItem_ID", docitem.ID.Value, SQLOperatorType.EQUALS),
                                                    new SQLConditionCriteria("Sou_StorageObject_ID", stopack.id.Value, SQLOperatorType.EQUALS),
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
                                    var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);




                                }
                            }
                        }
                        else
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(pickPack.packID, null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

                            ADO.DistoADO.GetInstant().Update(pickPack.distoID, pickPack.packID, null, null, EntityStatus.REMOVE, this.BuVO);

                        }

                        updatePallet(stopack.parentID.Value, StorageObjectType.BASE);

                        if (disto.WorkQueue_ID != null)
                        {
                            UpdateWorkQueueWork(disto.WorkQueue_ID);
                        }
                    }
                    else
                    {
                        //stopack.eventStatus = StorageObjectEventStatus.RECEIVED;
                        var distoAll = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                                        {
                                                    new SQLConditionCriteria("Sou_StorageObject_ID", stopack.id.Value, SQLOperatorType.EQUALS),
                                                        }, this.BuVO);
                        if (distoAll.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
                        {
                            var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(stopack.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                            if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                            {
                                stopack.eventStatus = StorageObjectEventStatus.RECEIVED;
                            }
                            else
                            {
                                StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(upd_done_sou_event_status);
                                stopack.eventStatus = eventStatus;
                                RemoveOPTEventSTO(stopack.id.Value, stopack.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS, this.BuVO);
                            }
                        }

                        var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(stopack, this.BuVO);
                        updatePallet(stopack.parentID.Value, StorageObjectType.BASE);

                    }

                });
            });
            //reqVO.packList.ForEach(x =>
            //{
            //    var docitem = doc.DocumentItems.Find(y => y.ID == x.docItemID);  //5
            //    var disto = docitem.DocItemStos.Find(z => z.ID == x.distoID);   
            //    var sumDiSTO = docitem.DocItemStos.Sum(y => y.BaseQuantity);

            //    var stopack = ADO.StorageObjectADO.GetInstant().Get(x.packID, StorageObjectType.PACK, false, false, this.BuVO);
            //    var remainBaseQty = docitem.BaseQuantity - sumDiSTO;

            //    if (remainBaseQty > 0) 
            //    { //pickได้
            //        if(remainBaseQty >= stopack.baseQty)
            //        { //เบิกหมด
            //            ADO.StorageObjectADO.GetInstant().UpdateStatus(x.packID, null, null, StorageObjectEventStatus.PICKED, this.BuVO);

            //            ADO.DistoADO.GetInstant().Update(x.distoID, x.packID, stopack.qty, stopack.baseQty, EntityStatus.ACTIVE, this.BuVO);
            //        }
            //        else
            //        {
            //            var updSto = new StorageObjectCriteria();
            //            updSto = stopack;
            //            updSto.baseQty -= remainBaseQty.Value;  
            //            var qtyConvert = StaticValue.ConvertToBaseUnitBySKU(stopack.skuID.Value, updSto.baseQty, updSto.unitID);
            //            updSto.qty = qtyConvert.newQty;
            //            if (updSto.baseQty == 0)
            //            {
            //                ADO.StorageObjectADO.GetInstant().UpdateStatus(x.packID, null, null, StorageObjectEventStatus.PICKED, this.BuVO);

            //                ADO.DistoADO.GetInstant().Update(disto.ID.Value, x.packID, stopack.qty, stopack.baseQty, EntityStatus.ACTIVE, this.BuVO);
            //            }
            //            else 
            //            {
            //                var issuedSto = new StorageObjectCriteria();
            //                issuedSto = stopack.Clone();
            //                issuedSto.id = null;
            //                issuedSto.baseQty = remainBaseQty.Value; 
            //                var qtyConvert_issued = StaticValue.ConvertToBaseUnitBySKU(issuedSto.skuID.Value, issuedSto.baseQty, issuedSto.unitID);
            //                issuedSto.qty = qtyConvert_issued.newQty;
            //                issuedSto.parentID = null;
            //                issuedSto.mapstos = null;
            //                issuedSto.eventStatus = StorageObjectEventStatus.PICKED;
            //                var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
            //                ADO.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);

            //                var distoAll = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
            //                                    {
            //                                    //new SQLConditionCriteria("DocumentItem_ID", docitem.ID.Value, SQLOperatorType.EQUALS),
            //                                    new SQLConditionCriteria("Sou_StorageObject_ID", stopack.id.Value, SQLOperatorType.EQUALS),
            //                                    }, this.BuVO);
            //                if (distoAll.TrueForAll(x => x.Status == EntityStatus.ACTIVE))
            //                {
            //                    var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
            //                    if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
            //                    {
            //                        updSto.eventStatus = StorageObjectEventStatus.RECEIVED;
            //                    }
            //                    else
            //                    {
            //                        StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(upd_done_sou_event_status);
            //                        updSto.eventStatus = eventStatus;
            //                        RemoveOPTEventSTO(updSto.id.Value, updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS, this.BuVO);
            //                    }
            //                }
            //                var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

                        
                        
                        
            //            }
            //        }
            //    }
            //    else
            //    {
            //        ADO.StorageObjectADO.GetInstant().UpdateStatus(x.packID, null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);

            //        ADO.DistoADO.GetInstant().Update(x.distoID, x.packID, null, null, EntityStatus.REMOVE, this.BuVO);

            //    }

            //    updatePallet(stopack.parentID.Value, StorageObjectType.BASE);

            //    if (disto.WorkQueue_ID != null)
            //    {
            //        UpdateWorkQueueWork(disto.WorkQueue_ID);
            //    }
            //});
            
            void updatePallet(long parent_id, StorageObjectType parent_type)
            {
                // ถ้าไม่มี status pack 1 => ถ้ามันมี 3 พาเลทจบงาน ไม่มีลบพาเลท

                if (parent_type != StorageObjectType.LOCATION)
                {
                    var sto = ADO.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, true, BuVO);
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

                        if (all_pack.Any(x => {
                            var status = StaticValueManager.GetInstant().GetStatusInConfigByEventStatus<StorageObjectEventStatus>(x.eventStatus);
                            return status == EntityStatus.DONE;
                        }))
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.DONE, this.BuVO);
                        }
                        else
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(parentUpdate.id.Value, null, null, StorageObjectEventStatus.REMOVE, this.BuVO);
                        }
                    }
                  
                }
            }
 
            return reqVO;
        }

        private void UpdateWorkQueueWork(long? workQueue_ID)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(workQueue_ID.Value, this.BuVO);
            if(queueTrx.EventStatus == WorkQueueEventStatus.WORKING 
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

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
      
    }
}
