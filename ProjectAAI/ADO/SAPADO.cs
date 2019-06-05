using SAP.Middleware.Connector;
using SAP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using System.Runtime.InteropServices;

namespace ProjectAAI.ADO
{
    public static class SAPADO 
    {
        public class ZSWMRF001_OUT_SU
        {
            /// <summary>Warehouse Code</summary>
            public string LGNUM;
            /// <summary>Storage Type</summary>
            public string LGTYP;
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
            /// <summary>Material Number</summary>
            public string MATNR;
            /// <summary>Batch Number</summary>
            public string CHARG;
            /// <summary>Stock Category</summary>
            public string BESTQ;
            /// <summary>Available Stock</summary>
            public decimal VERME;
            /// <summary>Base Unit of Measure</summary>
            public string MEINS;
            /// <summary>Date of Manufacture</summary>
            public DateTime HSDAT;
            /// <summary>Incubated Time</summary>
            public int WEBAZ;
            /// <summary>Gross Weight</summary>
            public decimal BRGEW;
            /// <summary>Weight Unit</summary>
            public string GEWEI;
            /// <summary>approved batch number </summary>
            public DateTime FVDT1;
            /// <summary>Error message</summary>
            public string ERR_MSG; 
        }

        public class ZSWMRF001_IN_SU
        {
            /// <summary>Warehouse Number </summary>
            public string LGNUM = "W01";
            /// <summary>Storage Unit Number</summary>
            public string LENUM;
        }

        private static void SetValues(IRfcStructure inDatas, object inModel)
        {
            var fs = inModel.GetType().GetFields();
            foreach (var f in fs)
            {
                inDatas.SetValue(f.Name, f.GetValue(inModel));
            }
        }

        private static T GetValues<T>(IRfcStructure outDatas)
            where T : new()
        {
            T res = new T();
            var fs = new T().GetType().GetFields();
            foreach (var f in fs)
            {
                f.SetValue(res, outDatas.GetValue(f.Name));
            }
            return res;
        }

        [DllImport("sapnco.dll")]
        public static extern void RegisterDestination(IDestinationConfiguration config);

        public static List<ZSWMRF001_OUT_SU> ERP_RECIEVING_STORAGE(object reqVO)
        {
            RegisterDestination(new CLS_CSAP());
            RfcDestinationManager.RegisterDestinationConfiguration(new CLS_CSAP());
            var SAPDes = RfcDestinationManager.GetDestination("");
            var SAPRep = SAPDes.Repository;
            var ZWMRF001 = SAPRep.CreateFunction("ZWMRF001");
            var Metadata_IN = SAPRep.GetStructureMetadata("ZSWMRF001_IN_SU");
            var IN_SU = Metadata_IN.CreateStructure();
            var T_IN_SU = ZWMRF001.GetTable("IN_SU");
            SetValues(IN_SU, new ZSWMRF001_IN_SU()
            {
                LGNUM = reqVO.GetType().GetProperty("warehouseCode").GetValue(reqVO).ToString(),
                LENUM = reqVO.GetType().GetProperty("palletCode").GetValue(reqVO).ToString()
            });

            T_IN_SU.Append(IN_SU);
            ZWMRF001.Invoke(SAPDes);
            var SAPdt = ZWMRF001.GetTable("OUT_SU");
            List<ZSWMRF001_OUT_SU> res = new List<ZSWMRF001_OUT_SU>();
            foreach (var row in SAPdt)
            {
                res.Add(GetValues<ZSWMRF001_OUT_SU>(row));
            }

            RfcDestinationManager.UnregisterDestinationConfiguration(new CLS_CSAP());
            return res;
        }
    }
}
