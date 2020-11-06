using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Received
{
    public class ConfirmSTOReceivebybstoID : BaseEngine<ConfirmSTOReceivebybstoID.TReq, ConfirmSTOReceivebybstoID.TRes>
    {
        public class TReq
        {
            public long? bstoID;
        }
        public class TRes
        {
            public long? docID;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();
            var StaticValue = ADO.WMSStaticValue.StaticValueManager.GetInstant();
            var stosPack = ADO.WMSDB.StorageObjectADO.GetInstant().Get(reqVO.bstoID.Value, StorageObjectType.BASE, false, true, BuVO);
            //var pack = stosPack.mapstos.FirstOrDefault().id;
            var areaLocation = ADO.WMSDB.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                      new KeyValuePair<string, object>[] {
                        new KeyValuePair<string,object>("AreaMaster_ID",stosPack.areaID),
                       }, this.BuVO).FirstOrDefault();
            var updateStorageObject = ADO.WMSDB.DataADO.GetInstant().UpdateByID<amt_StorageObject>(stosPack.id.Value, this.BuVO,
                 new KeyValuePair<string, object>[] {
                    new KeyValuePair<string,object>("AreaLocationMaster_ID",areaLocation.ID),
                 });

            var stopackList = stosPack.ToTreeList().Where(x => x.type == StorageObjectType.PACK).ToList();
            var docitem = ADO.WMSDB.DocumentADO.GetInstant().ListItemBySTO(
                stopackList.Select(x => x.id.Value).ToList(),
                DocumentTypeID.PUTAWAY, BuVO).FirstOrDefault();

             
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
                                ADO.WMSDB.StorageObjectADO.GetInstant().UpdateStatus(disto.Sou_StorageObject_ID, null, null, StorageObjectEventStatus.RECEIVED, BuVO);

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

                ADO.WMSDB.DocumentADO.GetInstant().UpdateEventStatus(getGR.ID.Value, DocumentEventStatus.WORKING, this.BuVO);

            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่พบเอกสารรับเข้า ไม่สามารถทำการปิดเอกสารได้");
            }

             
            res.docID = docitem.Document_ID;
            return res;
        }

    }
}