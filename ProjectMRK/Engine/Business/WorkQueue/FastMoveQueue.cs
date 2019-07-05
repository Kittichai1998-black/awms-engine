using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class FastMoveQueue: IProjectEngine<RegisterWorkQueue.TReqDocumentItemAndDISTO, SPOutAreaLineCriteria>
    {
        private ams_AreaMaster _OFArea;

        public SPOutAreaLineCriteria ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var reqVO = data.reqVO;
            StorageObjectCriteria sto = data.sto;
            var desLocations = AWMSEngine.ADO.AreaADO.GetInstant().ListDestinationArea(reqVO.ioType, sto.areaID.Value, sto.parentID, buVO);

            if (reqVO.areaCode == "IP" || reqVO.areaCode == "IR")
            {
                this._OFArea = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<ams_AreaMaster>("Code", "OF", buVO ?? new VOCriteria()).FirstOrDefault();

                if (checkFastMove(reqVO.baseCode, logger, buVO))
                {
                    return desLocations.Where(x => x.Des_AreaMaster_ID == _OFArea.ID).FirstOrDefault();
                }
                else
                {
                    return desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
                }
            }
            return desLocations.OrderByDescending(x => x.DefaultFlag).FirstOrDefault();
        }

        public bool checkFastMove(string baseCode, AMWLogger logger, VOCriteria buVO)
        {
            List<amt_StorageObject> stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(baseCode, buVO);

            List<amt_Document> docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs.Select(x => x.ID.Value).ToList(), DocumentTypeID.GOODS_RECEIVED, buVO);
            if(docs == null || docs.Count() == 0)
                throw new AMWException(logger, AMWExceptionCode.V1001, "Document of Base Code: '" + baseCode + "' Not Found");

            var fastMove = docs.TrueForAll(x => x.MovementType_ID == MovementType.FG_FAST_TRANSFER_WM);
            if (fastMove)
            {
                List<amt_StorageObject> locationGateFast = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                    new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("AreaMaster_ID", _OFArea.ID, SQLOperatorType.EQUALS),
                    new SQLConditionCriteria("Status", EntityStatus.ACTIVE, SQLOperatorType.EQUALS),
                }, buVO);

                if (locationGateFast.Count() > 1)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            else
            {
                return false;
            }
        }

        /*
         * CreateGIDocument(docs, stoIDs, logger, buVO);
        private void CreateGIDocument(List<amt_Document> docs, List<amt_StorageObject> sto, AMWLogger logger, VOCriteria buVO)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            var mapsto = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(sto[0].ID.Value, StorageObjectType.PACK, false, false, buVO);
            foreach (var document in docs)
            {
                var doc = new CreateGIDocument().Execute(logger, buVO,
                    new CreateGIDocument.TReq
                    {
                        parentDocumentID = document.ID,
                        refID = null,
                        ref1 = null,
                        ref2 = null,
                        souBranchID = document.Des_Branch_ID,
                        souWarehouseID = document.Des_Warehouse_ID,
                        souAreaMasterID = document.Des_AreaMaster_ID,
                        //desBranchID = StaticValue.Warehouses.First(x => x.ID == mapsto.warehouseID).Branch_ID,
                        //desWarehouseID = sto.warehouseID,
                        desAreaMasterID = null,
                        movementTypeID = MovementType.FG_FASTMOVE,
                        //orderNo = packH.orderNo,
                        lot = null,
                        batch = null,
                        documentDate = DateTime.Now,
                        actionTime = DateTime.Now,
                        eventStatus = DocumentEventStatus.NEW,
                        issueItems = new List<CreateGIDocument.TReq.IssueItem>() {
                            new CreateGIDocument.TReq.IssueItem
                            {
                                packCode = mapsto.code,
                                quantity = null,
                                unitType = mapsto.unitCode, //StaticValue.UnitTypes.First(x => x.ID == mapsto.UnitType_ID).Code,
                                batch = null,
                                lot = null,
                                orderNo = mapsto.orderNo,
                                ref2 = null,
                                options = mapsto.options,
                                eventStatus = DocumentEventStatus.NEW,
                                docItemStos = new List<amt_DocumentItemStorageObject>() { ConverterModel.ToDocumentItemStorageObject(mapsto) }

                            }}

                    });
            }


        }*/
    }
}
