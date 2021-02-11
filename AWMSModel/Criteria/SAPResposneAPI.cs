using System;
using System.Collections.Generic;
using System.Text;

namespace AMSModel.Criteria
{
    public class SAPResposneAPI
    {
        public List<items> @return;
        public string docstatus;
        public string doc_year;
        public string mat_doc;
        public class items
        {
            public string type;
            public string id;
            public string number;
            public string message;
            public string log_no;
            public string log_msg_no;
            public string message_v1;
            public string message_v2;
            public string message_v3;
            public string message_v4;
            public string parameter;
            public string row;
            public string field;
            public string system;

        }



    }
}
