using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
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
    public class DoneQ : BaseEngine<DoneQ.TReq, List<long>>
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
      
        protected override List<long> ExecuteEngine(TReq reqVO)
        {
            var queueTrx = ADO.WorkQueueADO.GetInstant().Get(reqVO.queueID.Value, this.BuVO);
            if (queueTrx.Des_Warehouse_ID != queueTrx.Warehouse_ID)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Present Location Not Equals Destination Location.");

            this.UpdateStorageObjectLocation(reqVO, queueTrx);

            this.UpdateDocumentItemStorageObject(reqVO, queueTrx);

            var docs = GetDocument(reqVO.queueID.Value);
          
            return docs;
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
        private StorageObjectCriteria UpdateStorageObjectLocation(TReq reqVO, SPworkQueue queueTrx)
        {
            var mapsto = ADO.StorageObjectADO.GetInstant().Get(queueTrx.StorageObject_ID.Value, StorageObjectType.BASE, false, true, this.BuVO);
            if (mapsto.parentType != StorageObjectType.LOCATION)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Pallet information is incorrect.");

            var location = DataADO.GetInstant().SelectByCodeActive<ams_AreaLocationMaster>(reqVO.locationCode, this.BuVO);
            if (location == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Location Code is incorrect.");

            ADO.StorageObjectADO.GetInstant().UpdateLocationToChild(mapsto, location.ID.Value, this.BuVO);

            return mapsto;
        }

        private void UpdateDocumentItemStorageObject(TReq reqVO, SPworkQueue queueTrx)
        {
            var warehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (warehouse == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " Not Found");
            var area = StaticValue.AreaMasters.FirstOrDefault(x => x.Code == reqVO.areaCode);
            if (area == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Area " + reqVO.areaCode + " Not Found");
            var location = ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("Code",reqVO.locationCode),
                    new KeyValuePair<string,object>("AreaMaster_ID",area.ID.Value),
                    new KeyValuePair<string,object>("Status", EntityStatus.ACTIVE)
                }, this.BuVO).FirstOrDefault();

            var stos = ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode, warehouse.ID.Value, null, false, true, this.BuVO);
            var stoList = stos.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            var docItems = ADO.DocumentADO.GetInstant().ListItemByWorkQueue(reqVO.queueID.Value, this.BuVO).Select(x => new { x.ID, x.Document_ID, x.Quantity, x.BaseQuantity, x.DocItemStos }).Distinct().ToList();

            var docs = ADO.DocumentADO.GetInstant().List(docItems.Select(x => x.Document_ID).Distinct().ToList(), this.BuVO).FirstOrDefault();

            if (queueTrx.Des_Warehouse_ID == warehouse.ID.Value)
            {
                if (queueTrx.IOType == IOType.INPUT)
                {
                    if (docItems.Count > 0)
                    {
                        docItems.ForEach(docItem =>
                        {
                             
                            stoList.ForEach(sto =>
                            {
                                if (docs.DocumentType_ID != DocumentTypeID.AUDIT)
                                {
                                    var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);

                                    distos.ForEach(disto =>
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, sto.id.Value, null, null, EntityStatus.ACTIVE, this.BuVO);
                                    });
                                }
                            });
                        });
                        
                    }
                    else
                    {
                        //เคสที่ ไม่มีการผูกเอกสาร
                        var stoPack = stos.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();
                        var getDisto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                        {
                            new SQLConditionCriteria("WorkQueue_ID", queueTrx.ID.Value, SQLOperatorType.EQUALS),
                        }, this.BuVO).First();


                        if (getDisto != null)
                        {
                            ADO.DocumentADO.GetInstant().UpdateMappingSTO(getDisto.ID.Value, stoPack.id.Value, null, null, EntityStatus.ACTIVE, this.BuVO);
                        }
                        //update STO Event = Received เลย
                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.RECEIVED, this.BuVO);
                    }
                }
                else if (queueTrx.IOType == IOType.OUTPUT && docs.DocumentType_ID != DocumentTypeID.AUDIT)
                {
                    //ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);

                    if (docItems.Count > 0)
                    {
                        docItems.ForEach(docItem =>
                        {
                            if(docItem.Quantity == null)
                            {
                                stoList.ForEach(sto =>
                                {
                                    var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);
                                    distos.ToList().ForEach(disto =>
                                    {
                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Sou_StorageObject_ID, null, null, EntityStatus.ACTIVE, this.BuVO);
                                        ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);

                                    });
                                        
                                });
                            }
                            else
                            {
                                var qtyIssue = docItem.Quantity;//1500
                                var baseqtyIssue = docItem.BaseQuantity;
                                decimal? sumDiSTOQty = docItem.DocItemStos.Sum(x => x.Quantity);
                                decimal? sumDiSTOBaseQty = docItem.DocItemStos.Sum(x => x.BaseQuantity);
                                stoList.ForEach(sto =>
                                    {
                                        var distos = docItem.DocItemStos.FindAll(x => x.Sou_StorageObject_ID == sto.id);
                                    
                                        distos.ToList().ForEach(disto =>
                                        {
                                            if(disto.Quantity == null)
                                            {
                                                                                       
                                                var remainQty = qtyIssue - sumDiSTOQty;
                                                var remainBaseQty = baseqtyIssue - sumDiSTOBaseQty;
                                                //จำนวนที่ต้องการเบิก - ผลรวมของจำนวนที่ถูกเบิกเเล้วในdisto = จำนวนที่ยังต้องเบิกเพิ่ม  
                                             
                                                //1) 1500 - 0 = 1500  sto1 เบิกเต็ม สถานะเปลี่ยนเป็น picking  , disto_sou = disto_des
                                                if (remainQty >= sto.qty) //1500 > 1000
                                                { //ถ้า จำนวนที่ยังต้องเบิกเพิ่ม >= จำนวนของ sto  ให้ตัดเต็ม 
                                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Sou_StorageObject_ID, sto.qty, sto.baseQty, EntityStatus.ACTIVE, this.BuVO);
                                                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);
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
                                                    var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                                                    if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                                                    {
                                                        updSto.eventStatus = StorageObjectEventStatus.RECEIVED;

                                                    }
                                                    else
                                                    {
                                                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), upd_done_sou_event_status);
                                                        updSto.eventStatus = eventStatus;
                                                    }
                                                    if (updSto.baseQty == 0)
                                                    {   //เบิกของหมด เปลี่ยนสภานะเป็น PICKING
                                                        updSto.eventStatus = StorageObjectEventStatus.PICKING;
                                                    }
                                                    else
                                                    {   //ส่วนที่ตัดเบิก สร้างissueSto เป็นpicking 
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
                                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, issuedSto.qty, issuedSto.baseQty, EntityStatus.ACTIVE, this.BuVO);

                                                    }

                                                    var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                                                    //ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDUpdated, null, null, EntityStatus.ACTIVE, this.BuVO);

                                                }

                                            }
                                            else
                                            {
                                                if (sto.qty == disto.Quantity)
                                                {
                                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, disto.Sou_StorageObject_ID, null, null, EntityStatus.ACTIVE, this.BuVO);
                                                    ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);
                                                }
                                                else
                                                {
                                                    var updSto = new StorageObjectCriteria();
                                                    updSto = sto.Clone(); 
                                                    updSto.baseQty -= disto.BaseQuantity.Value;
                                                    updSto.qty -= disto.Quantity.Value;

                                                    //พาเลทเดิม มีของเหลือ เปลี่ยนสถานะเป็น RECEIVED  ถ้ามี sou_done_evenstatus 
                                                    //updSto.eventStatus = StorageObjectEventStatus.RECEIVED;
                                                    var upd_done_sou_event_status = ObjectUtil.QryStrGetValue(updSto.options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
                                                    if (upd_done_sou_event_status == null || upd_done_sou_event_status.Length == 0)
                                                    {
                                                        updSto.eventStatus = StorageObjectEventStatus.RECEIVED;

                                                    }
                                                    else
                                                    {
                                                        StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), upd_done_sou_event_status);
                                                        updSto.eventStatus = eventStatus;
                                                    }


                                                    if (updSto.baseQty == 0)
                                                    {   //เบิกของหมด เปลี่ยนสภานะเป็น PICKING
                                                        ADO.StorageObjectADO.GetInstant().UpdateStatus(stos.id.Value, null, null, StorageObjectEventStatus.PICKING, this.BuVO);

                                                        updSto.eventStatus = StorageObjectEventStatus.PICKING;

                                                    }
                                                    else
                                                    {   //สร้างpack ใหม่ที่ไม่ได้ผูก parent base สถานะ PICKING , qty = จำนวนที่เบิก
                                                        var issuedSto = new StorageObjectCriteria();
                                                        issuedSto = sto.Clone();
                                                        issuedSto.id = null;
                                                        issuedSto.baseQty = disto.BaseQuantity.Value;
                                                        issuedSto.qty = disto.Quantity.Value;
                                                        issuedSto.parentID = null;
                                                        issuedSto.mapstos = null;
                                                        issuedSto.eventStatus = StorageObjectEventStatus.PICKING;

                                                        var stoIDIssued = ADO.StorageObjectADO.GetInstant().PutV2(issuedSto, this.BuVO);
                                                        //อัพเดท des_stoID ของ pack ที่สร้างใหม่
                                                        ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDIssued, null, null, EntityStatus.ACTIVE, this.BuVO);
                                                    }
                                                    var stoIDUpdated = ADO.StorageObjectADO.GetInstant().PutV2(updSto, this.BuVO);
                                                    ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value, stoIDUpdated, null, null, EntityStatus.ACTIVE, this.BuVO);

                                                }
                                            }
                                        
                                        });
                                    });
 
                            }
                            
                        });
                    }
                }

                if (queueTrx.EventStatus == WorkQueueEventStatus.WORKED || queueTrx.EventStatus == WorkQueueEventStatus.WORKING)
                {
                    queueTrx.AreaLocationMaster_ID = location.ID;
                    queueTrx.AreaMaster_ID = area.ID.Value;
                    queueTrx.Warehouse_ID = area.Warehouse_ID.Value;

                    queueTrx.ActualTime = reqVO.actualTime;
                    queueTrx.EndTime = reqVO.actualTime;
                    queueTrx.EventStatus = WorkQueueEventStatus.CLOSED;

                    WorkQueueADO.GetInstant().PUT(queueTrx, this.BuVO);

                    if (queueTrx.IOType == IOType.OUTPUT)
                    {
                        if (docItems.Count > 0)
                        {
                            docItems.ForEach(docItem =>
                            {
                                var distos = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[]
                                   {
                                    new SQLConditionCriteria("DocumentItem_ID", docItem.ID, SQLOperatorType.EQUALS),
                                    new SQLConditionCriteria("WorkQueue_ID", queueTrx.ID.Value, SQLOperatorType.EQUALS)
                                   }, this.BuVO);

                                distos.ForEach(disto =>
                                {
                                    if(disto.DocumentType_ID == DocumentTypeID.GOODS_ISSUED)
                                    {
                                        var getArea = new MoveStoInGateToNextArea();
                                        var treq = new MoveStoInGateToNextArea.TReq()
                                        {
                                            baseStoID = queueTrx.StorageObject_ID.Value
                                        };
                                        getArea.Execute(this.Logger, this.BuVO, treq);
                                        
                                    }
                                    
                                });
                            });
                        }
                    }
                }
                else
                {
                   throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Cannot Complete Before Working");
                }
            }

        }
        private void UpdateSTOEvenStatus(amt_StorageObject bsto, VOCriteria buVO)
        {
            // OPT_DONE_SOU_EVENT_STATUS
            var done_sou_event_status = ObjectUtil.QryStrGetValue(bsto.Options, OptionVOConst.OPT_DONE_SOU_EVENT_STATUS);
            if (done_sou_event_status == null || done_sou_event_status.Length == 0)
            {
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.ID.Value, StorageObjectEventStatus.RECEIVING, null, StorageObjectEventStatus.RECEIVED, buVO);
            }
            else
            {
                StorageObjectEventStatus eventStatus = (StorageObjectEventStatus)Enum.Parse(typeof(StorageObjectEventStatus), done_sou_event_status);
                AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(bsto.ID.Value, null, null, eventStatus, buVO);
            }


            //remove OPT_DONE_SOU_EVENT_STATUS
            var listkeyRoot = ObjectUtil.QryStrToKeyValues(bsto.Options);
            var opt_done = "";

            if (listkeyRoot != null && listkeyRoot.Count > 0)
            {
                listkeyRoot.RemoveAll(x => x.Key.Equals(OptionVOConst.OPT_DONE_SOU_EVENT_STATUS));
                opt_done = ObjectUtil.ListKeyToQryStr(listkeyRoot);
            }
            AWMSEngine.ADO.DataADO.GetInstant().UpdateByID<amt_StorageObject>(bsto.ID.Value, buVO,
                    new KeyValuePair<string, object>[] {
                        new KeyValuePair<string, object>("Options", opt_done)
                    });
        }
    }
}
