using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Business.Issued;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Bussiness.WorkQueue
{
    public class FastMoveQueue: IEval
    {
        public bool exec(dynamic data)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();

            //var str = "return FeatureExecute.EvalExec(\"ProjectMRK.Engine.Bussiness.WorkQueue.FastMoveQueue\", new { baseCode = reqVO.baseCode, buVO = this.BuVO, logger = this.Logger });";
            List<amt_StorageObject> stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(data.baseCode.ToString(), (VOCriteria)data.buVO).ToList();

            List<amt_Document> docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs.Select(x => x.ID.Value).ToList(), (VOCriteria)data.buVO);
            var fastMove = docs.TrueForAll(x => x.MovementType_ID == MovementType.FG_FASTMOVE);
            if (fastMove)
            {
                List<amt_StorageObject> locationGateFast = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[]{
                new SQLConditionCriteria("ObjectType", StorageObjectType.BASE, SQLOperatorType.EQUALS),
                new SQLConditionCriteria("AreaMaster_ID", 4, SQLOperatorType.EQUALS),
            }, (VOCriteria)data.buVO);
                if (locationGateFast.Count() > 1)
                {
                    return false;
                }
                else
                {
                    CreateGIDocument(docs, stoIDs, data.logger, (VOCriteria)data.buVO);
                    return true;
                }
            }
            else
            {
                return false;
            }
        }
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


        }
    }
}
