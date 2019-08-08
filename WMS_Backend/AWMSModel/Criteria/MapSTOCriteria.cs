using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class MapSTOCriteria
    {
        public int id;
        public int type;
        public string code;
        public string description;
        public decimal minChild;
        public decimal maxChild;
        public bool isFocus;
        public List<KeyValuePair<string, string>> options;
        public List<MapSTOCriteria> mapstos;
    }
}
