using OfficeOpenXml.FormulaParsing.LexicalAnalysis;
using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class TokenCriteria
    {
        public string HeadEncode;
        public string BodyEncode;
        public string SignatureEncode;

        public TokenHead HeadDecode;
        public TokenBody BodyDecode;
        public class TokenHead
        {
            public string typ;
            public string enc;
        }
        public class TokenBody
        {
            public long uid;
            public string ucode;
            public string uname;
            public string ip;
            public DateTime exp;
            public DateTime extend;
            public long[] pms;
            public int[] pos;
        }
    }
}
