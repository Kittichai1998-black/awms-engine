using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Linq;

namespace AMWUtil.DataAccess
{
    public static class FilesTypeAccess
    {
        public class ExcelDataResponse
        {
            public List<TWorkSheet> worksheet;
            public class TWorkSheet
            {
                public string sheetName;
                public List<TRows> rows;
            }
            public class TRows
            {
                public List<string> cells;
            }
        }

        public static ExcelDataResponse ExcelAccess(FileInfo fileInfo)
        {
            List<ExcelDataResponse.TWorkSheet> res = new List<ExcelDataResponse.TWorkSheet>();
            using (var excel = new ExcelPackage(fileInfo))
            {
                var workbook = excel.Workbook;
                var worksheets = workbook.Worksheets;

                foreach(var worksheet in worksheets)
                {
                    ExcelDataResponse.TWorkSheet ws = new ExcelDataResponse.TWorkSheet();
                    ws.rows = new List<ExcelDataResponse.TRows>();
                    ws.sheetName = worksheet.Name;

                    var cols = worksheet.Dimension.Columns;
                    var rows = worksheet.Dimension.Rows;

                    for (int i = 1; i <= rows; i++)
                    {
                        List<string> cells = new List<string>();
                        for (int j = 1; j <= cols; j++)
                        {
                            string content = worksheet.Cells[i, j].Text;
                            cells.Add(content);
                        }
                        ws.rows.Add(new ExcelDataResponse.TRows() { cells = cells });
                    }
                    res.Add(ws);
                }
            }
            
            return new ExcelDataResponse() { worksheet= res };//new List<T>();
        }
    }
}
