using System;
using System.Collections.Generic;
using System.Text;

namespace AWMSModel.Criteria
{
    public class PDFContentCriteria
    {
        public string title;
        public string companyName;
        public List<Table> tables;

        public class Table
        {
            public float[] widths;
            public float total_width;
            public string hor_align;
            public string ver_align;
            public string def_cell_border;
            public bool locked_width;
            public List<Row> headers;
            public List<Row> bodys;
            public List<Row> footers;//เก็บผลรวมของข้อมูล
            public class Row
            {
                public List<Cell> cells;
                public class Cell
                {
                    public string text;
                    public string font_style;
                    public string font_size;
                    public float padding;
                    public float padding_bottom;
                    public float padding_left;
                    public float padding_right;
                    public float padding_top;
                    public string hor_align; 
                    public string ver_align; 
                    public string border; 
                    public List<Row> rows;
                }
            }
        }
    }
}
