using AMWUtil.Common;
using AMWUtil.Exception;
using MigraDoc.DocumentObjectModel;
using OfficeOpenXml.FormulaParsing.Excel.Functions.Text;
using Org.BouncyCastle.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AWMSEngine.Engine.V2.Develop
{
    public class DevManagement : BaseEngine<DevManagement.TReq, DevManagement.TRes>
    {
        public class TReq
        {
            public string menu;
            public string find;
        }
        public class TRes
        {
            public List<TRow> rows;
            public class TRow
            {
                public string key;
                public string val;
                public string link;
                public TRow(string key, string val) : this(key, val, null) { }
                public TRow(string key, string val, string link)
                {
                    this.key = key;
                    this.val = val;
                    this.link = link;
                }
            }
        }

        protected override TRes ExecuteEngine(TReq reqVO)
        {
            TRes res = new TRes();

            switch (reqVO.menu.ToLower())
            {
                case "link":
                    return this.Menu_Link(reqVO.find);
                case "staticvalue":
                    return this.Menu_StaticValue(reqVO.find);
                case "loadstaticvalue":
                    return this.Menu_LoadStaticValue(reqVO.find);
                case "serverinfo":
                    return this.Menu_LoadStaticValue(reqVO.find);
                default:
                    throw new AMWException(this.Logger, AMWExceptionCode.V0_DEVMENU_NOT_FOUND);
            }
        }


        private TRes Menu_Link(string find)
        {
            TRes res = new TRes() { rows = new List<TRes.TRow>() };
            res.rows.Add(new TRes.TRow("StaticValues", "", "/dev_info?apikey=free01&menu=staticvalue"));
            res.rows.Add(new TRes.TRow("Load StaticValue", "", "/dev_info?apikey=free01&menu=loadstaticvalue"));
            res.rows.Add(new TRes.TRow("View ServerInfo", "", "/dev_info?apikey=free01&menu=serverinfo"));

            return res;            
        }
        private TRes Menu_StaticValue(string find)
        {
            TRes res = new TRes() { rows = new List<TRes.TRow>() };
            void add_row<T>(string find,List< T> datas)
            {
                if (!string.IsNullOrWhiteSpace(find) && !typeof(T).Name.Contains(find))
                    return;
                int i = 1;
                datas.ForEach(x => res.rows.Add(new TRes.TRow(typeof(T).Name + "[" + (i++) + "]", x.Json())));
            }
            add_row(find, this.StaticValue.Features);
            add_row(find, this.StaticValue.Configs);
            add_row(find, this.StaticValue.ObjectSizes);
            add_row(find, this.StaticValue.Branchs);
            add_row(find, this.StaticValue.Warehouses);
            add_row(find, this.StaticValue.AreaMasters);
            add_row(find, this.StaticValue.AreaMasterTypes);
            add_row(find, this.StaticValue.AreaRoutes);
            add_row(find, this.StaticValue.Suppliers);
            add_row(find, this.StaticValue.Customers);
            add_row(find, this.StaticValue.PackMasterTypes);
            add_row(find, this.StaticValue.PackMasterEmptyPallets);
            add_row(find, this.StaticValue.SKUMasterTypes);
            add_row(find, this.StaticValue.SKUMasterEmptyPallets);
            add_row(find, this.StaticValue.APIServices);
            add_row(find, this.StaticValue.TransportCars);
            add_row(find, this.StaticValue.UnitTypes);
            add_row(find, this.StaticValue.PackUnitConverts);
            add_row(find, this.StaticValue.BaseMasterTypes);
            add_row(find, this.StaticValue.WorkerService);
            add_row(find, this.StaticValue.ScheduleService);
            add_row(find, this.StaticValue.HubService);
            add_row(find, this.StaticValue.WaveSeqTemplates);
            add_row(find, this.StaticValue.PrintForm);
            add_row(find, this.StaticValue.PrintLayout);
            add_row(find, this.StaticValue.PrintField);

            return res;
        }

        private TRes Menu_LoadStaticValue(string find)
        {
            this.StaticValue.LoadAll();
            TRes res = new TRes() { rows = new List<TRes.TRow>() };
            res.rows.Add(new TRes.TRow("Load StaticValues Success", "", ""));
            return res;
        }

        private TRes Menu_Serverinfo(string find)
        {
            //this.BaseController.Response.
            this.StaticValue.LoadAll();
            TRes res = new TRes() { rows = new List<TRes.TRow>() };
            res.rows.Add(new TRes.TRow("Load StaticValues Success", "", ""));
            return res;
        }
    }
}
