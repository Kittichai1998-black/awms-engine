using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business.Loading
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
            var docLoad = ADO.DataADO.GetInstant().SelectByID<amt_Document>(reqVO.docID, this.BuVO);
            if(docLoad.EventStatus != DocumentEventStatus.WORKING)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "เอกสาร Loading ต้องอยู่ใส่สถานะ Working เท่านั้น ");

            //var stomap = ADO.StorageObjectADO.GetInstant().Get(reqVO.scanCode, docLoad.Sou_Warehouse_ID, docLoad.Sou_AreaMaster_ID, false, true, this.BuVO);

            var baseCanLoads = new ListBaseConsoCanLoading().Execute(this.Logger, this.BuVO,
                new ListBaseConsoCanLoading.TReq() { docID = reqVO.docID });

            var willLoad = baseCanLoads.datas.FirstOrDefault(x => x.code == reqVO.scanCode);
            if (willLoad == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "ไม่พบ Code " + reqVO.scanCode + " ที่ต้องการ Load");
            else if (willLoad.isLoaded)
                throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Code " + reqVO.scanCode + " ได้ทำการ Load เสร็จแล้ว ไม่สามารถ Load ซ่ำได้");

            willLoad.isLoaded = true;
            var stoLoads = ADO.StorageObjectADO.GetInstant().Get(willLoad.id, willLoad.objectType, false, true, this.BuVO).ToTreeList();

            ADO.DocumentADO.GetInstant().MappingSTO(
                willLoad.docItemID,
                stoLoads.Where(x => x.type == StorageObjectType.PACK).Select(x => x.id.Value).ToList(),
                this.BuVO);

            if (baseCanLoads.datas.TrueForAll(x => x.isLoaded))
                ADO.DocumentADO.GetInstant().UpdateStatusToChild(
                    reqVO.docID, 
                    DocumentEventStatus.WORKING,
                    EntityStatus.ACTIVE,
                    DocumentEventStatus.WORKED,
                    this.BuVO);
            baseCanLoads.datas.FindAll(x => x.isLoaded).ForEach(x =>
            {
                ADO.StorageObjectADO.GetInstant().UpdateStatusToChild(x.rootID, null, EntityStatus.ACTIVE, StorageObjectEventStatus.LOADED, this.BuVO);
            });




            return baseCanLoads;
        }
    }
}
