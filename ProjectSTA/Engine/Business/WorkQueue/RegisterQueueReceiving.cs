using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTA.Engine.Business.WorkQueue
{
    public class RegisterQueueReceiving : AWMSEngine.Engine.BaseEngine<RegisterQueueReceiving.TReq, WorkQueueCriteria>
    {
        public class TReq //ข้อมูล Request จาก WCS
        {
            public string baseCode;//รหัสพาเลท
            public string locationCode;//รหัสเกต
        }
        private ams_AreaLocationMaster _locationASRS;
        private ams_Warehouse _warehouseASRS;
        private ams_AreaMaster _areaASRS;

        protected override WorkQueueCriteria ExecuteEngine(TReq reqVO)
        {
            //Init Data from ASRS
            this.InitDataASRS(reqVO);
            //Get or Mapping Pallet
            var mapsto = this.MappingPallet(reqVO);
            if (mapsto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' Not Found");
            if (mapsto.code != reqVO.baseCode)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code: '" + reqVO.baseCode + "' INCORRECT");

            List<amt_DocumentItem> docItems = null;
            //รับสินค้าใหม่เข้าคลัง
            if (mapsto.eventStatus == StorageObjectEventStatus.NEW)
            {
                docItems = this.ProcessReceiving(mapsto, reqVO);
                if (docItems.Count() == 0)
                    throw new AMWException(this.Logger, AMWExceptionCode.V2001, "Good Received Document Not Found");
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V2002, "Can't receive Base Code: '" + reqVO.baseCode + "' into the ASRS because it had Event Status: '" + mapsto.eventStatus + "'");
            }
            return new WorkQueueCriteria();
        }

        private void InitDataASRS(TReq reqVO)
        { 
            this._locationASRS = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaLocationMaster>(
                new SQLConditionCriteria[] {
                        new SQLConditionCriteria("Code",reqVO.locationCode, SQLOperatorType.EQUALS),
                        new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS, SQLConditionType.AND)
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO).FirstOrDefault();
            if (_locationASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Location Code: '" + reqVO.locationCode + "' Not Found");
            this._areaASRS = this.StaticValue.AreaMasters.FirstOrDefault(x => x.ID == _locationASRS.AreaMaster_ID);
            if (_areaASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Area Code: '" + _areaASRS.Code + "' Not Found");
            this._warehouseASRS = this.StaticValue.Warehouses.FirstOrDefault(x => x.ID == _areaASRS.Warehouse_ID);
            if (_warehouseASRS == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Warehouse Code: '" + _warehouseASRS.Code + "' Not Found");

        }

        private StorageObjectCriteria MappingPallet(TReq reqVO)
        {
            var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(reqVO.baseCode,
                _warehouseASRS.ID, _areaASRS.ID, false, true, this.BuVO);
            if(mapsto == null)
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Storage Object of Base Code: '" + reqVO.baseCode + "' Not Found");
            }
           // AWMSEngine.ADO.StorageObjectADO.GetInstant()
           //    .UpdateStatusToChild(mapsto.id.Value, StorageObjectEventStatus.NEW, null, StorageObjectEventStatus.RECEIVING, this.BuVO);

            return mapsto;
        }
        
        //BEGIN*******************ProcessReceiving***********************

        private List<amt_DocumentItem> ProcessReceiving(StorageObjectCriteria mapsto, TReq reqVO)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            List<amt_Document> documents = new List<amt_Document>();
            //var mapstoTree = mapsto.ToTreeList();
            //var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW);

            //foreach (var packH in packs)
            //{
            // }
            documents = AWMSEngine.ADO.DocumentADO.GetInstant()
                     .ListDocs(DocumentTypeID.GOODS_RECEIVED, _warehouseASRS.Branch_ID, _warehouseASRS.ID, _areaASRS.ID, MovementType.EMPTY, this.BuVO);
            documents.Where(x => x.EventStatus == DocumentEventStatus.NEW && x.EventStatus == DocumentEventStatus.WORKING);
            if(documents != null && documents.Count > 0)
            {
                foreach(var doc in documents)
                {

                }
            }
            else
            {

            }

            return docItems;
        }
        private List<amt_DocumentItem> ProcessReceiving_CreateDocumentItems(TReq reqVO, long souWarehouseID, List<StorageObjectCriteria> packs, bool isAutoCreate)
        {
            List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();
            return docItems;

        }
    }
}
