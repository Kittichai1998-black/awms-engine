﻿using AMWUtil.Common;
using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.Engine;
using AWMSEngine.Engine.V2.Business.WorkQueue;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectMRK.Engine.Business.WorkQueue
{
    public class RegisterWorkQueue_GetDocumentItemAndDISTO : IProjectEngine<RegisterWorkQueue.TReqDocumentItemAndDISTO, List<amt_DocumentItem>>
    {
        public List<amt_DocumentItem> ExecuteEngine(AMWLogger logger, VOCriteria buVO, RegisterWorkQueue.TReqDocumentItemAndDISTO data)
        {
            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            var reqVO = data.reqVO;
            var sto = data.sto;

            var distos = new List<amt_DocumentItem>();
            var stoIDs = AWMSEngine.ADO.StorageObjectADO.GetInstant().ListPallet(reqVO.baseCode, buVO).Select(x => x.ID.Value).ToList();

            var docs = AWMSEngine.ADO.DocumentADO.GetInstant().ListBySTO(stoIDs, DocumentTypeID.GOODS_RECEIVED, buVO);
            var pack = sto.ToTreeList().FindAll(x => x.type == StorageObjectType.PACK).FirstOrDefault();

            var souWarehouse = StaticValue.Warehouses.FirstOrDefault(x => x.Code == reqVO.warehouseCode);
            if (souWarehouse == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V2001, "Warehouse " + reqVO.warehouseCode + " NotFound");
            }

            docs.ForEach(x =>
            {
                var docItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItemAndDisto(x.ID.Value, buVO);
                if (x.DocumentType_ID != DocumentTypeID.GOODS_RECEIVED)
                {
                    docItems.ForEach(docItem =>
                    {
                        var disto = new amt_DocumentItemStorageObject
                        {
                            ID = null,
                            DocumentItem_ID = null,
                            Sou_StorageObject_ID = pack.id.Value,
                            Des_StorageObject_ID = pack.id.Value,
                            Quantity = 0,
                            BaseQuantity = 0,
                            UnitType_ID = pack.unitID,
                            BaseUnitType_ID = pack.baseUnitID,
                            Status = EntityStatus.ACTIVE
                        };

                        AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                        docItem.DocItemStos = new List<amt_DocumentItemStorageObject> { disto };
                    });
                }
                distos.AddRange(docItems);

            });

            if (distos == null)
            {
                throw new AMWException(logger, AMWExceptionCode.V1001, "Document of Base Code '" + reqVO.baseCode + "' Not Found");
            }

            return distos;
        }
    }
}
