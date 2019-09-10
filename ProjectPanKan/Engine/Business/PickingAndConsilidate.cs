using AMWUtil.Exception;
using AMWUtil.Logger;
using AWMSEngine.ADO;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectPanKan.Engine.Business
{
    public class PickingAndConsilidate : BaseEngine<PickingAndConsilidate.TReq, PickingAndConsilidate.TRes>
    {
        public class TReq
        {
            public long docID;
            public string scanCode;
            public string baseConso;
            public string basePick;
            public decimal scanQty;
        }

        public class TRes
        {
            public long docID;
            public string baseConso;
            public BaseSto sto;

            public class BaseSto
            {
                public string baseCode;
                public long baseID;
                public string baseUnitCode;
                public List<PackSTO> packSTOs;

                public class PackSTO
                {
                    public string packCode;
                    public long packID;
                    public string packBaseUnitCode;
                    public decimal packBaseQty;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            var docItems = DocumentADO.GetInstant().ListItemAndDisto(reqVO.docID, this.BuVO);
            if (docItems.Count == 0)
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "Document Not Found");



            return null;
        }

        private TRes Picking(List<amt_DocumentItem> docItems, TReq reqVO, VOCriteria buVO, AMWLogger logger)
        {
            var stoScan = StorageObjectADO.GetInstant().Get(string.IsNullOrWhiteSpace(reqVO.basePick) ? reqVO.scanCode : reqVO.basePick, null, null, false, true, this.BuVO);
            var res = new TRes();
            docItems.ForEach(docItem =>
            {
                var basecode = AMWUtil.Common.ObjectUtil.QryStrGetValue(docItem.Options, "basecode");
                if (stoScan.code == basecode && stoScan.type == StorageObjectType.BASE)
                {
                    docItem.EventStatus = DocumentEventStatus.WORKED;
                    StorageObjectADO.GetInstant().UpdateStatusToChild(stoScan.id.Value, null, null, StorageObjectEventStatus.CONSOLIDATED, buVO);
                    DocumentADO.GetInstant().UpdateItemEventStatus(docItem.ID.Value, DocumentEventStatus.WORKED, buVO);

                    stoScan.mapstos.ForEach(sto =>
                    {
                        var disto = new amt_DocumentItemStorageObject()
                        {
                            DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                            DocumentItem_ID = docItem.ID.Value,
                            Sou_StorageObject_ID = sto.id.Value,
                            Des_StorageObject_ID = sto.id.Value,
                            BaseQuantity = sto.baseQty,
                            BaseUnitType_ID = sto.baseUnitID,
                            Quantity = sto.qty,
                            UnitType_ID = sto.unitID,
                        };
                        var distoRes = DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                        DocumentADO.GetInstant().UpdateMappingSTO(distoRes.ID.Value, EntityStatus.ACTIVE, buVO);
                    });



                    res = null;
                }
                else
                {
                    if (stoScan.type == StorageObjectType.BASE)
                    {
                        res = new TRes()
                        {
                            docID = docItem.Document_ID,
                            sto = new TRes.BaseSto()
                            {
                                baseCode = stoScan.code,
                                baseUnitCode = stoScan.baseUnitCode,
                                baseID = stoScan.id.Value,
                                packSTOs = stoScan.mapstos.Select(sto => new TRes.BaseSto.PackSTO() { packID = sto.id.Value, packCode = sto.code, packBaseQty = sto.baseQty, packBaseUnitCode = sto.baseUnitCode }).ToList()
                            }
                        };
                    }
                    else
                    {

                        stoScan.mapstos.ForEach(sto =>
                        {
                            var disto = new amt_DocumentItemStorageObject()
                            {
                                DocumentType_ID = DocumentTypeID.GOODS_ISSUED,
                                DocumentItem_ID = docItem.ID.Value,
                                Sou_StorageObject_ID = sto.id.Value,
                                Des_StorageObject_ID = sto.id.Value,
                                BaseQuantity = sto.baseQty,
                                BaseUnitType_ID = sto.baseUnitID,
                                Quantity = sto.qty,
                                UnitType_ID = sto.unitID,
                            };
                            var distoRes = DocumentADO.GetInstant().InsertMappingSTO(disto, buVO);
                            DocumentADO.GetInstant().UpdateMappingSTO(distoRes.ID.Value, EntityStatus.ACTIVE, buVO);
                        });




                        res = new TRes()
                        {
                            docID = docItem.Document_ID,
                            sto = new TRes.BaseSto()
                            {
                                baseCode = stoScan.code,
                                baseUnitCode = stoScan.baseUnitCode,
                                baseID = stoScan.id.Value,
                                packSTOs = stoScan.mapstos.Select(sto => new TRes.BaseSto.PackSTO() { packID = sto.id.Value, packCode = sto.code, packBaseQty = sto.baseQty, packBaseUnitCode = sto.baseUnitCode }).ToList()
                            }
                        };
                    }
                }
            });
            return res;
        }
    }
}
