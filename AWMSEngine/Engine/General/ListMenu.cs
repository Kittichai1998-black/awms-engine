using AWMSEngine.Common;
using AWMSModel.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Dynamic;

namespace AWMSEngine.Engine.General
{
    public class ListMenu : BaseEngine
    {
        public const string KEY_IN_Token = "Token";
        public const string KEY_OUT_Result = "Result";

        [EngineParamAttr(EngineParamAttr.InOutType.Request, KEY_IN_Token, "Token Data")]
        public RefVO<string> GetToken { get; set; }

        [EngineParamAttr(EngineParamAttr.InOutType.Response, KEY_OUT_Result, "Return List")]
        public RefVO<List<MenuGroup>> Result { get; set; }

        protected override void ExecuteEngine()
        {
            var tokenModel = ADO.UserInterfaceADO.GetInstant().ListMenu(GetToken.Value, this.Logger);
            List<MenuPage> pagelist;
            List<MenuGroup> menugroup = new List<MenuGroup>();

            var getheader = tokenModel.GroupBy(x => x.ID).Select(grp => grp.First()).ToList();
            var getdata = tokenModel.GroupBy(x => x.ID).Select(grp => grp.ToList()).ToList();

            foreach(var row in getheader)
            {
                menugroup.Add(new MenuGroup() { ID = row.ID, Seq = row.Seq, Name = row.Name, Description = row.Description, WebPages = null });
            }


            foreach (var rows in getdata)
            {
                pagelist = new List<MenuPage>();

                int GroupID = 0;

                foreach (var row in rows )
                {
                    pagelist.Add(new MenuPage()
                    {
                        GroupID = row.WebPageGroup_ID,
                        pageSeq = row.pageSeq,
                        pageName = row.pageName,
                        pageDesc = row.pageDesc,
                        pageID = row.pageID,
                        PathLV1 = row.PathLV1,
                        PathLV2 = row.PathLV2,
                        PathLV3 = row.PathLV3
                    });

                    GroupID = row.WebPageGroup_ID;
                }

                foreach(var edt in menugroup.Where(x => x.ID == GroupID))
                {
                    edt.WebPages = pagelist;
                }

            }

            Result.Value = menugroup;
        }

    }
}
