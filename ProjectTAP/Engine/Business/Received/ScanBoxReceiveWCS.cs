using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AMWUtil.Exception;
using AWMSEngine.Engine.V2.Business;
using AWMSEngine.Engine.V2.Validation;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Entity;

namespace ProjectTAP.Engine.Business.Received
{
    public class ScanBoxReceiveWCS : AWMSEngine.Engine.BaseEngine<ScanBoxReceiveWCS.TReq, ScanBoxReceiveWCS.TRes>
    {
        public class TReq
        {
            public string code;
            public string prodDate;
            public long qty;
            public string lot;
            public string itemNo;
            public string baseCode;

        }
        public class TRes
        {
            //public long areaID;
            //public long areaLocationID;
            //public string areaCode;
            //public string areaLocationCode;
        }
        protected override TRes ExecuteEngine(TReq reqVO)
        {
            if (reqVO.code == "" || string.IsNullOrEmpty(reqVO.code) || reqVO.code.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "SKU is null");

            if (reqVO.qty == 0 || reqVO.qty.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Quantity is null");

            if (reqVO.itemNo == "" || string.IsNullOrEmpty(reqVO.itemNo) || reqVO.itemNo.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "ItemNo is null");

            if (reqVO.prodDate.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "Product date is null");

            if (reqVO.baseCode == "" || string.IsNullOrEmpty(reqVO.baseCode) || reqVO.baseCode.Equals(null))
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "baseCode is null");

            //var doc = AWMSEngine.ADO.DataADO.GetInstant().SelectByID<amt_DocumentItem>(12434, this.BuVO);
            //var docDate = doc.ProductionDate;
            
            var date =   Convert.ToDateTime(reqVO.prodDate);
            var diList = ADO.DocumentADO.GetInstant().ListDocsItemCheckRerigter(reqVO.code, date, reqVO.qty, reqVO.itemNo, this.BuVO);




            if (diList.Count > 0)
            {
                var getStoResult = this.getSto(reqVO);

            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1002, "No SKU waiting to be received");
            }
            return null;
        }

        private List<amt_StorageObject> getSto(TReq reqVO)
        {
            List<amt_StorageObject> baseStoReturn = new List<amt_StorageObject>();

            var baseSto = AWMSEngine.ADO.DataADO.GetInstant().SelectBy<amt_StorageObject>(
                  new SQLConditionCriteria[] {
                                    new SQLConditionCriteria("Code",reqVO.baseCode, SQLOperatorType.EQUALS),
                  },
                  new SQLOrderByCriteria[] { }, null, null, this.BuVO);
            
                    if (baseSto.Count > 0)
                    {
                        //มีกล่องในระบบ
                        baseStoReturn = baseSto;

                    }
                    else
                    {
                        //ไม่มีกล่องในระบบ
                        //New

                        var reqScan = new ScanMapStoNoDoc.TReq()
                        {
                            rootID = Convert.ToInt64(reqVO.baseCode),
                            scanCode = skuItem.Code,
                            orderNo = orderNo,
                            batch = null,
                            lot = null,
                            amount = 1,
                            unitCode = this.StaticValue.UnitTypes.Find(un => un.ID == skuItem.UnitType_ID).Code,
                            productDate = null,
                            warehouseID = this.StaticValue.AreaMasters.Find(ar => ar.ID == reqVO.areaID).Warehouse_ID,
                            areaID = reqVO.areaID,
                            options = newOptions,
                            isRoot = false,
                            mode = VirtualMapSTOModeType.REGISTER,
                            action = VirtualMapSTOActionType.ADD
                        };

            }
                    return baseStoReturn;
        }
    }
}
