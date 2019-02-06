using AMWUtil.Exception;
using AWMSModel.Constant.EnumConst;
using AWMSModel.Criteria;
using AWMSModel.Criteria.SP.Response;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.Business
{
    public class CheckSendToSAP : BaseEngine<CheckSendToSAP.TReq, CheckSendToSAP.TRes>
    {

        public class TReq
        {
            public string type ;

        }
        public class TRes
        {
            public string massage;
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {

            var Returnvalues = new SAPInterfaceReturnvalues()
            {
                GOODSMVT_HEADER = new SAPInterfaceReturnvalues.header()
                {

                },
                GOODSMVT_ITEM = new List<SAPInterfaceReturnvalues.items>()
            };

            ADO.SAPApi.TREQ_MMI0008_1_DO_INFO tReq = new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO()
            {
                HEADER_DATA = new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO.THeader()
                {
                    DELIV_NUMB = "",
                    DELIV_ITEM = ""
                 }
            };




            if (reqVO.type == "01" ) {

             var xx=   ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0001_FG_GOODS_RECEIPT(Returnvalues, this.BuVO);
                var a = xx;
            }else if (reqVO.type == "02")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0002_PACKAGE_GOODS_RECEIPT(Returnvalues, this.BuVO);
            }
            else if (reqVO.type == "03")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0003_CUSTOMER_RETURN(Returnvalues, this.BuVO);
            }else if (reqVO.type == "04")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0004_PLANT_STOCK_TRANSFER(Returnvalues, this.BuVO);
            }
            else if (reqVO.type == "08")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0008_PLANT_STOCK_TRANSFER(Returnvalues, this.BuVO);
            }
            else if (reqVO.type == "081")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0008_1_DO_INFO(tReq, this.BuVO);
            }
            else if (reqVO.type == "09")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0009_CONFORM_DELIVERY_ORDER_PICK(Returnvalues, this.BuVO);
            }
            else if (reqVO.type == "092")
            {
                ADO.SAPApi.SAPInterfaceADO.GetInstant().MMI0009_CONFORM_PHYSICALCOUNT(Returnvalues, this.BuVO);
            }
            else
            {
                throw new AMWException(this.Logger, AMWExceptionCode.V1001, "ไม่มีรหัส SAP นี้" );
            }

            return null;
        }
    }
}
