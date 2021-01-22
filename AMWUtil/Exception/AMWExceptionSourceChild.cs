using AMWUtil.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AMWUtil.Exception
{
    public class AMWExceptionSourceChild
    {
        private string _SourceFile { get; set; }
        public string SourceFile { get => this._SourceFile; }
        private int _LineNumber { get; set; }
        public int LineNumber { get => this._LineNumber; }

        public AMWExceptionSourceChild(System.Exception ex)
        {
            var st_arr = ex.StackTrace.Split('\n');
            var st = st_arr[st_arr.Length - 2];
            this._SourceFile = st.Substring(0, st.LastIndexOf(' ')).Trim();
            try
            {

                this._LineNumber = st.Substring(st.LastIndexOf(' ')).Trim().Get<int>();
            }
            catch
            {
                this._LineNumber = -1;
            }
        }
    }
}
