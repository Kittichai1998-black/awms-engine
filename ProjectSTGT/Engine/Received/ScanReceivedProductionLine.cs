using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectSTGT.Engine.Received
{
    public class ScanReceivedProductionLine : AWMSEngine.Engine.BaseEngine<ScanMapStoNoDoc.TReq, StorageObjectCriteria>
    {
        public class TReq
        {
            public long? rootID;
            public long? docItemID;
            public string scanCode;
            public string orderNo;
            public string batch;
            public string lot;
            public decimal amount;
            public string unitCode;
            public DateTime? productDate;
            public long? warehouseID;
            public long? areaID;
            public string locationCode;
            public string options;
            public bool isRoot = true;
            public VirtualMapSTOModeType mode;
            public VirtualMapSTOActionType action;
            public string rootOptions;
        }


        protected override StorageObjectCriteria ExecuteEngine(ScanMapStoNoDoc.TReq reqVO)
        {
           var resDisto =new amt_DocumentItemStorageObject();
           var stos = new ScanMapStoNoDoc().Execute(Logger, BuVO, reqVO);
            
            if(stos != null)
            {
                if (stos.mapstos.Count > 0)
                {

                    resDisto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                        new SQLConditionCriteria[] {
                    new SQLConditionCriteria("Sou_StorageObject_ID",stos.mapstos[0].id, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.INACTIVE, SQLOperatorType.EQUALS)
                    }, this.BuVO).FirstOrDefault();
                }
            }
           

            if (reqVO.rootID !=null)
            {
               

                if (resDisto == null) //ไม่มี disto
                {
                    var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                       new SQLConditionCriteria[] {
                       new SQLConditionCriteria("OrderNo",reqVO.orderNo, SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("Code",reqVO.scanCode, SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("EventStatus", DocumentEventStatus.NEW,  SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("Options","%"+reqVO.options+"%", SQLOperatorType.LIKE),
                     }, this.BuVO).FirstOrDefault();

                    if (docItems == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Good Received Document Not Found");
                    if (reqVO.action == VirtualMapSTOActionType.ADD)
                    {
                        var mapDisto = this.MappingDisto(stos, docItems, reqVO);
                    }
                }
                else
                {
                   if (reqVO.action == VirtualMapSTOActionType.REMOVE)
                    {
                        if(stos != null)
                        {
                            var removeSto = this.RemoveStoandDisto(stos, resDisto, reqVO);
                        }
                        
                    }
                }
               
            }
            
            return stos;

           
        }
        private List<amt_DocumentItemStorageObject> MappingDisto(StorageObjectCriteria sto, amt_DocumentItem docItem, ScanMapStoNoDoc.TReq reqVO)
        {
            var DocItemsMapStos = new List<amt_DocumentItemStorageObject>();
            var DocItemsMap = new List<amt_DocumentItemStorageObject>();

            DocItemsMap.Add(new amt_DocumentItemStorageObject()
                {
                    DocumentItem_ID = docItem.ID,
                    DocumentType_ID = DocumentTypeID.GOODS_RECEIVED,
                    WorkQueue_ID = null,
                    Sou_StorageObject_ID = sto.mapstos[0].id.Value,
                    Des_StorageObject_ID = sto.mapstos[0].id.Value,
                    Quantity = docItem.Quantity,
                    UnitType_ID = docItem.UnitType_ID.Value,
                    BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                    Status = EntityStatus.INACTIVE

                });
            DocItemsMapStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(DocItemsMap,this.BuVO);

            return DocItemsMapStos;
        }
        private List<amt_DocumentItemStorageObject> RemoveStoandDisto(StorageObjectCriteria sto, amt_DocumentItemStorageObject disto, ScanMapStoNoDoc.TReq reqVO)
        {
            //var x = AWMSEngine.ADO.StorageObjectADO.GetInstant()
            //    .Get(sto.id.Value, StorageObjectType.BASE, false, true, this.BuVO);

            var getSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new KeyValuePair<string, object>[] {
                new KeyValuePair<string,object>("ParentStorageObject_ID",sto.id),               
                  }, this.BuVO).FindAll(y=>y.EventStatus == StorageObjectEventStatus.REMOVED).Select(data=>data.ID).ToArray();

            var res = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                new SQLConditionCriteria[] {
                new SQLConditionCriteria("Sou_StorageObject_ID",string.Join(',',getSto), SQLOperatorType.IN),               
               }, this.BuVO).Find(y=>y.Status==EntityStatus.INACTIVE);

            var  updateDisto = AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(res.ID.Value, EntityStatus.REMOVE, this.BuVO);

            return null;
        }
    }
}
