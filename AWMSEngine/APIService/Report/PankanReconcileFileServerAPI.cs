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
        public PankanReconcileFileServerAPI(ControllerBase controllerAPI) : base(controllerAPI)
        {
        }

        protected override dynamic ExecuteEngineManual()
        {
            string fileDir = ADO.StaticValue.StaticValueManager.GetInstant().GetConfig("AFC_Reconcile_Path_IN");
            if (Directory.Exists(fileDir))
                Directory.CreateDirectory(fileDir);
            string[] fileNames = Directory.GetFiles(fileDir).ToList().OrderByDescending(x => x).ToArray();
            if (fileNames.Length > 0)
            {
                using (StreamReader fs = new StreamReader(fileNames[0]))
                {
                    List<dynamic> fileDatas = new List<dynamic>();
                    while (!fs.EndOfStream)
                    {
                        string line = fs.ReadLine();
                        string[] vals = line.Split('|');
                        if (vals.Length == 5) continue;
                        string warehouseCode = vals[2];
                        string packCode = vals[3];
                        int qty = int.Parse(vals[4]);

                        fileDatas.Add(new { warehouseCode = warehouseCode, packCode = packCode, qty = qty });
                    }
                }
            }

            return null;
        }
    }
}
