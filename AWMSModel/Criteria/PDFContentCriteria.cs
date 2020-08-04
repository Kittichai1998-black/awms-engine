using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class PDFContentCriteria
    {
        public Head head;
        public Body body;
        public Footer footer;
        public class Head
        {
            public Table[] tables;
        }
        public class Body
        {
            public Table[] tables;
        }
        public class Footer
        {
            public Table[] tables;
        }

        public class Table
        {
            public Row[] headers;
            public Row[] bodys;
            public Row[] footers;
            public class Row
            {
                public string style;
                public Cell[] cells;
                public class Cell
                {
                    public string text;
                    public string style;
                    public Row[] rows;
                }
            }
        }
    }
}
