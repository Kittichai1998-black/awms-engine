using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.ADO;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.Engine.Business
{
    public class LoadedStoByScanConso : BaseEngine<LoadedStoByScanConso.TReq, ListBaseConsoCanLoading.TRes>
    {
        public class TReq
        {
            public long docID;
            public string scanCode;
        }

        protected override ListBaseConsoCanLoading.TRes ExecuteEngine(TReq reqVO)
        {
            var distoLD = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO);

            var docLoad = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);
            if(docLoad.EventStatus != DocumentEventStatus.WORKING)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสาร Loading ต้องอยู่ใส่สถานะ Working เท่านั้น ");

            var baseCanLoads = new ListBaseConsoCanLoading().Execute(this.Logger, this.BuVO,
                new ListBaseConsoCanLoading.TReq() { docID = reqVO.docID });

            var willLoad = baseCanLoads.datas.FirstOrDefault(x => x.rootCode == reqVO.scanCode && !x.isLoaded);
            if (willLoad == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบ Code " + reqVO.scanCode + " ที่ต้องการ Load");
            else if (willLoad.isLoaded)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Code " + reqVO.scanCode + " ได้ทำการ Load เสร็จแล้ว ไม่สามารถ Load ซ่ำได้");

            willLoad.isLoaded = true;
            if (willLoad.sou_objectType != StorageObjectType.PACK)
            {
                //UpdateMappingSTO
                foreach (var docStos in distoLD)
                {
                    docStos.DocItemStos.ForEach(disto =>
                    {
                        AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(disto.ID.Value,EntityStatus.ACTIVE, this.BuVO);
                        disto.Status = EntityStatus.ACTIVE;
                    });
                }

                baseCanLoads.datas.FindAll(x => x.rootCode == willLoad.rootCode).ForEach(x => x.isLoaded = true);
                
            }
               

            var stoLoadTmp = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(willLoad.sou_id, willLoad.sou_objectType, false, true, this.BuVO);

            if (stoLoadTmp == null || stoLoadTmp.id != willLoad.sou_id)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบรายการ '" + willLoad.code + "' ในคลังสินค้า");

            var stoLoads = stoLoadTmp.ToTreeList();

            //TODO
            //ADO.DocumentADO.GetInstant().MappingSTO(
            //    willLoad.docItemID,
            //    stoLoads.Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList(),
            //    this.BuVO);

            foreach (var docStos in distoLD)
            {
               
                    var checkDoc = docStos.DocItemStos.TrueForAll(x => x.Status == EntityStatus.ACTIVE);

                    if (checkDoc)
                    {
                        DocumentADO.GetInstant().UpdateItemEventStatus(docStos.ID.Value,DocumentEventStatus.WORKED, this.BuVO);
                        docStos.EventStatus = DocumentEventStatus.WORKED;
                    }

            }
            var checkDocItems = distoLD.TrueForAll(x => x.EventStatus == DocumentEventStatus.WORKED);

            if (checkDocItems)
            {
                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(
                  reqVO.docID,
                  null,
                  null,
                  DocumentEventStatus.CLOSED,
                  this.BuVO);

                docLoad.EventStatus = DocumentEventStatus.CLOSED;
                docLoad.Status = EntityStatus.DONE;
            }
           
            if (docLoad.EventStatus == DocumentEventStatus.CLOSED)
            {
                baseCanLoads.datas.ForEach(x =>
                {
                    AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(
                    x.linkDocID,
                    null,
                    null,
                    DocumentEventStatus.CLOSED,
                    this.BuVO);
                });


            }

             AWMSEngine.ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(willLoad.rootID, null, EntityStatus.ACTIVE, StorageObjectEventStatus.LOADED, this.BuVO);


            return baseCanLoads;
        }
    }
}
