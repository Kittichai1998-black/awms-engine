using AMSModel.Constant.EnumConst;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Entity
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
