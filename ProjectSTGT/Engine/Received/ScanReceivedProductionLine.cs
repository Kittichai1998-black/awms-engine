using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Common;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
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
            var resDisto = new amt_DocumentItemStorageObject();

            if (reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                var getBase = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_BaseMaster>(
                       new SQLConditionCriteria[] {
                       new SQLConditionCriteria("Code",reqVO.scanCode, SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("Status", EntityStatus.ACTIVE,  SQLOperatorType.EQUALS),
                      }, this.BuVO).FirstOrDefault();

                if (getBase == null) //เป็น pack
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Please scan pallet fro remove");


            }
            var stos = new ScanMapStoNoDoc().Execute(Logger, BuVO, reqVO);

            if (stos != null)
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
            if (reqVO.rootID != null)
            {
                if (resDisto == null) //ไม่มี disto
                {
                    var docItems = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItem>(
                       new SQLConditionCriteria[] {
                       new SQLConditionCriteria("OrderNo",reqVO.orderNo, SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("Code",reqVO.scanCode, SQLOperatorType.EQUALS),
                       new SQLConditionCriteria("EventStatus","10,11",SQLOperatorType.IN),
                       new SQLConditionCriteria("Options","%"+reqVO.options+"%", SQLOperatorType.LIKE),
                     }, this.BuVO).FirstOrDefault();

                    if (docItems == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Good Received Document Not Found");

                    //Update Qty and Options
                    var doneDes = ObjectUtil.QryStrGetValue(docItems.Options, "status");

                    var doneDesStatus = this.getDoneStatus(doneDes);

                    stos.mapstos[0].qty = docItems.Quantity.Value;
                    stos.mapstos[0].baseQty = docItems.BaseQuantity.Value;
                    var _carton_no = ObjectUtil.QryStrGetValue(reqVO.options, "carton_no");
                    var saleorder = ObjectUtil.QryStrGetValue(docItems.Options, "saleorder");
                    var strCNoptions = _carton_no + "-" + ((Int32.Parse(_carton_no) + Decimal.ToInt32(docItems.Quantity.Value)) - 1).ToString();
                    var optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(stos.mapstos[0].options, OptionVOConst.OPT_CARTON_NO, strCNoptions);
                    optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, "saleorder", saleorder);
                    optionsNew = AMWUtil.Common.ObjectUtil.QryStrSetValue(optionsNew, OptionVOConst.OPT_DONE_DES_EVENT_STATUS, doneDesStatus);

                    stos.mapstos[0].options = optionsNew;
                    //AMWUtil.Common.ObjectUtil.QryStrSetValue(stos.mapstos[0].options, "carton_no", strCNoptions);
                    AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(stos.mapstos[0], this.BuVO);


                    if (reqVO.action == VirtualMapSTOActionType.ADD)
                    {
                        var mapDisto = this.MappingDisto(stos, docItems, reqVO);
                    }
                }
                else
                {
                    if (reqVO.action == VirtualMapSTOActionType.REMOVE)
                    {
                        this.RemoveDisto(reqVO);
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
                BaseQuantity = docItem.BaseQuantity,
                BaseUnitType_ID = docItem.BaseUnitType_ID.Value,
                Status = EntityStatus.INACTIVE

            });
            DocItemsMapStos = AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(DocItemsMap, this.BuVO);

            return DocItemsMapStos;
        }

        private List<amt_DocumentItemStorageObject> RemoveDisto(ScanMapStoNoDoc.TReq reqVO)
        {

            var getSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                new KeyValuePair<string, object>[] {
                new KeyValuePair<string,object>("ParentStorageObject_ID",reqVO.rootID),
                  }, this.BuVO).FindAll(y => y.EventStatus == StorageObjectEventStatus.REMOVED).Select(data => data.ID).ToArray();



            var res = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(
                   new SQLConditionCriteria[] {
                   new SQLConditionCriteria("Sou_StorageObject_ID",getSto, SQLOperatorType.EQUALS),
                  }, this.BuVO).Find(y => y.Status == EntityStatus.INACTIVE);

            var updateDisto = AWMSEngine.ADO.DocumentADO.GetInstant().UpdateMappingSTO(res.ID.Value, EntityStatus.REMOVE, this.BuVO);

            return null;
        }
        private string getDoneStatus(string statusOption)
        {
            var statusOptions = statusOption.ToLower();


            if (statusOptions == "pass")
            {
                return "12";
            }
            else if (statusOptions == "inspection" || statusOptions == "annual check")
            {
                return "98";
            }
            else if (statusOptions == "return")
            {
                return "96";
            }
            else if (statusOptions == "over stuffing")
            {
                return "97";
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document Status Not Found");
            }

        }
    }
}
