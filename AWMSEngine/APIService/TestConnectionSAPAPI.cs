using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService
{
    public class TestConnectionSAPAPI : BaseAPIService
    {
        public override int APIServiceID()
        {
            return 87;
        }
        public TestConnectionSAPAPI(ControllerBase controllerAPI, bool isAuthenAuthorize = true) : base(controllerAPI, isAuthenAuthorize)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            List<string> res = new List<string>();
            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0001_FG_GOODS_RECEIPT(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0001_FG_GOODS_RECEIPT : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0001_FG_GOODS_RECEIPT : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0002_PACKAGE_GOODS_RECEIPT(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0002_PACKAGE_GOODS_RECEIPT : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0002_PACKAGE_GOODS_RECEIPT : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0003_CUSTOMER_RETURN(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0003_CUSTOMER_RETURN : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0003_CUSTOMER_RETURN : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0004_PLANT_STOCK_TRANSFER(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0004_PLANT_STOCK_TRANSFER : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0004_PLANT_STOCK_TRANSFER : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0008_1_DO_INFO(new ADO.SAPApi.TREQ_MMI0008_1_DO_INFO(), this.BuVO);
                res.Add("MMI0008_1_DO_INFO : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0008_1_DO_INFO : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0008_PLANT_STOCK_TRANSFER(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0008_PLANT_STOCK_TRANSFER : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0008_PLANT_STOCK_TRANSFER : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0009_CONFORM_DELIVERY_ORDER_PICK(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0009_CONFORM_DELIVERY_ORDER_PICK : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0009_CONFORM_DELIVERY_ORDER_PICK : " + ex.Message);
            }

            try
            {
                var apiRes = ADO.SAPApi.SAPInterfaceADO.GetInstant()
                    .MMI0009_CONFORM_PHYSICALCOUNT(new AWMSModel.Criteria.SAPInterfaceReturnvalues(), this.BuVO);
                res.Add("MMI0009_CONFORM_PHYSICALCOUNT : OK");
            }
            catch (Exception ex)
            {
                res.Add("MMI0009_CONFORM_PHYSICALCOUNT : " + ex.Message);
            }

            return new { datas = res };
        }
    }
}
