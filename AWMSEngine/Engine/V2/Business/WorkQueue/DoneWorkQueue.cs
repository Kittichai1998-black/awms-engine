using AMWUtil.Common;
using AMWUtil.Exception;

using ADO.WMSStaticValue;
using ADO.WMSDB;
using AWMSEngine.Engine.V2.Business.Wave;
using AWMSEngine.Engine.V2.General;
using AMSModel.Constant.EnumConst;
using AMSModel.Constant.StringConst;
using AMSModel.Criteria;
using AMSModel.Criteria.SP.Request;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class DoneWorkQueue : BaseQueue<DoneWorkQueue.TReq, WorkQueueCriteria>
    {

        public class TReq
        {
            public long? queueID;
            public string baseCode;
            public string warehouseCode;
            public string areaCode;
            public string locationCode;
            public DateTime actualTime;

        }
        public class TReqandWorkQueue
        {
            public TReq reqVO;
            public WorkQueueCriteria workQ;
            public amt_Document document;
        }
        private ams_AreaLocationMaster _location;
        private ams_Warehouse _warehouse;
        private ams_AreaMaster _area;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)

        {
            this.InitDataASRS(reqVO);

            var queueTrx = ADO.WMSDB.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            if (queueTrx.Des_Warehouse_ID != queueTrx.Warehouse_ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Present Location Not Equals Destination Location.");

            if(queueTrx.StorageObject_Code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Incorrect Pallet Code");

            this.UpdateStorageObjectLocation(reqVO, queueTrx);

            var workQ = this.UpdateDocumentItemStorageObject(reqVO, queueTrx);

            var docs = GetDocument(reqVO.queueID.Value);

            workQ.docIDs = docs;
            return workQ;
        }

        private void InitDataASRS(TReq reqVO)
        {
            this._warehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (_warehouse == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            this._area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (_area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");
            this._location = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",_area.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();
            if (_location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Area Location Not Found");
        }

        private StorageObjectCriteria UpdateStorageObjectLocation(TReq reqVO, SPworkQueue queueTrx)
        {
            var mapsto = ADO.WMSDB.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Pallet Not Found");

            ADO.WMSDB.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, _location.ID.Value, this.BuVO);

            return mapsto;
        }

        private WorkQueueCriteria UpdateDocumentItemStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            WorkQueueCriteria workQueueRes = new WorkQueueCriteria();
            var stos = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.baseCode, _warehouse.ID.Value, null, false, true, this.BuVO);
            var docItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).ToList();

            var docs = ADO.WMSDB.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO).FirstOrDefault();

            if (queueTrx.Des_Warehouse_ID == _warehouse.ID.Value)
            {

                if (queueTrx.IOType == IOType.INBOUND)
                {
                    ManageDocumentInput(reqVO, docs, queueTrx, docItems, stos);
                }
                else if (queueTrx.IOType == IOType.OUTBOUND)
                {
                    if(docs.DocumentType_ID == DocumentTypeID.PICKING)
                    {
                        //Wave
                        var distoByQueue = ADO.WMSDB.DocumentADO.GetInstant().ListDistoByWorkQueue(queueTrx.ID.Value, this.BuVO);
                        var doneDistoWaveSeq = new DoneDistoWaveSeq();
                        var doneDistoWave = new List<DoneDistoWaveSeq.TReq.DistoList>();

                        if (distoByQueue.FirstOrDefault().Sou_WaveSeq_ID != null)
                        {
                            distoByQueue.ForEach(di =>
                            {
                                doneDistoWave.Add(new DoneDistoWaveSeq.TReq.DistoList
                                {
                                    distoID = di.ID.Value,
                                });
                            });
                            doneDistoWaveSeq.Execute(this.Logger, this.BuVO, new DoneDistoWaveSeq.TReq() { distos = doneDistoWave });
                        }
                        else
                        {
                            if (docItems.Count > 0)
                            {
                                ManageDocumentOutput(reqVO, docs, queueTrx, docItems, stos);
                            }
                        }

                    }
                }
                workQueueRes = ManageWQ(reqVO, queueTrx, docItems, stos);

                return workQueueRes;
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Warehouse Invalid");
            }

        }

        private List<long> GetDocument(long queueID)
        {
            List<long> docsCode = new List<long>();

            var docItems = ADO.WMSDB.DocumentADO.GetInstant().ListItemByWorkQueueDisto(queueID, this.BuVO);

            if (docItems.Count > 0)
            {
                docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();
            }

            return docsCode;
        }
         
        private void ManageDocumentInput(TReq reqVO, amt_Document docs, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

            if (docItems.Count > 0)
            {
                if (docs.DocumentType_ID != DocumentTypeID.PHYSICAL_COUNT && docs.DocumentType_ID != DocumentTypeID.AUDIT)
                {
                    docItems.ForEach(docItem =>
                    {
                        stoList.ForEach(sto =>
                        {
                            updateSTO(sto);
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);

                            distos.ForEach(disto =>
                            {
                                ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, sto.id.Value, null, null, EntityStatus.ACTIVE, this.BuVO);
                                if(disto.Des_WaveSeq_ID == null)
                                {
                                    ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                                }
                            });

                        });
                    });
                }
            }
            else
            {
                //Audit เคสที่ ไม่มีการผูกเอกสาร
                var getDisto = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                { 
                    new SQLConditionCriteria("WorkQueue_ID", queueTrx.ID.Value, SQLOperatorType.EQUALS),
                }, this.BuVO);

                if (getDisto.Count > 0)
                {
                    getDisto.ForEach(disto =>
                    {
                        var sou_sto = stoList.Find(sel => sel.id == disto.Sou_StorageObject_ID);
                        updateSTO(sou_sto);

                        ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                        if (disto.Des_WaveSeq_ID == null)
                        {
                            ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                        }
                    });
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Document Item Storage Object Not Found");
                }
            }
            void updateSTO(StorageObjectCriteria sto)
            {
                if (sto.eventStatus == StorageObjectEventStatus.PACK_RECEIVING)
                {
                    var done_des_event_status = ObjectUtil.QryStrGetValue(sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                    if (done_des_event_status == null || done_des_event_status.Length == 0)
                    {
                        sto.eventStatus = StorageObjectEventStatus.PACK_RECEIVED;
                    }
                    else
                    {
                        StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                        sto.eventStatus = eventStatus;
                        RemoveOPTEventSTO(sto.id.Value, sto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, this.BuVO);

                    }
                    //if(sto.skuTypeID == SKUGroupType.ESP.GetValueInt())
                    //{
                    //    sto.IsStock = true;
                    //    ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_StorageObject>(sto.parentID.Value, this.BuVO,
                    //       new KeyValuePair<string, object>[] {
                    //            new KeyValuePair<string, object>("IsStock", EntityStatus.ACTIVE)
                    //       });
                    //}
                    ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(sto, this.BuVO);
                }
            }
        }
        private void ManageDocumentOutput(TReq reqVO, amt_Document docs, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            var listDisto = new List<amt_DocumentItemStorageObject>();
            docItems.ForEach(x => { listDisto.AddRange(x.DocItemStos); });
            var sumDisto = listDisto.GroupBy(x => x.Sou_StorageObject_ID).Select(x => new { stoID = x.Key, sumBaseQty = x.Sum(y => y.BaseQuantity), sumQty = x.Sum(y => y.Quantity) }).ToList();

            docItems.ForEach(docItem =>
            {
                if (docItem.BaseQuantity == null)
                {
                    stoList.ForEach(sto =>
                    {
                        var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);
                        distos.ToList().ForEach(disto =>
                        {
                            ManageSTO(sto, disto);
                        });
                        updatePallet(sto.parentID.Value, sto.parentType.Value);
                    });
                }
                else
                {
                    var baseqtyPick = docItem.BaseQuantity;
                    decimal? sumDiSTOBaseQty = sumDisto.Sum(x => x.sumBaseQty);
                    stoList.ForEach(sto =>
                    {
                        var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id).ToList();
                        if (distos.Count() > 0)
                        {
                            distos.ForEach(disto =>
                            {
                                if (disto.BaseQuantity == null)
                                {   //กรณีไม่ระบุจำนวนเบิกสินค้า
                                    var remainBaseQty = baseqtyPick - sumDiSTOBaseQty;
                                    //จำนวนที่ต้องการเบิก - ผลรวมของจำนวนที่ถูกเบิกเเล้วในdisto = จำนวนที่ยังต้องเบิกเพิ่ม  
                                    disto.BaseQuantity = remainBaseQty;
                                    ManageSTO(sto, disto);
                                }
                                else
                                {
                                    ManageSTO(sto, disto);
                                }
                            });
                        }
                         
                        updatePallet(sto.parentID.Value, StorageObjectType.BASE);

                    });
                }
            });

            void ManageSTO(StorageObjectCriteria sto, amt_DocumentItemStorageObject disto)
            {
                var updSto = new StorageObjectCriteria();
                updSto = sto;
                updSto.baseQty -= disto.BaseQuantity.Value;
                var qtyConvert = StaticValue.ConvertToNewUnitBySKU(sto.skuID.Value, updSto.baseQty, updSto.baseUnitID, updSto.unitID);
                updSto.qty = qtyConvert.newQty;

                //update new sto pick
                var issuedSto = new StorageObjectCriteria();
                issuedSto = sto.Clone();
                issuedSto.id = null;
                issuedSto.baseQty = disto.BaseQuantity.Value;
                var qtyConvert_issued = StaticValue.ConvertToNewUnitBySKU(issuedSto.skuID.Value, issuedSto.baseQty, issuedSto.baseUnitID, issuedSto.unitID);
                issuedSto.qty = qtyConvert_issued.newQty;
                issuedSto.parentID = null;
                issuedSto.mapstos = null;
                var done_des_event_status = ObjectUtil.QryStrGetValue(issuedSto.options, OptionVOConst.OPT_DONE_DES_EVENT_STATUS);
                if (done_des_event_status == null || done_des_event_status.Length == 0)
                {
                    issuedSto.eventStatus = StorageObjectEventStatus.PACK_PICKED;
                }
                else
                {
                    StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(done_des_event_status);
                    issuedSto.eventStatus = eventStatus;
                }

                var stoIDIssued = ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);
                //update status ให้เป็น Done เมื่อไม่มี Des_WaveSeq_ID
                if (disto.Des_WaveSeq_ID == null)
                {
                    ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                }

                if (updSto.baseQty == 0)
                {
                    updSto.eventStatus = StorageObjectEventStatus.PACK_REMOVED;
                    ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                }
                else
                {
                    var distoAll = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                                   {
                                                new SQLConditionCriteria("WorkQueue_ID", queueTrx.ID.Value, SQLOperatorType.EQUALS),
                                                        new SQLConditionCriteria("Sou_StorageObject_ID", sto.id.Value, SQLOperatorType.EQUALS),
                                                        new SQLConditionCriteria("Status", EntityStatus.REMOVE, SQLOperatorType.NOTEQUALS),
                                                   }, this.BuVO);
                    if (distoAll.TrueForAll(x => x.Status == EntityStatus.DONE))
                    {
                        var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                        if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                        {
                            updSto.eventStatus = StorageObjectEventStatus.PACK_RECEIVED;
                        }
                        else
                        {
                            StorageObjectEventStatus eventStatus = EnumUtil.GetValueEnum<StorageObjectEventStatus>(upd_done_sou_event_status);
                            updSto.eventStatus = eventStatus;
                            RemoveOPTEventSTO(updSto.id.Value, updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS, this.BuVO);
                        }
                    }
                    ADO.WMSDB.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                }
                
            }
            void updatePallet(long parent_id, StorageObjectType parent_type)
            {
                // ถ้าไม่มี status pack 1 => ถ้ามันมี 3 พาเลทจบงาน ไม่มีลบพาเลท

                if (parent_type != StorageObjectType.LOCATION)
                {
                    var getParent = ADO.WMSDB.StorageObjectADO.GetInstant().Get(parent_id, StorageObjectType.BASE, false, false, BuVO);

                    var stocheckpallet = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                                                    new SQLConditionCriteria("ParentStorageObject_ID", parent_id, SQLOperatorType.EQUALS),
                                                    new SQLConditionCriteria("ObjectType", StorageObjectType.PACK, SQLOperatorType.EQUALS),
                                                    new SQLConditionCriteria("Status", "0,1", SQLOperatorType.IN),
                                                }, this.BuVO);
                    if (stocheckpallet == null || stocheckpallet.Count == 0)
                    {
                        //ถ้าไม่มีให้ลบพาเลท
                        ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(parent_id, null, null, StorageObjectEventStatus.BASE_REMOVE, this.BuVO);
                        if (getParent.parentID.HasValue)
                            updatePallet(getParent.parentID.Value, getParent.parentType.Value);
                    }

                }
            }
        }
        
        private WorkQueueCriteria ManageWQ(TReq reqVO, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED || queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
            {
                queueTrx.AreaLocationMaster_ID = _location.ID;
                queueTrx.AreaMaster_ID = _area.ID.Value;
                queueTrx.Warehouse_ID = _area.Warehouse_ID.Value;
                queueTrx.Des_AreaLocationMaster_ID = _location.ID;
                queueTrx.ActualTime = reqVO.actualTime;
                queueTrx.EndTime = reqVO.actualTime;
                queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;

                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);

                if (queueTrx.IOType == IOType.OUTBOUND)
                {
                    if (docItems.Count > 0)
                    {

                        var getArea = new MoveStoInGateToNextArea();

                        var treq = new MoveStoInGateToNextArea.TReq()
                        {
                            stoID = queueTrx.StorageObject_ID.Value,
                            stoType = StorageObjectType.BASE
                        };
                        getArea.Execute(this.Logger, this.BuVO, treq);

                    }
                }
                var workQueue = this.GenerateResponse(stos, queueTrx);
                return workQueue;
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