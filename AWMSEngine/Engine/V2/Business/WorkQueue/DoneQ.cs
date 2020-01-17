using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.ADO.StaticValue;
using AWMSEngine.Engine.General;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Request;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.WorkQueue
{
    public class DoneQ : BaseQueue<DoneQ.TReq, WorkQueueCriteria>
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
        public class TDocItems
        {
            public long? ID;
            public long Document_ID;
            public decimal? Quantity;
            public decimal? BaseQuantity;
            public List<amt_DocumentItemStorageObject> DocItemStos;

        }

        private ams_AreaLocationMaster _location;
        private ams_Warehouse _warehouse;
        private ams_AreaMaster _area;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            this.InitDataASRS(reqVO);

            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            if (queueTrx.Des_Warehouse_ID != queueTrx.Warehouse_ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Present Location Not Equals Destination Location.");

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
            this._location = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
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
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Pallet Not Found");

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, _location.ID.Value, this.BuVO);

            return mapsto;
        }

        private WorkQueueCriteria UpdateDocumentItemStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            WorkQueueCriteria workQueueRes = new WorkQueueCriteria();
            var stos = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, _warehouse.ID.Value, null, false, true, this.BuVO);
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).ToList();
            //List<TDocItems> docItems = docItemss.Select(x => new TDocItems { ID = x.ID, Document_ID = x.Document_ID, Quantity = x.Quantity, BaseQuantity = x.BaseQuantity, DocItemStos = x.DocItemStos }).Distinct().ToList();

            var docs = ADO.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO).FirstOrDefault();

            if (queueTrx.Des_Warehouse_ID == _warehouse.ID.Value)
            {
                workQueueRes = ManageWQ(reqVO, queueTrx, docItems, stos);

                if (queueTrx.IOType == IOType.INPUT)
                {
                    ManageDocumentInput(reqVO, docs, queueTrx, docItems, stos);
                }
                else if (queueTrx.IOType == IOType.OUTPUT && docs.DocumentType_ID != DocumentTypeID.AUDIT)
                {

                    if (docItems.Count > 0)
                    {
                        docItems = ManageDocumentOutput(reqVO, docs, queueTrx, docItems, stos);

                        //check sto ว่ายังมี pack อยุ่ในพาเลทมั้ย ถ้าไม่มี ให้ลบพาเลท REMOVED ถ้าเหลือให้เปลี่ยนเป็น RECEIVED

                        var stos2 = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, _warehouse.ID.Value, null, false, true, this.BuVO);
                        var stoList2 = stos2.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                        if (stoList2.Count == 0 || stoList2.TrueForAll(x => x.eventStatus == StorageObjectEventStatus.REMOVED))
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(stos2.id.Value, null, null, StorageObjectEventStatus.REMOVED, this.BuVO);
                        }
                        else
                        {
                            ADO.StorageObjectADO.GetInstant().UpdateStatus(stos2.id.Value, null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                        }

                    }
                }
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

            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueueDisto(queueID, this.BuVO);

            if (docItems.Count > 0)
            {
                docsCode = docItems.Select(x => x.Document_ID).Distinct().ToList();
            }

            return docsCode;
        }

        private amt_DocumentItemStorageObject UpdateSTOFull(StorageObjectCriteria sto, amt_DocumentItemStorageObject disto)
        {
            var updSto = new StorageObjectCriteria();
            updSto = sto.Clone();
            updSto.qty = 0;
            updSto.baseQty = 0;
            updSto.mapstos = null;
            updSto.eventStatus = StorageObjectEventStatus.REMOVED;
            ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

            var issuedSto = new StorageObjectCriteria();
            issuedSto = sto.Clone();
            issuedSto.id = null;
            issuedSto.parentID = null;
            issuedSto.parentType = null;
            issuedSto.mapstos = null;
            issuedSto.eventStatus = StorageObjectEventStatus.PICKING;
            var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
            ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);
            disto.Des_StorageObject_ID = stoIDIssued;
            disto.Status = EntityStatus.ACTIVE;
            disto.Quantity = issuedSto.qty;
            disto.BaseQuantity = issuedSto.baseQty;
            return disto;
        }
        private void ManageDocumentInput(TReq reqVO, amt_Document docs, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            if (docItems.Count > 0)
            {
                if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                {
                    var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
                    docItems.ForEach(docItem =>
                    {
                        stoList.ForEach(sto =>
                        {
                            var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);

                            distos.ForEach(disto =>
                            {
                                ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, sto.id.Value, null, null, EntityStatus.ACTIVE, this.BuVO);
                            });

                        });
                    });
                }
            }
            else
            {
                //Audit เคสที่ ไม่มีการผูกเอกสาร
                var getDisto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                {
                            new SQLConditionCriteria("WorkQueue_ID", queueTrx.ID.Value, SQLOperatorType.EQUALS),
                }, this.BuVO);

                if (getDisto.Count > 0)
                {
                    getDisto.ForEach(x => {
                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(x.ID.Value, EntityStatus.ACTIVE, this.BuVO);
                    });
                }
                else
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Document Item Storage Object Not Found");
                }
            }
        }
        private List<amt_DocumentItem> ManageDocumentOutput(TReq reqVO, amt_Document docs, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();

            var listDisto = new List<amt_DocumentItemStorageObject>();
            docItems.ForEach(x => { listDisto.AddRange(x.DocItemStos); });
            var sumDisto = listDisto.GroupBy(x => x.Sou_StorageObject_ID).Select(x => new { stoID = x.Key, sumBaseQty = x.Sum(y => y.BaseQuantity), sumQty = x.Sum(y => y.Quantity) }).ToList();

            docItems.ForEach(docItem =>
            {
                if (docItem.Quantity == null)
                {
                    stoList.ForEach(sto =>
                    {
                        var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);
                        distos.ToList().ForEach(disto =>
                        {
                            disto = UpdateSTOFull(sto, disto);
                        });

                    });
                }
                else
                {

                    var qtyIssue = docItem.Quantity;//1500
                    var baseqtyIssue = docItem.BaseQuantity;
                    decimal? sumDiSTOQty = sumDisto.Sum(x => x.sumQty); 
                    decimal? sumDiSTOBaseQty = sumDisto.Sum(x => x.sumBaseQty);
                    stoList.ForEach(sto =>
                    {
                        var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id).ToList();

                        distos.ForEach(disto =>
                        {
                            if (disto.Quantity == null)
                            {

                                var remainQty = qtyIssue - sumDiSTOQty;
                                var remainBaseQty = baseqtyIssue - sumDiSTOBaseQty;
                                //จำนวนที่ต้องการเบิก - ผลรวมของจำนวนที่ถูกเบิกเเล้วในdisto = จำนวนที่ยังต้องเบิกเพิ่ม  

                                //1) 1500 - 0 = 1500  sto1 เบิกเต็ม สถานะเปลี่ยนเป็น picking  , disto_sou = disto_des
                                if (remainQty >= sto.qty) //1500 > 1000
                                { //ถ้า จำนวนที่ยังต้องเบิกเพิ่ม >= จำนวนของ sto  ให้ตัดเต็ม 
                                    disto = UpdateSTOFull(sto, disto);

                                }
                                //2) 1500 - 1000 = 500 sto2 ของเหลือ สถานะยังเป็น received ส่วนที่เบิกสร้างstoใหม่ สถานะเปนpicking
                                else
                                {  //500 < 1000
                                   //จำนวนที่ยังต้องเบิกเพิ่ม น้อยกว่า จำนวนของที่ stoมีอยู่ 
                                   //ให้หักqty ออกจากstoเดิม ส่วนที่เหลือเป็น Received 
                                    var updSto = new StorageObjectCriteria();
                                    updSto = sto.Clone();
                                    updSto.baseQty -= remainQty.Value;  //1000 - 500 = เหลือของ 500
                                    updSto.qty -= remainBaseQty.Value;

                                    if (updSto.baseQty == 0)
                                    {   //เบิกของหมด เปลี่ยนสภานะเป็น PICKING
                                        disto = UpdateSTOFull(sto, disto);

                                    }
                                    else
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

                                        //ส่วนที่ตัดเบิก สร้างissueSto เป็นpicking 
                                        var issuedSto = new StorageObjectCriteria();
                                        issuedSto = sto.Clone();
                                        issuedSto.id = null;
                                        issuedSto.baseQty = remainQty.Value; //500 จำนวนที่ต้องเบิกเพิ่ม
                                        issuedSto.qty = remainBaseQty.Value;
                                        issuedSto.parentID = null;
                                        issuedSto.mapstos = null;
                                        issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                        var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                                        //อัพเดท des_stoID ของ pack ที่สร้างใหม่
                                        disto.Des_StorageObject_ID = stoIDIssued;
                                        disto.Quantity = issuedSto.qty;
                                        disto.BaseQuantity = issuedSto.baseQty;
                                        disto.Status = EntityStatus.ACTIVE;
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);
                                        var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);

                                    }
                                }

                            }
                            else
                            {
                                if (sto.qty == disto.Quantity)
                                {
                                    disto = UpdateSTOFull(sto, disto);
                                }
                                else
                                {
                                    var updSto = new StorageObjectCriteria();
                                    updSto = sto.Clone();
                                    updSto.baseQty -= disto.BaseQuantity.Value;
                                    updSto.qty -= disto.Quantity.Value;


                                    if (updSto.baseQty == 0)
                                    {   //เบิกของหมด เปลี่ยนสภานะเป็น PICKING
                                        disto = UpdateSTOFull(sto, disto);
                                    }
                                    else
                                    {
                                        //พาเลทเดิม มีของเหลือ เปลี่ยนสถานะเป็น RECEIVED  ถ้ามี sou_done_evenstatus 
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

                                        //สร้างpack ใหม่ที่ไม่ได้ผูก parent base สถานะ PICKING , qty = จำนวนที่เบิก
                                        var issuedSto = new StorageObjectCriteria();
                                        issuedSto = sto.Clone();
                                        issuedSto.id = null;
                                        issuedSto.baseQty = disto.BaseQuantity.Value;
                                        issuedSto.qty = disto.Quantity.Value;
                                        issuedSto.parentID = null;
                                        issuedSto.mapstos = null;
                                        issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                        var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                                        ///อัพเดท des_stoID ของ pack ที่สร้างใหม่
                                        disto.Des_StorageObject_ID = stoIDIssued;
                                        disto.Status = EntityStatus.ACTIVE;
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, null, null, EntityStatus.ACTIVE, this.BuVO);
                                        var stoIDUpdated2 = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                                    }

                                }
                            }

                        });
                    });

                }

            });
            return docItems;
        }
        private WorkQueueCriteria ManageWQ(TReq reqVO, SPworkQueue queueTrx, List<amt_DocumentItem> docItems, StorageObjectCriteria stos)
        {
            if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED || queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
            {
                queueTrx.AreaLocationMaster_ID = _location.ID;
                queueTrx.AreaMaster_ID = _area.ID.Value;
                queueTrx.Warehouse_ID = _area.Warehouse_ID.Value;

                queueTrx.ActualTime = reqVO.actualTime;
                queueTrx.EndTime = reqVO.actualTime;
                queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;

                WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);

                if (queueTrx.IOType == IOType.OUTPUT)
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

            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto_id, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}