using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Model
{
    public class FileFormat
    {
        public class TextFileHeader
        {
            public string prefix;
            public string command;
            public string commandNo;
            public int? rowCount;
            public string timestamp;
        }
        public class ItemDetail
        {
            public string skuType;
            public string baseType;
            public string baseCode;
            public decimal? price;
            public string category;
            public string type;
            public string owner;
            public string cashcenter;
            public DateTime? receiveDate;
            public decimal? quantity;
            public string stationIn;
            public string stationOut;
        }
    }
}
