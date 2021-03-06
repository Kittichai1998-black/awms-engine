using ADO.WMSDB;
using ADO.WMSStaticValue;
using AMWUtil.DataAccess;
using AMWUtil.Exception;
using AWMSEngine.Engine;
using AWMSModel.Criteria.SP.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProjectBOTHY.Engine.FileGenerate
{
    public class StockDailyReport : BaseEngine<string, string>
    {
        protected override string ExecuteEngine(string reqVO)
        {
            var dailyStock = ADO.WMSDB.DataADO.GetInstant().QuerySP<SPOutSTOwithSKUDetail>("RP_STO_WITH_SKU_DETAIL", new Dapper.DynamicParameters(), BuVO).OrderBy(x=> x.baseCode);
            var fileName = $"REPORT_{DateTime.Now.ToString("yyyyMMddhhMMss")}.txt";
            
            var details = dailyStock.Select(x => ResponseGenerate.GetStringValueFromObject(x, 0)).ToList();
            CreateFileText(details, StaticValue.GetConfigValue("ERP.FILE.File_Rpt_Path"), fileName);
            return null;
        }
        private void CreateFileText(List<string> obj, string path, string fileName)
        {
            StringBuilder _str = new StringBuilder();
            _str.Append($"START|REPORT|{DateTime.Now.ToString("yyyyMMddhhMMss")}");
            obj.ForEach(x =>
            {
                _str.Append($"{Environment.NewLine}{x}");
            });
            _str.Append($"{Environment.NewLine}END|{DateTime.Now.ToString("yyyyMMddhhMMss")}|{obj.Count()}|{DateTime.Now.ToString("yyyyMMddhhMMss")}");
            LocalFileAccess.CreateTextFile(path, _str.ToString(), fileName);
        }
    }
}
