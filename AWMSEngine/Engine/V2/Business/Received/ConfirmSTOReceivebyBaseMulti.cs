using AMWUtil.Common;
using AMWUtil.Exception;
using AMSModel.Constant.EnumConst;
using AMSModel.Criteria;
using AMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ConfirmSTOReceivebyBaseMulti : BaseEngine<ConfirmSTOReceivebyBaseMulti.TReq, ConfirmSTOReceivebyBaseMulti.TRes>
    {
        public class TReq
        {
            public long? bstoID;
        }
        public class TRes
        {
            public List<long> docIDs;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, BuVO);
            //var pack = stosPack.mapstos.FirstOrDefault().id;
            //var areaLocation = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
            //          new KeyValuePair<string, object>[] {
            //            new KeyValuePair<string,object>("AreaMaster_ID",stosPack.areaID),
            //           }, this.BuVO).FirstOrDefault();
            //var updateStorageObject = ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_StorageObject>(stosPack.id.Value, this.BuVO,
            //     new KeyValuePair<string, object>[] {
            //        new KeyValuePair<string,object>("AreaLocationMaster_ID",areaLocation.ID),
            //     });

            var stopackList = stosPack.ToTreeList().Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.PACK_NEW).ToList();

            List<long> docIDs = new List<long>();
            var docitemList = ADO.WMSDB.DocumentADO.GetInstant().ListItemBySTO(
                stopackList.Select(x => x.id.Value).ToList(),
                DocumentTypeID.PUTAWAY, BuVO);
            if (docitemList != null && docitemList.Count > 0)
            {
                docitemList.ForEach(docitem =>
              {
                  if (docitem != null)
                  {
                      if (docitem.EventStatus == DocumentEventStatus.NEW || docitem.EventStatus == DocumentEventStatus.WORKING)
                      {
                          docitem.DocItemStos = ADO.WMSDB.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                                      new KeyValuePair<string, object>[] {
                                    new KeyValuePair<string,object>("DocumentItem_ID",docitem.ID.Value),
                                    new KeyValuePair<string,object>("DocumentType_ID",DocumentTypeID.PUTAWAY),
                                      }, this.BuVO);
                          if (docitem.DocItemStos != null && docitem.DocItemStos.Count > 0)
                          {
                              docitem.DocItemStos.ForEach(disto =>
                              {
                                  var pack = stopackList.Find(x => x.id.Value == disto.Sou_StorageObject_ID);
                                  if (pack != null)
                                  {
                                      ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.PACK_RECEIVED, BuVO);

                                      disto.Status = EntityStatus.ACTIVE;
                                      ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.ACTIVE, BuVO);
                                    //ถ้าไม่มี des_waveseq สุดท้ายเเล้ว ให้อัพเดท disto เป็น Done
                                    if (disto.Des_WaveSeq_ID == null)
                                      {
                                          disto.Status = EntityStatus.DONE;
                                          ADO.WMSDB.DistoADO.GetInstant().Update(disto.ID.Value, EntityStatus.DONE, this.BuVO);
                                      }
                                  }

                              });
                              if (docitem.DocItemStos.Any(x => x.Status == EntityStatus.ACTIVE || x.Status == EntityStatus.DONE))
                              {
                                  docitem.EventStatus = DocumentEventStatus.WORKING;
                                  ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(docitem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                              }
                          }
                          ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(docitem.Document_ID, DocumentEventStatus.WORKING, this.BuVO);

                      }

                      var docsPA = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docitem.Document_ID, BuVO);

                      var getGR = ADO.WMSDB.DocumentADO.GetInstant().GetDocumentAndDocItems(docsPA.ParentDocument_ID.Value, this.BuVO);

                      docsPA.DocumentItems.ForEach(item =>
                      {
                          var grItem = getGR.DocumentItems.Find(y => y.ID == item.ParentDocumentItem_ID);
                          if (item.EventStatus == DocumentEventStatus.WORKING)
                          {
                              grItem.EventStatus = DocumentEventStatus.WORKING;
                              ADO.WMSDB.DocumentADO.GetInstant().UpdateItemEventStatus(grItem.ID.Value, DocumentEventStatus.WORKING, this.BuVO);
                          }
                      });
                      if (getGR.EventStatus == DocumentEventStatus.NEW)
                          ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getGR.ID.Value, DocumentEventStatus.WORKING, this.BuVO);

                      docIDs.Add(docitem.Document_ID);
                  }
                  else
                  {
                      throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารรับเข้า ไม่สามารถทำการปิดเอกสารได้");
                  }
              });
                res.docIDs = docIDs.Distinct().ToList();
                return res;
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารรับเข้า ไม่สามารถทำการปิดเอกสารได้");
            }
        }

    }
}