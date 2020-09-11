using AMWUtil.Common;
using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Constant.StringConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static AWMSEngine.Engine.V2.General.GetDocByQRCode;

namespace AWMSEngine.Engine.V2.Business
{
    public class GetPickedDetail : BaseEngine<GetPickedDetail.TReq, GetPickedDetail.TRes>
    {
        public class TReq
        {
            public string qr;

        }
        public class TRes
        {
            public List<PackSto> pstos;
        }
        public class PackSto
        {
            public long pstoID;
            public string pstoCode;
            public string pstoName;
            public string batch;
            public string lot;
            public string orderNo;
            public string itemNo;
            public string refID;
            public string ref1;
            public string ref2; 
            public string ref3;
            public string ref4;
            public string cartonNo;
            public long? forCustomerID;
            public string forCustomerName;
            public string options;
            public decimal qty;
            public string unitCode; 
            public AuditStatus? auditStatus;
            public DateTime? expiryDate;
            public DateTime? incubationDate;
            public DateTime? shlefLifeDate;
            public DateTime? productDate;

            public string destination;
            public string remark;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();


            var StaticValue = AWMSEngine.ADO.StaticValue.StaticValueManager.GetInstant();
            if (reqVO.qr == null || reqVO.qr == "undefined")
                throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");
            if (reqVO.qr.StartsWith("N|"))
            {
                var qrModel = ObjectUtil.ConvertTextFormatToModel<QR>(reqVO.qr, "N|{numPalelt}|{dociID}|{qty}|{tag}");

                if (qrModel == null)
                    throw new AMWException(this.Logger, AMWExceptionCode.V3001, "QR Code invalid");

                List<long> dociID = qrModel.dociID.Split(',').Select(long.Parse).ToList();
                List<string> tag = qrModel.tag.Split(',').ToList();
                var getpstos = new List<PackSto>();

                tag.ForEach(x => {
                    var optTag = AMWUtil.Common.ObjectUtil.QryStrSetValue(
                       null, new KeyValuePair<string, object>(OptionVOConst.OPT_TAG_NO, x));
                    var packpicked = ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("EventStatus", StorageObjectEventStatus.PICKED, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Options", "%"+optTag+"%", SQLOperatorType.LIKE),
                    }, this.BuVO).FirstOrDefault();
                    if(packpicked != null)
                    {
                        var disto = ADO.DataADO.GetInstant().SelectBy<amt_DocumentItemStorageObject>(new SQLConditionCriteria[] {
                            new SQLConditionCriteria("Des_StorageObject_ID", packpicked.ID.Value, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("DocumentType_ID", DocumentTypeID.PICKING, SQLOperatorType.EQUALS),
                            new SQLConditionCriteria("Status", EntityStatus.DONE, SQLOperatorType.EQUALS),
                        }, this.BuVO).FirstOrDefault();
                        var docitem = ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(disto.DocumentItem_ID.Value, this.BuVO);
                        var doc = ADO.DataADO.GetInstant().SelectByID<amt_Document>(docitem.Document_ID, this.BuVO);

                        string des_warehouse = "", des_customer = "", des_suplier = "";
                        if (doc.Des_Warehouse_ID != null)
                            des_warehouse = this.StaticValue.Warehouses.FirstOrDefault(y => y.ID == doc.Des_Warehouse_ID).Name;
                        if (doc.Des_Customer_ID != null)
                            des_customer = this.StaticValue.Customers.FirstOrDefault(y => y.ID == doc.Des_Customer_ID).Name;
                        if (doc.Des_Supplier_ID != null)
                            des_suplier = this.StaticValue.Suppliers.FirstOrDefault(y => y.ID == doc.Des_Supplier_ID).Name;
                        string forCustomerName = "";
                        if (packpicked.For_Customer_ID !=null)
                            forCustomerName = ADO.DataADO.GetInstant().SelectByID<ams_Customer>(packpicked.For_Customer_ID, this.BuVO).Name;

                        getpstos.Add(new PackSto() {
                            pstoID = packpicked.ID.Value,
                            pstoCode = packpicked.Code,
                            pstoName = packpicked.Name,
                            batch = packpicked.Batch,
                            lot = packpicked.Lot,
                            orderNo = packpicked.OrderNo,
                            itemNo = packpicked.ItemNo,
                            refID = packpicked.RefID,
                            ref1 = packpicked.Ref1,
                            ref2 = packpicked.Ref2,
                            ref3 = packpicked.Ref3,
                            ref4 = packpicked.Ref4,
                            cartonNo = packpicked.CartonNo,
                            forCustomerID = packpicked.For_Customer_ID,
                            forCustomerName = forCustomerName,
                            options = packpicked.Options,
                            qty = packpicked.Quantity,
                            unitCode = StaticValue.UnitTypes.First(x => x.ID == packpicked.UnitType_ID).Code,
                            expiryDate = packpicked.ExpiryDate,
                            productDate = packpicked.ProductDate,
                            incubationDate = packpicked.IncubationDate,
                            shlefLifeDate = packpicked.ShelfLiftDate,
                            auditStatus = packpicked.AuditStatus,
                            destination = des_warehouse != "" ? des_warehouse : des_customer != "" ? des_customer : des_suplier == "" ? des_suplier : null,
                            remark = doc.Remark,
                        });
                    }
                });
                res.pstos = getpstos;
            }

            return res;
        }
    }
}
