using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace AWMSEngine.APIService.Report
{
    public class PankanReconcileFileServerAPI : BaseAPIService
    {
        public PankanReconcileFileServerAPI(ControllerBase controllerAPI, int apiServiceID = 0, bool isAuthenAuthorize = true) : base(controllerAPI, apiServiceID, isAuthenAuthorize)
        {
        }

        public class TRes
        {
            public List<TData> datas;
            public class TData
            {
                public string packCode;
                public string packName;
                public string warehouse;
                public decimal packQtyWMS;
                public decimal packQtyERP;
                public decimal packQtyResult;
            }
        }

        protected override dynamic ExecuteEngineManual()
        {
            TRes res = new TRes();
            string fileDir = ADO.StaticValue.StaticValueManager.GetInstant().GetConfigValue("AFC_Reconcile_Path_IN");
            if (!Directory.Exists(fileDir))
                Directory.CreateDirectory(fileDir);
            string[] fileNames = Directory.GetFiles(fileDir).ToList().OrderByDescending(x => x).ToArray();
            if (fileNames.Length > 0)
            {
                using (StreamReader fs = new StreamReader(fileNames[0]))
                {
                    string wmCode = ADO.StaticValue.StaticValueManager.GetInstant().Warehouses.FirstOrDefault().Code;
                    string sqlComm = @"select pm.Code as packCode,pm.Name as packName,isnull(wm.Code,'"+ wmCode + @"') as warehouse,count(sto.id) as packQtyWMS
                                        from
	                                        ams_PackMaster pm 
	                                        left join (select * from amt_StorageObject sto where sto.ObjectType=2 and sto.Status=1) sto on pm.ID=sto.PackMaster_ID
	                                        left join ams_AreaMaster am on am.ID=sto.AreaMaster_ID
	                                        left join ams_Warehouse wm on wm.ID=am.Warehouse_ID
                                        group by pm.Code ,pm.Name ,wm.Code";
                    res.datas = ADO.DataADO.GetInstant().QueryString<TRes.TData>(sqlComm, null, this.BuVO);

                    List<dynamic> fileDatas = new List<dynamic>();
                    while (!fs.EndOfStream)
                    {
                        string line = fs.ReadLine();
                        string[] vals = line.Split('|');
                        if (!line.StartsWith("B")) continue;
                        string warehouseCode = vals[3];
                        string packCode = vals[4];
                        int qty = int.Parse(vals[5]);
                        
                        var data = res.datas.FirstOrDefault(x => x.packCode == packCode && x.warehouse == warehouseCode);
                        if (data != null)
                        {
                            data.packQtyERP = qty;
                            data.packQtyResult = data.packQtyWMS - qty;
                        }
                        else
                        {
                            res.datas.Add(new TRes.TData
                            {
                                packCode = packCode,
                                packName = string.Empty,
                                warehouse = warehouseCode,
                                packQtyERP = qty,
                                packQtyWMS = 0,
                                packQtyResult = -qty
                            });
                        }
                    }
                }
            }

            return res;
        }
    }
}
