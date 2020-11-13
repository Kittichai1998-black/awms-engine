using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectBOTHY.Model
{
    public class ResponseFileFormat
    {
        public FileFormat.TextFileHeader header;
        public List<ResponseDetail> details = new List<ResponseDetail>();
        public FileFormat.TextFileHeader footer;

        public class ResponseDetail
        {
            public string skuType;
            public string baseType;
            public string baseCode;
            public int? quantity;
        }
    }
}
