using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Business.Picking
{
    public class ScanPickingReturn : BaseEngine<ScanPickingReturn.TReq, ScanPickingReturn.TRes>
    {
        public class TReq
        {
            public long? rootID;
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
        }

        public class TRes
        {
            public StorageObjectCriteria bsto;
            public amt_Document doc;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var result = new TRes();
            var selectPalletSTO = new ScanMapStoNoDoc();

            // mvt = FG_RETURN_WM = 1091
            if (reqVO.action == VirtualMapSTOActionType.SELECT)
            {
                var resSto = ADO.StorageObjectADO.GetInstant().Get(reqVO.scanCode, reqVO.warehouseID, reqVO.areaID, reqVO.isRoot, true, this.BuVO);
                result.bsto = resSto;

                if(resSto == null)
                {
                    throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Scan Code '" + reqVO.scanCode + "' Not Found");
                }
                else
                {
                    var mapstoTree = resSto.ToTreeList();
                    var packs = mapstoTree.Where(x => x.type == StorageObjectType.PACK && x.eventStatus == StorageObjectEventStatus.NEW).ToList();
                    if(packs == null || packs.Count() == 0)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Packs of Scan Code '" + reqVO.scanCode + "' Not Found");
                    var docs = ADO.DocumentADO.GetInstant().ListBySTO(packs.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO)
                        .FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW || x.EventStatus == DocumentEventStatus.WAIT_FOR_WORKED);
                    //.FirstOrDefault(x => x.EventStatus == DocumentEventStatus.WORKING || x.EventStatus == DocumentEventStatus.NEW && x.MovementType_ID == MovementType.FG_RETURN_WM);

                    var docItems = ADO.DocumentADO.GetInstant().ListItemBySTO(packs.Select(x => x.id.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, this.BuVO);
                    if (docItems == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "DocItems of Scan Code '" + reqVO.scanCode + "' Not Found");

                    if (docs == null)
                        throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document of Scan Code '" + reqVO.scanCode + "' Not Found");
                    var distos = new List<amt_DocumentItem>();
                    distos.AddRange(ADO.DocumentADO.GetInstant().ListItemAndDisto(docs.ID.Value, this.BuVO));
                    docs.DocumentItems = distos;

                    result.doc = docs;

                }
            }
            else if(reqVO.action == VirtualMapSTOActionType.ADD)
            {
                var createPalletData = new ScanMapStoNoDoc.TReq()
                {
                    rootID = reqVO.rootID,
                    scanCode = reqVO.scanCode,
                    orderNo = reqVO.orderNo,
                    batch = reqVO.batch,
                    lot = reqVO.lot,
                    amount = reqVO.amount,
                    unitCode = reqVO.unitCode,
                    productDate = reqVO.productDate,
                    warehouseID = reqVO.warehouseID,
                    areaID = reqVO.areaID,
                    locationCode = reqVO.locationCode,
                    options = reqVO.options,
                    mode = reqVO.mode,
                    action = VirtualMapSTOActionType.ADD,
                };
                var resSto = selectPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
                result.bsto = resSto;

            }
            else if (reqVO.action == VirtualMapSTOActionType.REMOVE)
            {
                var createPalletData = new ScanMapStoNoDoc.TReq()
                {
                    rootID = reqVO.rootID,
                    scanCode = reqVO.scanCode,
                    orderNo = reqVO.orderNo,
                    batch = reqVO.batch,
                    lot = reqVO.lot,
                    amount = reqVO.amount,
                    unitCode = reqVO.unitCode,
                    productDate = reqVO.productDate,
                    warehouseID = reqVO.warehouseID,
                    areaID = reqVO.areaID,
                    locationCode = reqVO.locationCode,
                    options = reqVO.options,
                    mode = reqVO.mode,
                    action = VirtualMapSTOActionType.REMOVE,
                };
                var resSto = selectPalletSTO.Execute(this.Logger, this.BuVO, createPalletData);
                result.bsto = resSto;
            }


            /*  List<amt_DocumentItem> docItems = new List<amt_DocumentItem>();

            if(reqVO.bsto == null)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Base Code '" + reqVO.bsto.code + "' Not Found");

            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.bsto.code, this.BuVO).Select(x => x.ID.Value).ToList();

            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, DocumentTypeID.GOODS_RECEIVED, this.BuVO);




            var bmst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>("STA00001", this.BuVO);
            var bsto = StorageObjectCriteria.CreateCriteriaBase(bmst, 1, "", ADO.StaticValue.StaticValueManager.GetInstant());
            ADO.StorageObjectADO.GetInstant().PutV2(bsto, this.BuVO);

            var pmst = ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>("SKU001", this.BuVO);
            var psto = StorageObjectCriteria.CreateCriteriaPack(pmst, 1, "PC", bsto.areaID, null, null, "xxx", "car", null, null);

            bsto.mapstos.Add(psto);
            psto.parentID = bsto.id;
            psto.parentType = bsto.type;
            ADO.StorageObjectADO.GetInstant().PutV2(psto, this.BuVO);
            */



            return result;

        }
    }
}
