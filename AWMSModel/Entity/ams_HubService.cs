using AWMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Entity
{
    public class ams_HubService : BaseEntitySTD
    {
        public string FullClassName;
        public string Options;
        public string Url;
        public int Revision;
        public OnOffFlag OnOff;
    }
}
