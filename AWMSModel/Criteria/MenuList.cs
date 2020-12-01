using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class GetMenu
    {
        public List<MenuGroup> WebPageGroup { get; set; }
    }

    public class MenuGroup
    {
        public int ID { get; set; }
        public int Seq { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public List<MenuPage> WebPages { get; set; }
    }

    public class MenuPage
    {
        public int GroupID { get; set; }
        public int pageID { get; set; }
        public int pageSeq { get; set; }
        public string pageName { get; set; }
        public string pageDesc { get; set; }
        public string PathLV1 { get; set; }
        public string PathLV2 { get; set; }
        public string PathLV3 { get; set; }
        public string Icon { get; set; }
        public string subIcon { get; set; }
        public bool Visible { get; set; }
    }

    public class AllMenuPage
    {
        public int ID { get; set; }
        public int Seq { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int WebPageGroup_ID { get; set; }
        public bool Visible { get; set; }
        public int pageID { get; set; }
        public int pageSeq { get; set; }
        public string pageName { get; set; }
        public string pageDesc { get; set; }
        public string PathLV1 { get; set; }
        public string PathLV2 { get; set; }
        public string PathLV3 { get; set; }
        public string Icon { get; set; }
        public string subIcon { get; set; }
    }
}
