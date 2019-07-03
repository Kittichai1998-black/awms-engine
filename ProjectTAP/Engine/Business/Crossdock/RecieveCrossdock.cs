using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Crossdock
{
    public class RecieveCrossdock : BaseEngine<RecieveCrossdock.TReq, amt_Document>
    {
        public class TReq
        {
            public string packCode;
            public decimal Quantity;
            public string Lot;
            public DateTime ProductDate;
            public string Options;
            public long GIdoc;
            public long GRdoc;
            internal DateTime? productDate;
        }
        protected override amt_Document ExecuteEngine(TReq reqVO)
        {
            var pack = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_PackMaster>(reqVO.packCode, this.BuVO);

            var GIDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(reqVO.GIdoc, this.BuVO).Where(x => x.PackMaster_ID == pack.ID.Value).FirstOrDefault();
            var GRDocItems = AWMSEngine.ADO.DocumentADO.GetInstant().ListItem(reqVO.GRdoc, this.BuVO).Where(x => x.PackMaster_ID == pack.ID.Value).FirstOrDefault();
            var stos = CreateStorageObject(pack, reqVO);

            if (GRDocItems.Quantity < reqVO.Quantity)
                throw new AMWException(this.Logger, AMWExceptionCode.B0001, "Pallet Item Not Equal Document");

            amt_DocumentItemStorageObject recvDisto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                DocumentItem_ID = GRDocItems.ID.Value,
                Sou_StorageObject_ID = stos.id.Value,
                Des_StorageObject_ID = stos.id.Value,
                Quantity = stos.baseQty,
                BaseQuantity = GRDocItems.Quantity.Value,
                UnitType_ID = GRDocItems.BaseUnitType_ID.Value,
                BaseUnitType_ID = GRDocItems.BaseUnitType_ID.Value,
                Status = EntityStatus.ACTIVE
            };

            AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(recvDisto, this.BuVO);
            amt_DocumentItemStorageObject pickingDisto = new amt_DocumentItemStorageObject();
            pickingDisto = new amt_DocumentItemStorageObject()
            {
                ID = null,
                DocumentItem_ID = GIDocItems.ID.Value,
                Sou_StorageObject_ID = stos.id.Value,
                Des_StorageObject_ID = stos.id.Value,
                Quantity = stos.baseQty,
                BaseQuantity = GRDocItems.Quantity.Value,
                UnitType_ID = GRDocItems.BaseUnitType_ID.Value,
                BaseUnitType_ID = GRDocItems.BaseUnitType_ID.Value,
                Status = EntityStatus.ACTIVE
            };

            stos.qty = 0;
            stos.baseQty = 0;

            AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(stos, this.BuVO);

            AWMSEngine.ADO.DocumentADO.GetInstant().InsertMappingSTO(pickingDisto, this.BuVO);

            if (stos.baseQty == GRDocItems.BaseQuantity)
            {
                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.GRdoc, null, null, DocumentEventStatus.CLOSED, this.BuVO);
            }
            else
            {
                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.GRdoc, null, null, DocumentEventStatus.WORKING, this.BuVO);
            }

            var chkDoc = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_Document>(new SQLConditionCriteria[]
            {
                new SQLConditionCriteria("ParentDocument_ID", reqVO.GIdoc, SQLOperatorType.EQUALS)
            }, this.BuVO);

            if(chkDoc.TrueForAll(x => x.EventStatus == DocumentEventStatus.CLOSED))
            {
                AWMSEngine.ADO.DocumentADO.GetInstant().UpdateStatusToChild(reqVO.GIdoc, null, null, DocumentEventStatus.CLOSED, this.BuVO);
            }

            return AWMSEngine.ADO.DocumentADO.GetInstant().Get(reqVO.GIdoc, this.BuVO);
        }

        private StorageObjectCriteria CreateStorageObject(ams_PackMaster pack, RecieveCrossdock.TReq reqVO)
        {
            var getBase = AWMSEngine.ADO.DataADO.GetInstant().SelectByCodeActive<ams_BaseMaster>("DUMMY00000", this.BuVO);

            var objSizeBase = StaticValue.ObjectSizes.FirstOrDefault(x => x.ID == getBase.ObjectSize_ID);
            var objSizePack = StaticValue.ObjectSizes.FirstOrDefault(x => x.ObjectType == StorageObjectType.PACK);

            StorageObjectCriteria recvBaseSto = new StorageObjectCriteria()
            {
                code = getBase.Code,
                eventStatus = StorageObjectEventStatus.PICKING,
                name = getBase.Name,
                qty = 1,
                unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == getBase.UnitType_ID).Code,
                unitID = getBase.UnitType_ID,
                baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == getBase.UnitType_ID).Code,
                baseUnitID = getBase.UnitType_ID,
                baseQty = 1,
                objectSizeID = objSizeBase.ID.Value,
                type = StorageObjectType.BASE,
                mstID = getBase.ID.Value,
                objectSizeName = objSizeBase.Name,
            };
            var stoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(recvBaseSto, this.BuVO);
            var recvSto = new StorageObjectCriteria()
            {
                parentID = stoID,
                parentType = StorageObjectType.BASE,
                code = pack.Code,
                eventStatus = StorageObjectEventStatus.PICKING,
                name = pack.Name,
                batch = null,
                qty = reqVO.Quantity,
                skuID = pack.SKUMaster_ID,
                unitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == pack.UnitType_ID).Code,
                unitID = pack.UnitType_ID,
                baseUnitCode = StaticValue.UnitTypes.FirstOrDefault(x => x.ID == pack.UnitType_ID).Code,
                baseUnitID = pack.UnitType_ID,
                baseQty = reqVO.Quantity,
                objectSizeID = objSizePack.ID.Value,
                type = StorageObjectType.PACK,
                productDate = reqVO.productDate,
                objectSizeName = objSizePack.Name,
                mstID = pack.ID
            };
            var childStoID = AWMSEngine.ADO.StorageObjectADO.GetInstant().PutV2(recvSto, this.BuVO);

            var stos = AWMSEngine.ADO.StorageObjectADO.GetInstant().Get(childStoID, StorageObjectType.PACK, false, true, this.BuVO);

            return stos;
        }
    }
}
