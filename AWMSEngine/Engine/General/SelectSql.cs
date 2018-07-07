using AMWUtil.Logger;
using AWMSEngine.Common;
using AWMSModel.Entity;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AWMSEngine.Engine.General
{
    public class SelectSql : BaseEngine
    {
        public const string KEY_IN_Table = "Table";
        public const string KEY_IN_Field = "Field";
        public const string KEY_IN_Where = "Where";
        public const string KEY_IN_Group = "Group";
        public const string KEY_IN_Sort = "Sort";
        public const string KEY_IN_Skip = "Skip";
        public const string KEY_IN_Limit = "Limit";
        public const string KEY_IN_All = "All";
        public const string KEY_OUT_Result = "Status";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Table, "Table Data")]
        public RefVO<string> TableData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Field, "Field Data")]
        public RefVO<string> FieldData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Where, "Where Data")]
        public RefVO<dynamic> WhereData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Group, "Group Data")]
        public RefVO<string> GroupData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Sort, "Sort Data")]
        public RefVO<dynamic> SortData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Skip, "Skip Data")]
        public RefVO<string> SkipData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Limit, "Limit Data")]
        public RefVO<string> LimitData { get; set; }
        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_All, "All Data")]
        public RefVO<string> AllData { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Result, "Return Status")]
        public RefVO<Dictionary<string, dynamic>> OutResult { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = 0;
            var get_where = JsonConvert.SerializeObject(WhereData.Value);
            Dictionary<string, dynamic> get_where_dict = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(get_where);
            var get_sort = JsonConvert.SerializeObject(SortData.Value);
            Dictionary<string, dynamic> get_sort_dict = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(get_sort);

            //tokenModel = ADO.DataADO.GetInstant().Select(
            //        FieldData,
            //        TableData,
            //        get_where,
            //        GroupData,
            //        get_sort,
            //        SkipData,
            //        LimitData,
            //        AllData,
            //        this.Logger);

            if (tokenModel != 0)
            {
                Dictionary<string, dynamic> list = new Dictionary<string, dynamic>();
                //list.Add(get_bu.datas.Path.ToString(), get_bu.datas);
                this.OutResult.Value = list;
            }
        }
    }
}
